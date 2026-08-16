import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentRole } from '@/lib/auth';
import { getPaginaPreview } from '@/lib/queries';
import { waDigits } from '@/lib/phone';

const OPERACION_LABEL: Record<string, string> = { venta: 'Venta', alquiler: 'Alquiler' };

function formatPrecio(precio: number | null) {
  if (precio === null) return 'Consultar precio';
  return `$${precio.toLocaleString('es-AR')}`;
}

export default async function MiPaginaPreviewPage() {
  const supabase = await createClient();
  const role = await getCurrentRole(supabase);
  if (!role) redirect('/login');
  if (role !== 'inmobiliaria') redirect('/dashboard');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user!.id).single();
  const data = await getPaginaPreview(supabase, profile?.inmobiliaria_id ?? '');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, oklch(97% 0.014 80))' }}>
      <div style={{ background: 'oklch(26% 0.025 255)', color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 12.5, fontWeight: 600 }}>
        VISTA PREVIA — así se vería tu página. Todavía no es pública ni tiene una dirección web propia.
      </div>

      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
        {data.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.logoUrl} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', background: '#fff', border: '1px solid var(--line, oklch(88% 0.014 75))' }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent, oklch(64% 0.16 40))' }} />
        )}
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Vollkorn, serif' }}>{data.nombre || 'Tu inmobiliaria'}</div>
      </header>

      {(data.bio || data.ubicacion) && (
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px 32px', display: 'grid', gridTemplateColumns: data.bio && data.ubicacion ? '1fr 1fr' : '1fr', gap: 24 }}>
          {data.bio && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'oklch(50% 0.02 255)', marginBottom: 8 }}>Quiénes somos</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.bio}</p>
            </div>
          )}
          {data.ubicacion && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'oklch(50% 0.02 255)', marginBottom: 8 }}>Dónde estamos</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.ubicacion}</p>
              {data.telefono && (
                <a
                  href={`https://wa.me/${waDigits(data.telefono)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 10, fontSize: 13, fontWeight: 600, color: 'var(--accent, oklch(64% 0.16 40))', textDecoration: 'none' }}
                >
                  Escribinos por WhatsApp →
                </a>
              )}
            </div>
          )}
        </section>
      )}

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px 60px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Vollkorn, serif', marginBottom: 18 }}>Propiedades disponibles</div>
        {data.publicaciones.length === 0 ? (
          <div style={{ fontSize: 13.5, color: 'oklch(50% 0.02 255)' }}>Todavía no hay publicaciones activas.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
            {data.publicaciones.map((p) => (
              <div key={p.id} style={{ background: 'var(--card, #fff)', border: '1px solid var(--line, oklch(88% 0.014 75))', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ height: 150, background: 'oklch(94% 0.005 250)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.fotos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.fotos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 11.5, color: 'oklch(60% 0.01 255)' }}>Sin foto</span>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--accent-deep, oklch(48% 0.14 36))', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                    {p.tipo} · {OPERACION_LABEL[p.operacion]}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{p.titulo}</div>
                  {p.localidad && <div style={{ fontSize: 12, color: 'oklch(50% 0.02 255)', marginBottom: 8 }}>{p.localidad}</div>}
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{formatPrecio(p.precio)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
