import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAlquilerDetail } from '@/lib/queries';
import { estadoPagoLabel, statusStyle } from '@/lib/types';
import { cambiarPagaServicio, toggleMesActual, toggleServicioActivo, toggleServicioPagado, updateCondiciones } from '@/lib/actions/alquileres';
import { ContratoUploader, FotosUploader } from './fotos-uploader';

const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'pagos', label: 'Pagos' },
  { key: 'fotos', label: 'Fotos y contrato' },
] as const;

export default async function AlquilerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = 'resumen' } = await searchParams;

  const supabase = await createClient();
  const detalle = await getAlquilerDetail(supabase, id);
  if (!detalle) notFound();

  const estadoLabel = estadoPagoLabel(detalle.estadoPagoMesActual);
  const st = statusStyle(estadoLabel);
  const propiedadPrincipal = detalle.propiedades[0];

  return (
    <div>
      <Link href="/dashboard" style={{ border: 'none', background: 'none', color: 'oklch(50% 0.01 255)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
        ← Volver a alquileres
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 21, fontWeight: 700 }}>{propiedadPrincipal?.direccion ?? '—'}</div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: st.bg, color: st.color }}>{estadoLabel}</span>
          </div>
          <div style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginTop: 4 }}>
            {propiedadPrincipal?.localidad ?? ''} · {propiedadPrincipal?.tipo ?? ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid oklch(90% 0.007 250)', marginBottom: 24 }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/dashboard/alquileres/${id}?tab=${t.key}`}
              style={{
                padding: '10px 16px',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                color: active ? 'oklch(55% 0.16 250)' : 'oklch(52% 0.01 255)',
                borderBottom: `2px solid ${active ? 'oklch(55% 0.16 250)' : 'transparent'}`,
                textDecoration: 'none',
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {tab === 'resumen' && <TabResumen alquilerId={id} detalle={detalle} />}
      {tab === 'servicios' && <TabServicios alquilerId={id} detalle={detalle} />}
      {tab === 'pagos' && <TabPagos alquilerId={id} detalle={detalle} />}
      {tab === 'fotos' && <TabFotos alquilerId={id} detalle={detalle} />}
    </div>
  );
}

function fieldStyle() {
  return { padding: '8px 10px', border: '1px solid oklch(90% 0.007 250)', borderRadius: 7, fontSize: 13.5, width: '100%' } as const;
}

function TabResumen({ alquilerId, detalle }: { alquilerId: string; detalle: Awaited<ReturnType<typeof getAlquilerDetail>> & object }) {
  const updateAction = updateCondiciones.bind(null, alquilerId);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <PersonaCard titulo="Locador" persona={detalle.locador} />
        <PersonaCard titulo="Locatario" persona={detalle.locatario} />
      </div>
      <form action={updateAction} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
          Condiciones de pago
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
          <Field label="Monto">
            <input name="monto" type="number" step="1" defaultValue={detalle.monto} style={fieldStyle()} />
          </Field>
          <Field label="Día de pago">
            <input name="dia_pago" type="number" min={1} max={31} defaultValue={detalle.dia_pago} style={fieldStyle()} />
          </Field>
          <Field label="Método">
            <input name="metodo_pago" type="text" defaultValue={detalle.metodo_pago} style={fieldStyle()} />
          </Field>
          <Field label="Cuenta / Alias">
            <input name="cuenta" type="text" defaultValue={detalle.cuenta ?? ''} style={fieldStyle()} />
          </Field>
          <Field label="Frecuencia de pago">
            <input name="frecuencia_pago" type="text" defaultValue={detalle.frecuencia_pago} style={fieldStyle()} />
          </Field>
          <Field label="Actualización">
            <select name="actualizacion_tipo" defaultValue={detalle.actualizacion_tipo} style={fieldStyle()}>
              <option value="porcentaje">Porcentaje fijo</option>
              <option value="indice">Índice</option>
            </select>
          </Field>
          <Field label="Valor de actualización">
            <input name="actualizacion_valor" type="text" defaultValue={detalle.actualizacion_valor} style={fieldStyle()} />
          </Field>
          <Field label="Cada cuánto se actualiza">
            <input name="frecuencia_actualizacion" type="text" defaultValue={detalle.frecuencia_actualizacion} style={fieldStyle()} />
          </Field>
        </div>
        <button
          type="submit"
          style={{ padding: '9px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'oklch(55% 0.01 255)', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

function PersonaCard({ titulo, persona }: { titulo: string; persona: { nombre: string; dni: string | null; telefono: string | null; email: string | null; domicilio: string | null } | null }) {
  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>{titulo}</div>
      {persona ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5 }}>
          <div style={{ fontWeight: 600 }}>{persona.nombre}</div>
          <div style={{ color: 'oklch(48% 0.01 255)' }}>{persona.dni}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{persona.telefono}</span>
            {persona.telefono && (
              <a
                href={`https://wa.me/54${String(persona.telefono).replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, fontWeight: 600, color: 'oklch(38% 0.1 150)', background: 'oklch(94% 0.05 150)', padding: '4px 10px', borderRadius: 7, textDecoration: 'none' }}
              >
                WhatsApp
              </a>
            )}
          </div>
          <div style={{ color: 'oklch(48% 0.01 255)' }}>{persona.email}</div>
          <div style={{ color: 'oklch(48% 0.01 255)' }}>{persona.domicilio}</div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'oklch(55% 0.01 255)' }}>Sin datos</div>
      )}
    </div>
  );
}

function TabServicios({ alquilerId, detalle }: { alquilerId: string; detalle: Awaited<ReturnType<typeof getAlquilerDetail>> & object }) {
  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1.3fr 0.7fr 1fr', padding: '12px 18px', fontSize: 11, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', borderBottom: '1px solid oklch(92% 0.006 250)' }}>
        <div>Servicio</div>
        <div>Propiedad</div>
        <div>Paga</div>
        <div>N° de referencia</div>
        <div>Aplica</div>
        <div>Este mes</div>
      </div>
      {detalle.servicios.map((sv) => (
        <div key={sv.id} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1.3fr 0.7fr 1fr', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid oklch(94% 0.005 250)', fontSize: 13.5 }}>
          <div style={{ fontWeight: 600 }}>{sv.nombre}</div>
          <div style={{ color: 'oklch(48% 0.01 255)' }}>{sv.propiedad?.direccion ?? '—'}</div>
          <form action={cambiarPagaServicio.bind(null, sv.id, alquilerId, sv.paga === 'locador' ? 'locatario' : 'locador')}>
            <button type="submit" style={{ padding: '6px 8px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 6, fontSize: 12.5, background: '#fff', cursor: 'pointer' }}>
              {sv.paga === 'locador' ? 'Locador' : 'Locatario'}
            </button>
          </form>
          <div>{sv.referencia ?? '—'}</div>
          <form action={toggleServicioActivo.bind(null, sv.id, alquilerId)}>
            <button
              type="submit"
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
              aria-label={sv.activo ? 'Desactivar servicio' : 'Activar servicio'}
            >
              {sv.activo ? '☑' : '☐'}
            </button>
          </form>
          {sv.activo && (
            <form action={toggleServicioPagado.bind(null, sv.id, alquilerId)}>
              {(() => {
                const label = sv.pagado_mes_actual ? 'Pagado' : 'Pendiente';
                const stx = statusStyle(label);
                return (
                  <button type="submit" style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: stx.bg, color: stx.color }}>
                    {label}
                  </button>
                );
              })()}
            </form>
          )}
        </div>
      ))}
    </div>
  );
}

function TabPagos({ alquilerId, detalle }: { alquilerId: string; detalle: Awaited<ReturnType<typeof getAlquilerDetail>> & object }) {
  const label = detalle.estadoPagoMesActual === 'pagado' ? 'Pagado' : detalle.estadoPagoMesActual === 'pendiente' ? 'Pendiente' : 'Vencido';
  const st = statusStyle(label);
  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 12 }}>Mes actual</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>${detalle.monto.toLocaleString('es-AR')}</div>
            <div style={{ fontSize: 12.5, color: 'oklch(52% 0.01 255)' }}>Vence el día {detalle.dia_pago}</div>
          </div>
          <form action={toggleMesActual.bind(null, alquilerId)}>
            <button type="submit" style={{ fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', background: st.bg, color: st.color }}>
              {label}
            </button>
          </form>
        </div>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 10 }}>Historial</div>
      <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, overflow: 'hidden' }}>
        {detalle.historial.length === 0 && (
          <div style={{ padding: 18, fontSize: 13, color: 'oklch(55% 0.01 255)' }}>Todavía no hay historial de pagos.</div>
        )}
        {detalle.historial.map((h) => {
          const hLabel = h.estado === 'pagado' ? 'Pagado' : h.estado === 'pendiente' ? 'Pendiente' : 'Vencido';
          const hst = statusStyle(hLabel);
          return (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid oklch(94% 0.005 250)', fontSize: 13.5 }}>
              <div>{h.mes}</div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: hst.bg, color: hst.color }}>{hLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabFotos({ alquilerId, detalle }: { alquilerId: string; detalle: Awaited<ReturnType<typeof getAlquilerDetail>> & object }) {
  const propiedadPrincipal = detalle.propiedades[0];
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 4 }}>
        Fotos de la propiedad
      </div>
      <div style={{ fontSize: 11.5, color: 'oklch(55% 0.01 255)', marginBottom: 12 }}>Hasta 15 imágenes JPEG, máximo 1 MB cada una</div>
      <div style={{ marginBottom: 26 }}>
        {propiedadPrincipal ? (
          <FotosUploader alquilerId={alquilerId} propiedadId={propiedadPrincipal.id} inmobiliariaId={detalle.inmobiliaria_id} fotos={detalle.fotos} />
        ) : (
          <div style={{ fontSize: 13, color: 'oklch(55% 0.01 255)' }}>Este alquiler no tiene una propiedad asociada.</div>
        )}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 12 }}>Contrato</div>
      <ContratoUploader alquilerId={alquilerId} inmobiliariaId={detalle.inmobiliaria_id} contratoUrl={detalle.contratoUrl} />
    </div>
  );
}
