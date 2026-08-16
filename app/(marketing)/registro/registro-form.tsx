'use client';

import { useActionState } from 'react';
import { registrarInmobiliaria, type RegistroState } from '@/lib/actions/registro';
import { PaisSelectOptions, paisSelectStyle } from '@/app/pais-select';
import styles from '../marketing.module.css';

const initialState: RegistroState = { error: null, success: false };

function fieldStyle() {
  return {
    width: '100%',
    padding: '11px 13px',
    border: '1px solid var(--line)',
    borderRadius: 8,
    fontSize: 14.5,
    background: 'var(--card)',
    color: 'var(--ink-text)',
  } as const;
}

function soloDigitos(e: React.ChangeEvent<HTMLInputElement>) {
  e.target.value = e.target.value.replace(/\D/g, '');
}

export function RegistroForm() {
  const [state, formAction, pending] = useActionState(registrarInmobiliaria, initialState);

  if (state.success) {
    return (
      <div
        className={styles.folioCard}
        style={{ maxWidth: 480, margin: '0 auto', transform: 'none', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center' }}
      >
        <div style={{ fontSize: 19, fontWeight: 700, fontFamily: 'Vollkorn, serif' }}>Revisá tu email</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted-text)' }}>
          Te mandamos un link de confirmación. Abrilo para activar tu cuenta y empezar a usar Cuentik CRM.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={styles.folioCard}
      style={{ maxWidth: 480, margin: '0 auto', transform: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Nombre de tu inmobiliaria</div>
        <input name="nombre" required style={fieldStyle()} placeholder="Ej: Inmobiliaria del Centro" />
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Email</div>
        <input name="email" type="email" required style={fieldStyle()} placeholder="tu@inmobiliaria.com" />
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Contraseña</div>
        <input name="password" type="password" required minLength={8} style={fieldStyle()} placeholder="Mínimo 8 caracteres" />
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Teléfono (opcional)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select name="telefono_dial" style={{ ...paisSelectStyle(), background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink-text)' }}>
            <PaisSelectOptions />
          </select>
          <input name="telefono_numero" type="text" inputMode="numeric" maxLength={14} placeholder="Número" onChange={soloDigitos} style={fieldStyle()} />
        </div>
      </div>

      {state.error && <div style={{ fontSize: 13, color: 'var(--ink-red)' }}>{state.error}</div>}

      <button type="submit" disabled={pending} className={styles.btnPrimary} style={{ justifyContent: 'center', marginTop: 4 }}>
        {pending ? 'Creando tu cuenta…' : 'Crear mi cuenta gratis'}
      </button>
      <div className={`${styles.mono} ${styles.heroFinePrint}`} style={{ marginTop: 0, textAlign: 'center' }}>
        Sin tarjeta. Primer alquiler gratis.
      </div>
    </form>
  );
}
