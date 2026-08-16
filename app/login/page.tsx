'use client';

import { Suspense, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login, verifyMfaCode, type LoginState } from './actions';

const initialState: LoginState = { error: null };

function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [mfaState, mfaFormAction, mfaPending] = useActionState(verifyMfaCode, initialState);
  const searchParams = useSearchParams();
  const suspendido = searchParams.get('motivo') === 'suspendido';

  const mfaStep = state.mfaRequired || mfaState.mfaRequired;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 380, background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 14, padding: '36px 32px', boxShadow: '0 4px 24px rgba(20,20,30,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)' }} />
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.01em', fontFamily: 'Vollkorn, serif' }}>Cuentik CRM</div>
        </div>
        <div style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginBottom: 28 }}>CRM de alquileres · Córdoba</div>
        {suspendido && (
          <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)', background: 'oklch(96% 0.03 25)', border: '1px solid oklch(88% 0.06 25)', borderRadius: 8, padding: '10px 12px', marginBottom: 18 }}>
            Tu cuenta está suspendida. Contactá a Cuentik CRM para regularizar el pago.
          </div>
        )}

        {mfaStep ? (
          <form action={mfaFormAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: 'oklch(45% 0.01 255)' }}>
              Ingresá el código de 6 dígitos de tu app autenticadora.
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'oklch(35% 0.01 255)' }}>Código</div>
              <input
                name="code"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                style={{ width: '100%', padding: '10px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 16, letterSpacing: '0.15em', fontFamily: 'monospace' }}
              />
            </div>
            {mfaState.error && <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{mfaState.error}</div>}
            <button
              type="submit"
              disabled={mfaPending}
              style={{ marginTop: 6, width: '100%', padding: 11, border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: mfaPending ? 'default' : 'pointer' }}
            >
              {mfaPending ? 'Verificando…' : 'Verificar'}
            </button>
          </form>
        ) : (
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'oklch(35% 0.01 255)' }}>Email</div>
              <input
                name="email"
                type="email"
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'oklch(35% 0.01 255)' }}>Contraseña</div>
              <input
                name="password"
                type="password"
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 14 }}
              />
            </div>
            {state.error && (
              <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{state.error}</div>
            )}
            <button
              type="submit"
              disabled={pending}
              style={{ marginTop: 6, width: '100%', padding: 11, border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
            >
              {pending ? 'Ingresando…' : 'Ingresar'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'oklch(50% 0.01 255)' }}>
              ¿No tenés cuenta?{' '}
              <Link href="/registro" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Registrate gratis
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
