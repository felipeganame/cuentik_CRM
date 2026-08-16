import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentRole } from '@/lib/auth';
import { getPaginaPreview, type PublicacionPreview } from '@/lib/queries';
import { waDigits } from '@/lib/phone';
import { PaginaPreviewFiltros } from './filtros';

const OPERACION_LABEL: Record<string, string> = { venta: 'Venta', alquiler: 'Alquiler' };

function formatPrecio(precio: number | null) {
  if (precio === null) return 'Consultar precio';
  return `$${precio.toLocaleString('es-AR')}`;
}

function statsLine(p: { ambientes: number | null; dormitorios: number | null; banos: number | null; superficie_total: number | null }) {
  const parts: string[] = [];
  if (p.ambientes) parts.push(`${p.ambientes} amb.`);
  if (p.dormitorios) parts.push(`${p.dormitorios} dorm.`);
  if (p.banos) parts.push(`${p.banos} baño${p.banos === 1 ? '' : 's'}`);
  if (p.superficie_total) parts.push(`${p.superficie_total} m²`);
  return parts.join(' · ');
}

function aplicarFiltros(
  publicaciones: PublicacionPreview[],
  params: { q: string; operacion: string; tipo: string; orden: string }
): PublicacionPreview[] {
  const query = params.q.trim().toLowerCase();
  const filtradas = publicaciones.filter((p) => {
    if (params.operacion !== 'Todos' && params.operacion.toLowerCase() !== p.operacion) return false;
    if (params.tipo !== 'Todos' && params.tipo !== p.tipo) return false;
    if (query) {
      const haystack = [p.titulo, p.direccion, p.localidad].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  if (params.orden === 'precio_asc') {
    return [...filtradas].sort((a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity));
  }
  if (params.orden === 'precio_desc') {
    return [...filtradas].sort((a, b) => (b.precio ?? -Infinity) - (a.precio ?? -Infinity));
  }
  return filtradas;
}

export default async function MiPaginaPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; operacion?: string; tipo?: string; orden?: string }>;
}) {
  const { q = '', operacion = 'Todos', tipo = 'Todos', orden = 'recientes' } = await searchParams;

  const supabase = await createClient();
  const role = await getCurrentRole(supabase);
  if (!role) redirect('/login');
  if (role !== 'inmobiliaria') redirect('/dashboard');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user!.id).single();
  const data = await getPaginaPreview(supabase, profile?.inmobiliaria_id ?? '');

  const tiposDisponibles = Array.from(new Set(data.publicaciones.map((p) => p.tipo))).sort();
  const publicacionesFiltradas = aplicarFiltros(data.publicaciones, { q, operacion, tipo, orden });

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(97% 0.004 250)' }}>
      <div style={{ background: 'oklch(26% 0.025 255)', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 12, fontWeight: 600 }}>
        VISTA PREVIA — todavía no es pública ni tiene una dirección web propia.
      </div>

      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 32px', background: '#fff', borderBottom: '1px solid oklch(90% 0.007 250)' }}>
        {data.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', border: '1px solid oklch(90% 0.007 250)' }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--accent)' }} />
        )}
        <div style={{ fontSize: 19, fontWeight: 700 }}>{data.nombre || 'Tu inmobiliaria'}</div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 60px' }}>
        {data.publicaciones.length > 0 && (
          <Suspense fallback={null}>
            <PaginaPreviewFiltros tipos={tiposDisponibles} />
          </Suspense>
        )}

        <div style={{ fontSize: 13, color: 'oklch(50% 0.01 255)', marginBottom: 20 }}>
          {publicacionesFiltradas.length} {publicacionesFiltradas.length === 1 ? 'propiedad publicada' : 'propiedades publicadas'}
        </div>

        {data.publicaciones.length === 0 ? (
          <div style={{ fontSize: 13.5, color: 'oklch(55% 0.01 255)', background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
            Todavía no hay publicaciones activas.
          </div>
        ) : publicacionesFiltradas.length === 0 ? (
          <div style={{ fontSize: 13.5, color: 'oklch(55% 0.01 255)', background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
            No encontramos publicaciones que coincidan con la búsqueda o el filtro.
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, overflow: 'hidden' }}>
            {publicacionesFiltradas.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: 16,
                  borderTop: i === 0 ? 'none' : '1px solid oklch(92% 0.006 250)',
                }}
              >
                <div style={{ width: 140, height: 100, flex: 'none', borderRadius: 8, background: 'oklch(94% 0.005 250)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.fotos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.fotos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 10.5, color: 'oklch(60% 0.01 255)' }}>Sin foto</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-deep, var(--accent))', marginBottom: 3 }}>{p.titulo}</div>
                  {(p.direccion || p.localidad) && (
                    <div style={{ fontSize: 12.5, color: 'oklch(50% 0.01 255)', marginBottom: 4 }}>
                      {[p.direccion, p.localidad].filter(Boolean).join(' — ')}
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'oklch(45% 0.01 255)' }}>
                    {p.tipo} · {OPERACION_LABEL[p.operacion]}
                    {statsLine(p) ? ` · ${statsLine(p)}` : ''}
                  </div>
                </div>
                <div style={{ flex: 'none', textAlign: 'right', alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'oklch(55% 0.01 255)', marginBottom: 2 }}>
                      Precio de {p.operacion === 'venta' ? 'venta' : 'alquiler'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{formatPrecio(p.precio)}</div>
                  </div>
                  {data.telefono && (
                    <a
                      href={`https://wa.me/${waDigits(data.telefono)}?text=${encodeURIComponent(`Hola! Te escribo por "${p.titulo}"`)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'oklch(58% 0.14 150)', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
