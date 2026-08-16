'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetInmobiliariaPassword, updateInmobiliaria } from '@/lib/actions/superadmin';
import type { Inmobiliaria } from '@/lib/types';

function fieldStyle() {
  return { width: '100%', padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5 } as const;
}

export function InmobiliariaForm({ inmobiliaria }: { inmobiliaria: Inmobiliaria }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateInmobiliaria(inmobiliaria.id, formData);
      setSaved(true);
      router.refresh();
    } catch {
      setError('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setResetError(null);
    setNewPassword(null);
    try {
      const password = await resetInmobiliariaPassword(inmobiliaria.id);
      setNewPassword(password);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <form action={handleSubmit} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nombre</div>
          <input name="nombre" defaultValue={inmobiliaria.nombre} style={fieldStyle()} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email de acceso</div>
          <input value={inmobiliaria.email_contacto} disabled style={{ ...fieldStyle(), background: 'oklch(96% 0.004 250)', color: 'oklch(50% 0.01 255)' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Teléfono</div>
          <input name="telefono" defaultValue={inmobiliaria.telefono ?? ''} style={fieldStyle()} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Límite de propiedades</div>
            <input name="limite_propiedades" type="number" defaultValue={inmobiliaria.limite_propiedades} style={fieldStyle()} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Mensualidad ($)</div>
            <input name="monto_mensual" type="number" defaultValue={inmobiliaria.monto_mensual} style={fieldStyle()} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Vencimiento del plan</div>
          <input name="fecha_vencimiento" type="date" defaultValue={inmobiliaria.fecha_vencimiento ?? ''} style={fieldStyle()} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Estado</div>
            <select name="estado" defaultValue={inmobiliaria.estado} style={fieldStyle()}>
              <option value="Activo">Activo</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Cobro</div>
            <select name="cobro_estado" defaultValue={inmobiliaria.cobro_estado} style={fieldStyle()}>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        {error && <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{error}</div>}
        {saved && <div style={{ fontSize: 12.5, color: 'oklch(45% 0.13 150)' }}>Guardado.</div>}

        <button
          type="submit"
          disabled={saving}
          style={{ marginTop: 6, padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
          Acceso
        </div>
        <div style={{ fontSize: 12.5, color: 'oklch(50% 0.01 255)', marginBottom: 12 }}>
          Genera una contraseña nueva para esta inmobiliaria. Se la tenés que compartir vos, no se guarda ni se muestra de nuevo.
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          style={{ padding: '9px 14px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: resetting ? 'default' : 'pointer' }}
        >
          {resetting ? 'Generando…' : 'Restablecer contraseña'}
        </button>
        {newPassword && (
          <div style={{ marginTop: 12, padding: '10px 14px', border: '1px solid oklch(85% 0.05 150)', background: 'oklch(97% 0.02 150)', borderRadius: 8, fontSize: 13 }}>
            Nueva contraseña: <strong style={{ fontFamily: 'monospace' }}>{newPassword}</strong>
          </div>
        )}
        {resetError && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{resetError}</div>}
      </div>
    </div>
  );
}
