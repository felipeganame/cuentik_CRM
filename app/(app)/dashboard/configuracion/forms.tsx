'use client';

import { useActionState } from 'react';
import { updatePassword, updatePerfil, type PasswordState, type PerfilState } from '@/lib/actions/perfil';

function fieldStyle() {
  return { width: '100%', padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5 } as const;
}

const perfilInitial: PerfilState = { error: null, success: false };
const passwordInitial: PasswordState = { error: null, success: false };

export function PerfilForm({
  nombreInmobiliaria,
  nombreContacto,
  telefono,
  emailContacto,
}: {
  nombreInmobiliaria: string;
  nombreContacto: string;
  telefono: string;
  emailContacto: string;
}) {
  const [state, formAction, pending] = useActionState(updatePerfil, perfilInitial);

  return (
    <form action={formAction} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
        Perfil de la inmobiliaria
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nombre de la inmobiliaria</div>
          <input name="nombre_inmobiliaria" type="text" defaultValue={nombreInmobiliaria} style={fieldStyle()} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nombre de contacto</div>
          <input name="nombre_contacto" type="text" defaultValue={nombreContacto} style={fieldStyle()} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email de contacto</div>
          <input type="text" value={emailContacto} disabled style={{ ...fieldStyle(), background: 'oklch(96% 0.004 250)', color: 'oklch(50% 0.01 255)' }} />
          <div style={{ fontSize: 11.5, color: 'oklch(55% 0.01 255)', marginTop: 5 }}>Es el email con el que iniciás sesión, no se puede modificar acá.</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Teléfono</div>
          <input name="telefono" type="text" defaultValue={telefono} style={fieldStyle()} />
        </div>
      </div>
      {state.error && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{state.error}</div>}
      {state.success && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(45% 0.13 150)' }}>Guardado.</div>}
      <button
        type="submit"
        disabled={pending}
        style={{ marginTop: 16, padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
      >
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, passwordInitial);

  return (
    <form action={formAction} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
        Seguridad
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nueva contraseña</div>
        <input name="nueva_password" type="password" placeholder="Elegí una nueva contraseña" style={fieldStyle()} />
      </div>
      {state.error && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{state.error}</div>}
      {state.success && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(45% 0.13 150)' }}>Contraseña actualizada.</div>}
      <button
        type="submit"
        disabled={pending}
        style={{ marginTop: 16, padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
      >
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}
