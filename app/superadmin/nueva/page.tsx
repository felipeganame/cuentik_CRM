'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createInmobiliaria } from '@/lib/actions/superadmin';

function fieldStyle() {
  return { width: '100%', padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5 } as const;
}

export default function NuevaInmobiliariaPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      const { id } = await createInmobiliaria(formData);
      router.push(`/superadmin/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la inmobiliaria.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <Link href="/superadmin" style={{ border: 'none', background: 'none', color: 'oklch(50% 0.01 255)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 14 }}>
        ← Volver
      </Link>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>Nueva inmobiliaria</div>

      <form action={handleSubmit} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nombre de la inmobiliaria *</div>
          <input name="nombre" required style={fieldStyle()} placeholder="Ej: Inmobiliaria del Centro" />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email de acceso *</div>
          <input name="email_contacto" type="email" required style={fieldStyle()} placeholder="contacto@inmobiliaria.com" />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Contraseña inicial * (mín. 8 caracteres)</div>
          <input name="password" type="text" required minLength={8} style={fieldStyle()} placeholder="Se la vas a compartir a la inmobiliaria" />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Teléfono</div>
          <input name="telefono" style={fieldStyle()} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Límite de alquileres</div>
            <input name="limite_alquileres" type="number" defaultValue={20} style={fieldStyle()} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Mensualidad ($)</div>
            <input name="monto_mensual" type="number" defaultValue={0} style={fieldStyle()} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Vencimiento del plan</div>
          <input name="fecha_vencimiento" type="date" style={fieldStyle()} />
        </div>

        {error && <div style={{ fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          style={{ marginTop: 6, padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: submitting ? 'default' : 'pointer' }}
        >
          {submitting ? 'Creando…' : 'Crear inmobiliaria'}
        </button>
      </form>
    </div>
  );
}
