'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePrecioPorAlquiler } from '@/lib/actions/superadmin';

export function PrecioForm({ precioActual }: { precioActual: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setSaved(false);
    setError(null);
    const result = await updatePrecioPorAlquiler(formData);
    if ('error' in result) {
      setError(result.error);
    } else {
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form
      action={handleSubmit}
      style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: '14px 18px' }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'oklch(40% 0.01 255)' }}>Precio por alquiler activo</div>
      <span style={{ fontSize: 13.5 }}>$</span>
      <input
        name="precio_por_alquiler"
        type="number"
        min={0}
        step="0.01"
        defaultValue={precioActual}
        style={{ width: 110, padding: '7px 9px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5 }}
      />
      <button
        type="submit"
        disabled={saving}
        style={{ padding: '7px 14px', border: 'none', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
      {saved && <span style={{ fontSize: 12, color: 'oklch(45% 0.13 150)' }}>Guardado.</span>}
      {error && <span style={{ fontSize: 12, color: 'oklch(56% 0.19 25)' }}>{error}</span>}
      <span style={{ fontSize: 11.5, color: 'oklch(55% 0.01 255)', marginLeft: 'auto' }}>
        Se cobra por cada alquiler activo que tenga una inmobiliaria.
      </span>
    </form>
  );
}
