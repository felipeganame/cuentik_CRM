'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { actualizarPassword, type ActualizarPasswordState } from '@/lib/actions/recuperar';

const initialState: ActualizarPasswordState = { error: null, success: false };

export default function NuevaPasswordPage() {
  const [state, formAction, pending] = useActionState(actualizarPassword, initialState);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 380, background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 14, padding: '36px 32px', boxShadow: '0 4px 24px rgba(20,20,30,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)' }} />
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.01em', fontFamily: 'Vollkorn, serif' }}>Cuentik CRM</div>
        </div>

        {state.success ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Contraseña actualizada</div>
            <p style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginBottom: 20 }}>Ya podés seguir usando tu cuenta.</p>
            <Link
              href="/dashboard"
              style={{ display: 'block', textAlign: 'center', padding: 11, borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              Continuar
            </Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginBottom: 28 }}>Elegí tu nueva contraseña.</div>
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'oklch(35% 0.01 255)' }}>Nueva contraseña</div>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 14 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'oklch(35% 0.01 255)' }}>Repetir contraseña</div>
                <input
                  name="confirmacion"
                  type="password"
                  required
                  minLength={8}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 14 }}
                />
              </div>
              {state.error && <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{state.error}</div>}
              <button
                type="submit"
                disabled={pending}
                style={{ marginTop: 6, width: '100%', padding: 11, border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
              >
                {pending ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
