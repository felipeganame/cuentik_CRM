'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAlquiler } from '@/lib/actions/alquileres';

export function DeleteAlquilerButton({ alquilerId, direccion }: { alquilerId: string; direccion: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleConfirm() {
    setDeleting(true);
    setErrorMsg(null);
    try {
      await deleteAlquiler(alquilerId);
      router.push('/dashboard');
    } catch {
      setErrorMsg('No se pudo eliminar el alquiler. Intentá de nuevo.');
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: '9px 14px',
          border: '1px solid oklch(80% 0.1 25)',
          borderRadius: 8,
          background: '#fff',
          color: 'oklch(56% 0.19 25)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Eliminar alquiler
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'oklch(20% 0.02 258 / 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => !deleting && setOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 26,
              width: 420,
              maxWidth: '90vw',
              boxShadow: '0 20px 50px oklch(20% 0.02 258 / 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>¿Eliminar alquiler?</div>
            <div style={{ fontSize: 13.5, color: 'oklch(45% 0.01 255)', lineHeight: 1.5, marginBottom: 20 }}>
              Se eliminará el alquiler de <strong>&ldquo;{direccion}&rdquo;</strong>. Esta acción no se puede deshacer:
              se borran propiedades, contrato, fotos y el historial de pagos asociados.
            </div>
            {errorMsg && <div style={{ fontSize: 13, color: 'oklch(56% 0.19 25)', marginBottom: 14 }}>{errorMsg}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                style={{
                  padding: '9px 16px',
                  border: '1px solid oklch(87% 0.007 250)',
                  borderRadius: 8,
                  background: '#fff',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: deleting ? 'default' : 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={deleting}
                style={{
                  padding: '9px 16px',
                  border: 'none',
                  borderRadius: 8,
                  background: 'oklch(56% 0.19 25)',
                  color: '#fff',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: deleting ? 'default' : 'pointer',
                }}
              >
                {deleting ? 'Eliminando…' : 'Eliminar alquiler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
