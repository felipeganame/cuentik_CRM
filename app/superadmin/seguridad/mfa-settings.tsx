'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Factor = { id: string; friendly_name?: string; factor_type: string; status: string };

export function MfaSettings() {
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [removingId, setRemovingId] = useState<string | null>(null);

  async function loadFactors() {
    setLoading(true);
    const supabase = createClient();
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) setError(listError.message);
    else setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  }

  useEffect(() => {
    loadFactors();
  }, []);

  async function handleEnroll() {
    setEnrolling(true);
    setError(null);
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (enrollError) {
      setError(enrollError.message);
      setEnrolling(false);
      return;
    }
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setPendingFactorId(data.id);
    setEnrolling(false);
  }

  async function handleVerify() {
    if (!pendingFactorId) return;
    setVerifying(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId: pendingFactorId, code });
    if (verifyError) {
      setError(verifyError.message);
      setVerifying(false);
      return;
    }
    setQrCode(null);
    setSecret(null);
    setPendingFactorId(null);
    setCode('');
    setVerifying(false);
    await loadFactors();
  }

  async function handleCancelEnroll() {
    if (pendingFactorId) {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: pendingFactorId });
    }
    setQrCode(null);
    setSecret(null);
    setPendingFactorId(null);
    setCode('');
  }

  async function handleRemove(factorId: string) {
    const confirmado = window.confirm('¿Desactivar la verificación en dos pasos? Tu cuenta va a quedar protegida solo por contraseña.');
    if (!confirmado) return;
    setRemovingId(factorId);
    setError(null);
    const supabase = createClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    if (unenrollError) setError(unenrollError.message);
    else await loadFactors();
    setRemovingId(null);
  }

  if (loading) return <div style={{ fontSize: 13.5, color: 'oklch(55% 0.01 255)' }}>Cargando…</div>;

  const factorVerificado = factors.find((f) => f.status === 'verified');

  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20, maxWidth: 480 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
        Verificación en dos pasos
      </div>

      {factorVerificado && !pendingFactorId && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: 'oklch(94% 0.06 150)', color: 'oklch(45% 0.13 150)' }}>
              Activa
            </span>
            <span style={{ fontSize: 13, color: 'oklch(45% 0.01 255)' }}>Autenticador (TOTP)</span>
          </div>
          <button
            type="button"
            onClick={() => handleRemove(factorVerificado.id)}
            disabled={removingId === factorVerificado.id}
            style={{ padding: '9px 14px', border: '1px solid oklch(80% 0.1 25)', borderRadius: 8, background: '#fff', color: 'oklch(56% 0.19 25)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {removingId === factorVerificado.id ? 'Desactivando…' : 'Desactivar'}
          </button>
        </div>
      )}

      {!factorVerificado && !pendingFactorId && (
        <div>
          <div style={{ fontSize: 13, color: 'oklch(45% 0.01 255)', marginBottom: 14 }}>
            No está activada. Vas a necesitar una app autenticadora (Google Authenticator, Authy, etc.) en tu teléfono.
          </div>
          <button
            type="button"
            onClick={handleEnroll}
            disabled={enrolling}
            style={{ padding: '9px 14px', border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {enrolling ? 'Generando…' : 'Activar verificación en dos pasos'}
          </button>
        </div>
      )}

      {pendingFactorId && (
        <div>
          <div style={{ fontSize: 13, marginBottom: 12 }}>1. Escaneá este código con tu app autenticadora:</div>
          {qrCode && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrCode} alt="Código QR para activar verificación en dos pasos" style={{ width: 180, height: 180, marginBottom: 12 }} />
          )}
          {secret && (
            <div style={{ fontSize: 12, color: 'oklch(50% 0.01 255)', marginBottom: 16 }}>
              O ingresá este código manualmente: <code style={{ fontFamily: 'monospace', fontWeight: 700 }}>{secret}</code>
            </div>
          )}
          <div style={{ fontSize: 13, marginBottom: 8 }}>2. Ingresá el código de 6 dígitos que te muestra la app:</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              style={{ width: 120, padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 15, letterSpacing: '0.1em', fontFamily: 'monospace' }}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || code.length !== 6}
              style={{ padding: '9px 16px', border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: verifying ? 'default' : 'pointer' }}
            >
              {verifying ? 'Verificando…' : 'Verificar y activar'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleCancelEnroll}
            style={{ marginTop: 12, border: 'none', background: 'none', color: 'oklch(55% 0.01 255)', fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Cancelar
          </button>
        </div>
      )}

      {error && <div style={{ marginTop: 12, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{error}</div>}
    </div>
  );
}
