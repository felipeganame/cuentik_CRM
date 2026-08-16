'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eliminarPublicacion, toggleActivaPublicacion } from '@/lib/actions/publicaciones';
import type { PublicacionConFoto } from '@/lib/queries';

const OPERACION_LABEL: Record<string, string> = { venta: 'Venta', alquiler: 'Alquiler' };

function formatPrecio(precio: number | null) {
  if (precio === null) return 'Consultar precio';
  return `$${precio.toLocaleString('es-AR')}`;
}

export function PublicacionesList({ publicaciones }: { publicaciones: PublicacionConFoto[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<PublicacionConFoto | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle(p: PublicacionConFoto) {
    setBusyId(p.id);
    try {
      await toggleActivaPublicacion(p.id, p.activa);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await eliminarPublicacion(toDelete.id);
      setToDelete(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
          Publicaciones
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/mi-pagina-preview"
            target="_blank"
            rel="noreferrer"
            style={{ padding: '8px 14px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, background: '#fff', fontSize: 12.5, fontWeight: 600, textDecoration: 'none', color: 'inherit' }}
          >
            Ver vista previa de mi página
          </Link>
          <Link
            href="/dashboard/pagina/nueva"
            style={{ padding: '8px 14px', border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
          >
            + Nueva publicación
          </Link>
        </div>
      </div>

      {publicaciones.length === 0 ? (
        <div style={{ fontSize: 13, color: 'oklch(55% 0.01 255)', padding: '20px 0', textAlign: 'center' }}>
          Todavía no cargaste ninguna publicación.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {publicaciones.map((p) => (
            <div
              key={p.id}
              style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: 12 }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 8, background: 'oklch(96% 0.004 250)', flex: 'none', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 9.5, color: 'oklch(60% 0.01 255)' }}>Sin foto</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titulo}</div>
                <div style={{ fontSize: 12, color: 'oklch(50% 0.01 255)', marginTop: 2 }}>
                  {p.tipo} · {OPERACION_LABEL[p.operacion]} · {formatPrecio(p.precio)}
                  {p.localidad ? ` · ${p.localidad}` : ''}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 20,
                  flex: 'none',
                  background: p.activa ? 'oklch(94% 0.05 150)' : 'oklch(94% 0.005 250)',
                  color: p.activa ? 'oklch(45% 0.13 150)' : 'oklch(50% 0.01 255)',
                }}
              >
                {p.activa ? 'Activa' : 'Pausada'}
              </span>
              <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
                <Link
                  href={`/dashboard/pagina/${p.id}/editar`}
                  style={{ padding: '7px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, background: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none', color: 'inherit' }}
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => handleToggle(p)}
                  disabled={busyId === p.id}
                  style={{ padding: '7px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, background: '#fff', fontSize: 12, fontWeight: 600, cursor: busyId === p.id ? 'default' : 'pointer' }}
                >
                  {p.activa ? 'Pausar' : 'Activar'}
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(p)}
                  style={{ padding: '7px 12px', border: '1px solid oklch(80% 0.1 25)', borderRadius: 7, background: '#fff', color: 'oklch(56% 0.19 25)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 258 / 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => !deleting && setToDelete(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 14, padding: 26, width: 420, maxWidth: '90vw', boxShadow: '0 20px 50px oklch(20% 0.02 258 / 0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>¿Eliminar publicación?</div>
            <div style={{ fontSize: 13.5, color: 'oklch(45% 0.01 255)', lineHeight: 1.5, marginBottom: 20 }}>
              Se eliminará <strong>&ldquo;{toDelete.titulo}&rdquo;</strong> y sus fotos. Esta acción no se puede deshacer.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setToDelete(null)}
                disabled={deleting}
                style={{ padding: '9px 16px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, background: '#fff', fontSize: 13.5, fontWeight: 600, cursor: deleting ? 'default' : 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '9px 16px', border: 'none', borderRadius: 8, background: 'oklch(56% 0.19 25)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: deleting ? 'default' : 'pointer' }}
              >
                {deleting ? 'Eliminando…' : 'Eliminar publicación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
