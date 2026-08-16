import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { listInmobiliarias } from '@/lib/queries';

function badgeStyle(active: boolean) {
  return active
    ? { background: 'oklch(94% 0.06 150)', color: 'oklch(45% 0.13 150)' }
    : { background: 'oklch(95% 0.03 25)', color: 'oklch(56% 0.19 25)' };
}

export default async function SuperadminPage() {
  const supabase = await createClient();
  const inmobiliarias = await listInmobiliarias(supabase);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Inmobiliarias</div>
        <Link
          href="/superadmin/nueva"
          style={{ padding: '10px 18px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
        >
          + Nueva inmobiliaria
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 0.9fr 0.9fr 0.9fr 1fr', padding: '12px 18px', fontSize: 11, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', borderBottom: '1px solid oklch(92% 0.006 250)' }}>
          <div>Nombre</div>
          <div>Email</div>
          <div>Estado</div>
          <div>Cobro</div>
          <div>Límite</div>
          <div>Vencimiento</div>
        </div>
        {inmobiliarias.length === 0 && (
          <div style={{ padding: 24, fontSize: 13.5, color: 'oklch(55% 0.01 255)' }}>Todavía no hay inmobiliarias cargadas.</div>
        )}
        {inmobiliarias.map((i) => (
          <Link
            key={i.id}
            href={`/superadmin/${i.id}`}
            style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 0.9fr 0.9fr 0.9fr 1fr', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid oklch(94% 0.005 250)', fontSize: 13.5, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ fontWeight: 600 }}>{i.nombre}</div>
            <div style={{ color: 'oklch(48% 0.01 255)' }}>{i.email_contacto}</div>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, ...badgeStyle(i.estado === 'Activo') }}>{i.estado}</span>
            </div>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, ...badgeStyle(i.cobro_estado === 'Pagado') }}>{i.cobro_estado}</span>
            </div>
            <div>{i.limite_propiedades}</div>
            <div style={{ color: 'oklch(48% 0.01 255)' }}>{i.fecha_vencimiento ?? '—'}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
