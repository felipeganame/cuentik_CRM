import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getPrecioPorAlquiler, listInmobiliariasConMetricas } from '@/lib/queries';
import { marcarCobroPagado, toggleEstadoInmobiliaria } from '@/lib/actions/superadmin';
import type { EstadoCobro } from '@/lib/billing';
import { PrecioForm } from './precio-form';

function badgeStyle(tone: 'ok' | 'warn' | 'bad') {
  if (tone === 'ok') return { background: 'oklch(94% 0.06 150)', color: 'oklch(45% 0.13 150)' };
  if (tone === 'warn') return { background: 'oklch(96% 0.05 80)', color: 'oklch(55% 0.15 70)' };
  return { background: 'oklch(95% 0.03 25)', color: 'oklch(56% 0.19 25)' };
}

function cobroTone(estado: EstadoCobro): 'ok' | 'warn' | 'bad' {
  if (estado === 'Pagado') return 'ok';
  if (estado === 'Pendiente') return 'warn';
  return 'bad';
}

function formatMoney(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

function proximoCobroLabel(dias: number | null, estado: EstadoCobro) {
  if (dias === null) return '—';
  if (estado === 'En mora') return `Vencido hace ${Math.abs(dias)}d`;
  if (dias === 0) return 'Vence hoy';
  if (dias < 0) return `En gracia (${Math.abs(dias)}d)`;
  return `${dias}d`;
}

export default async function SuperadminPage() {
  const supabase = await createClient();
  const [inmobiliarias, precioPorAlquiler] = await Promise.all([
    listInmobiliariasConMetricas(supabase),
    getPrecioPorAlquiler(supabase),
  ]);

  const activas = inmobiliarias.filter((i) => i.estado === 'Activo');
  const enMora = inmobiliarias.filter((i) => i.estadoCobro === 'En mora');
  const pendientes = inmobiliarias.filter((i) => i.estadoCobro === 'Pendiente');
  const ingresoMensual = activas.reduce((sum, i) => sum + i.montoMensual, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Inmobiliarias</div>
          <div style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginTop: 4 }}>Panel de clientes de Cuentik CRM</div>
        </div>
        <Link
          href="/superadmin/nueva"
          style={{ padding: '10px 18px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
        >
          + Nueva inmobiliaria
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 14 }}>
        <KpiCard label="Clientes" value={inmobiliarias.length} />
        <KpiCard label="Activos" value={activas.length} />
        <KpiCard label="Pendientes" value={pendientes.length} tone={pendientes.length > 0 ? 'warn' : undefined} />
        <KpiCard label="En mora" value={enMora.length} tone={enMora.length > 0 ? 'warn' : undefined} />
        <KpiCard label="Ingreso mensual" value={formatMoney(ingresoMensual)} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PrecioForm precioActual={precioPorAlquiler} />
      </div>

      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 0.8fr 0.9fr 0.9fr 0.9fr 0.8fr 1.6fr', padding: '12px 18px', fontSize: 11, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', borderBottom: '1px solid oklch(92% 0.006 250)' }}>
          <div>Nombre</div>
          <div>Email</div>
          <div>Alquileres</div>
          <div>Mensualidad</div>
          <div>Cobro</div>
          <div>Próx. cobro</div>
          <div>Estado</div>
          <div>Acciones</div>
        </div>
        {inmobiliarias.length === 0 && (
          <div style={{ padding: 24, fontSize: 13.5, color: 'oklch(55% 0.01 255)' }}>Todavía no hay inmobiliarias cargadas.</div>
        )}
        {inmobiliarias.map((i) => (
          <div
            key={i.id}
            style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 0.8fr 0.9fr 0.9fr 0.9fr 0.8fr 1.6fr', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid oklch(94% 0.005 250)', fontSize: 13.5 }}
          >
            <div style={{ fontWeight: 600 }}>{i.nombre}</div>
            <div style={{ color: 'oklch(48% 0.01 255)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.email_contacto}</div>
            <div>
              {i.alquileresActivos} / {i.limite_alquileres}
              {i.alquileresActivos >= i.limite_alquileres && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: 'oklch(56% 0.19 25)' }}>al límite</span>
              )}
            </div>
            <div>{formatMoney(i.montoMensual)}</div>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, ...badgeStyle(cobroTone(i.estadoCobro)) }}>{i.estadoCobro}</span>
            </div>
            <div style={{ color: i.estadoCobro === 'En mora' ? 'oklch(56% 0.19 25)' : i.estadoCobro === 'Pendiente' ? 'oklch(55% 0.15 70)' : 'oklch(48% 0.01 255)', fontWeight: i.estadoCobro === 'Pagado' ? 400 : 700 }}>
              {proximoCobroLabel(i.diasParaProximoCobro, i.estadoCobro)}
            </div>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, ...badgeStyle(i.estado === 'Activo' ? 'ok' : 'bad') }}>{i.estado}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href={`/superadmin/${i.id}`} style={{ fontSize: 12.5, fontWeight: 600, color: 'oklch(55% 0.16 250)', textDecoration: 'none' }}>
                Ver
              </Link>
              {i.estadoCobro !== 'Pagado' && (
                <form
                  action={async () => {
                    'use server';
                    await marcarCobroPagado(i.id);
                  }}
                >
                  <button
                    type="submit"
                    style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid oklch(80% 0.06 150)', background: '#fff', color: 'oklch(45% 0.13 150)' }}
                  >
                    Marcar pagado
                  </button>
                </form>
              )}
              <form action={toggleEstadoInmobiliaria.bind(null, i.id, i.estado === 'Activo' ? 'Suspendido' : 'Activo')}>
                <button
                  type="submit"
                  style={{
                    fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                    border: i.estado === 'Activo' ? '1px solid oklch(80% 0.1 25)' : '1px solid oklch(80% 0.06 150)',
                    background: '#fff',
                    color: i.estado === 'Activo' ? 'oklch(56% 0.19 25)' : 'oklch(45% 0.13 150)',
                  }}
                >
                  {i.estado === 'Activo' ? 'Suspender' : 'Activar'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: string | number; tone?: 'warn' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: tone === 'warn' && Number(value) > 0 ? 'oklch(56% 0.19 25)' : 'oklch(20% 0.02 258)' }}>{value}</div>
    </div>
  );
}
