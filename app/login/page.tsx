'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 380, background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 14, padding: '36px 32px', boxShadow: '0 4px 24px rgba(20,20,30,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'oklch(55% 0.16 250)' }} />
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.01em' }}>Cuentik CRM</div>
        </div>
        <div style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginBottom: 28 }}>CRM de alquileres · Córdoba</div>
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
            style={{ marginTop: 6, width: '100%', padding: 11, border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
          >
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
