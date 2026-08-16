'use client';

import { useActionState } from 'react';
import { updatePaginaContenido, type PaginaContenidoState } from '@/lib/actions/publicaciones';

const initialState: PaginaContenidoState = { error: null, success: false };

function fieldStyle() {
  return { width: '100%', padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical' as const };
}

export function PaginaContenidoForm({ bio, ubicacion }: { bio: string; ubicacion: string }) {
  const [state, formAction, pending] = useActionState(updatePaginaContenido, initialState);

  return (
    <form action={formAction} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
        Contenido de tu página
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Quiénes somos</div>
          <textarea name="pagina_bio" defaultValue={bio} rows={4} placeholder="Contá brevemente quiénes son, hace cuánto trabajan en la zona, etc." style={fieldStyle()} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Dónde estamos</div>
          <textarea name="pagina_ubicacion" defaultValue={ubicacion} rows={2} placeholder="Dirección de la oficina, zona de cobertura, etc." style={fieldStyle()} />
        </div>
      </div>
      {state.error && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{state.error}</div>}
      {state.success && (
        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            fontWeight: 600,
            color: 'oklch(40% 0.12 150)',
            background: 'oklch(94% 0.06 150)',
            border: '1px solid oklch(80% 0.06 150)',
            borderRadius: 8,
            padding: '9px 12px',
          }}
        >
          ✓ Contenido guardado.
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        style={{ marginTop: 16, padding: '10px 16px', border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
      >
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}
