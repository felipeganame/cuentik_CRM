import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { listAlquileres } from '@/lib/queries';
import { estadoPagoLabel, statusStyle } from '@/lib/types';
import { estadoCobro } from '@/lib/billing';

const FILTROS = ['Todos', 'Al día', 'Pendiente', 'Deuda'] as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q = '', estado = 'Todos' } = await searchParams;

  const supabase = await createClient();
  const all = await listAlquileres(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('inmobiliarias(limite_alquileres, fecha_proximo_cobro, exento_cobro)')
    .eq('id', user!.id)
    .single();
  const inmobiliariaRel = profile?.inmobiliarias as unknown as
    | { limite_alquileres: number; fecha_proximo_cobro: string | null; exento_cobro: boolean }
    | { limite_alquileres: number; fecha_proximo_cobro: string | null; exento_cobro: boolean }[]
    | null;
  const inmobiliaria = Array.isArray(inmobiliariaRel) ? inmobiliariaRel[0] : inmobiliariaRel;
  const limiteAlquileres = inmobiliaria?.limite_alquileres ?? 0;
  const alLimite = all.length >= limiteAlquileres;
  const enMora = estadoCobro(inmobiliaria?.fecha_proximo_cobro ?? null, inmobiliaria?.exento_cobro ?? false) === 'En mora';

  const query = q.trim().toLowerCase();
  const filtered = all
    .map((a) => ({ ...a, estadoLabel: estadoPagoLabel(a.estadoPagoMesActual) }))
    .filter((a) => estado === 'Todos' || a.estadoLabel === estado)
    .filter((a) => {
      if (!query) return true;
      const haystack = [
        a.propiedadPrincipal?.direccion,
        a.locatario?.nombre,
        a.locador?.nombre,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

  const activos = all.length;
  const conDeuda = all.filter((a) => a.estadoPagoMesActual === 'vencido').length;
  const serviciosPendientes = all.filter((a) => a.serviciosPendientes > 0).length;
  const hoy = new Date();
  const en60Dias = new Date(hoy.getTime() + 60 * 24 * 60 * 60 * 1000);
  const contratosPorVencer = all.filter((a) => {
    const fin = new Date(a.fecha_fin);
    return fin >= hoy && fin <= en60Dias;
  }).length;

  return (
    <div>
      {enMora && (
        <div style={{ background: 'oklch(96% 0.03 25)', border: '1px solid oklch(88% 0.06 25)', color: 'oklch(50% 0.17 25)', borderRadius: 10, padding: '12px 16px', fontSize: 13.5, marginBottom: 20 }}>
          <strong>Tenés un pago pendiente.</strong> Regularizalo para evitar la suspensión del servicio. Contactá a Cuentik CRM si ya pagaste.
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 26 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Tus alquileres</div>
          <div style={{ fontSize: 13.5, color: 'oklch(50% 0.01 255)', marginTop: 4 }}>
            Todos los contratos que administrás ·{' '}
            <span style={{ fontWeight: 600, color: alLimite ? 'oklch(56% 0.19 25)' : 'oklch(45% 0.01 255)' }}>
              {all.length} / {limiteAlquileres} del plan
            </span>
          </div>
        </div>
        {alLimite ? (
          <div style={{ textAlign: 'right' }}>
            <button
              type="button"
              disabled
              style={{ padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(90% 0.007 250)', color: 'oklch(60% 0.01 255)', fontSize: 13.5, fontWeight: 600, cursor: 'not-allowed' }}
            >
              + Nuevo alquiler
            </button>
            <div style={{ fontSize: 11.5, color: 'oklch(56% 0.19 25)', marginTop: 4 }}>Llegaste al límite de tu plan</div>
          </div>
        ) : (
          <Link
            href="/dashboard/alquileres/nuevo"
            style={{ padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
          >
            + Nuevo alquiler
          </Link>
        )}
      </div>

      <form style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          name="q"
          type="text"
          defaultValue={q}
          placeholder="Buscar por dirección, locatario o locador…"
          style={{ flex: 1, maxWidth: 360, padding: '9px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, fontSize: 13.5, background: '#fff' }}
        />
        {FILTROS.map((f) => {
          const active = estado === f;
          return (
            <button
              key={f}
              type="submit"
              name="estado"
              value={f}
              style={{
                padding: '8px 14px',
                border: `1px solid ${active ? 'oklch(55% 0.16 250)' : 'oklch(87% 0.007 250)'}`,
                borderRadius: 20,
                background: active ? 'oklch(94% 0.03 250)' : '#fff',
                color: active ? 'oklch(55% 0.16 250)' : 'oklch(45% 0.01 255)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {f}
            </button>
          );
        })}
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        <KpiCard label="Alquileres activos" value={activos} />
        <KpiCard label="Con deuda" value={conDeuda} color="oklch(56% 0.19 25)" />
        <KpiCard label="Servicios pendientes" value={serviciosPendientes} color="oklch(72% 0.14 80)" />
        <KpiCard label="Contratos por vencer" value={contratosPorVencer} />
      </div>

      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1.2fr 1.2fr 1fr 1fr 1.1fr 0.9fr',
            padding: '12px 18px',
            fontSize: 11.5,
            fontWeight: 700,
            color: 'oklch(52% 0.01 255)',
            textTransform: 'uppercase',
            letterSpacing: '.03em',
            borderBottom: '1px solid oklch(92% 0.006 250)',
          }}
        >
          <div>Propiedad</div>
          <div>Locatario</div>
          <div>Locador</div>
          <div>Monto</div>
          <div>Estado</div>
          <div>Servicios</div>
          <div />
        </div>
        {filtered.map((a) => {
          const st = statusStyle(a.estadoLabel);
          return (
            <div
              key={a.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.8fr 1.2fr 1.2fr 1fr 1fr 1.1fr 0.9fr',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: '1px solid oklch(94% 0.005 250)',
                fontSize: 13.5,
                background: a.estadoLabel === 'Deuda' ? 'oklch(98% 0.015 25)' : 'transparent',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{a.propiedadPrincipal?.direccion ?? '—'}</div>
                <div style={{ fontSize: 12, color: 'oklch(52% 0.01 255)' }}>{a.propiedadPrincipal?.localidad ?? ''}</div>
              </div>
              <div>{a.locatario?.nombre ?? '—'}</div>
              <div>{a.locador?.nombre ?? '—'}</div>
              <div style={{ fontWeight: 600 }}>${a.monto.toLocaleString('es-AR')}</div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: st.bg, color: st.color }}>
                  {a.estadoLabel}
                </span>
              </div>
              <div style={{ color: a.serviciosPendientes > 0 ? 'oklch(50% 0.17 25)' : 'oklch(55% 0.01 255)', fontSize: 13 }}>
                {a.serviciosPendientes > 0 ? `${a.serviciosPendientes} pendiente${a.serviciosPendientes > 1 ? 's' : ''}` : 'Al día'}
              </div>
              <div style={{ textAlign: 'right' }}>
                <Link href={`/dashboard/alquileres/${a.id}`} style={{ color: 'oklch(55% 0.16 250)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  Ver →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'oklch(52% 0.01 255)', fontSize: 13.5 }}>
          No encontramos alquileres que coincidan con la búsqueda o el filtro.
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11.5, color: 'oklch(52% 0.01 255)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, color: color ?? 'inherit' }}>{value}</div>
    </div>
  );
}
