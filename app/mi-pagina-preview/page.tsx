import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentRole } from '@/lib/auth';
import { getPaginaPreview, type PublicacionPreview } from '@/lib/queries';
import { PaginaPreviewFiltros } from './filtros';
import { PaginaPreviewListado } from './listado';

function aplicarFiltros(
  publicaciones: PublicacionPreview[],
  params: { q: string; operacion: string; tipo: string; orden: string }
): PublicacionPreview[] {
  const query = params.q.trim().toLowerCase();
  const filtradas = publicaciones.filter((p) => {
    if (params.operacion !== 'Todos' && params.operacion.toLowerCase() !== p.operacion) return false;
    if (params.tipo !== 'Todos' && params.tipo !== p.tipo) return false;
    if (query) {
      const haystack = [p.titulo, p.calle, p.numero, p.barrio, p.ciudad].filter(Boolean).join(' ').toLowerCase();
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
          <PaginaPreviewListado publicaciones={publicacionesFiltradas} telefono={data.telefono} />
        )}
      </main>
    </div>
  );
}
