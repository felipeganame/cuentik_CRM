'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAlquiler } from '@/lib/actions/alquileres';

export function DeleteAlquilerButton({ alquilerId, direccion }: { alquilerId: string; direccion: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmado = window.confirm(
      `¿Eliminar el alquiler de "${direccion}"? Esta acción no se puede deshacer: se borran propiedades, contratos, fotos y el historial de pagos asociados.`
    );
    if (!confirmado) return;

    setDeleting(true);
    try {
      await deleteAlquiler(alquilerId);
      router.push('/dashboard');
    } catch {
      window.alert('No se pudo eliminar el alquiler. Intentá de nuevo.');
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      style={{
        padding: '9px 14px',
        border: '1px solid oklch(80% 0.1 25)',
        borderRadius: 8,
        background: '#fff',
        color: 'oklch(56% 0.19 25)',
        fontSize: 13,
        fontWeight: 600,
        cursor: deleting ? 'default' : 'pointer',
      }}
    >
      {deleting ? 'Eliminando…' : 'Eliminar alquiler'}
    </button>
  );
}
