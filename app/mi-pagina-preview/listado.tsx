'use client';

import { useState } from 'react';
import { waDigits } from '@/lib/phone';
import type { PublicacionPreview } from '@/lib/queries';

const OPERACION_LABEL: Record<string, string> = { venta: 'Venta', alquiler: 'Alquiler' };
const MONEDA_SIMBOLO: Record<string, string> = { ARS: '$', USD: 'U$S' };

function formatPrecio(precio: number | null, moneda: string) {
  if (precio === null) return 'Consultar precio';
  return `${MONEDA_SIMBOLO[moneda] ?? '$'} ${precio.toLocaleString('es-AR')}`;
}

function direccionCorta(p: PublicacionPreview) {
  return [`${p.calle} ${p.numero}`.trim(), p.barrio || p.ciudad].filter(Boolean).join(' — ');
}

function direccionCompleta(p: PublicacionPreview) {
  return [`${p.calle} ${p.numero}`.trim(), p.barrio, p.ciudad, p.provincia, p.pais].filter(Boolean).join(', ');
}

function statsLine(p: PublicacionPreview) {
  const parts: string[] = [];
  if (p.ambientes) parts.push(`${p.ambientes} amb.`);
  if (p.dormitorios) parts.push(`${p.dormitorios} dorm.`);
  if (p.banos) parts.push(`${p.banos} baño${p.banos === 1 ? '' : 's'}`);
  if (p.superficie_total) parts.push(`${p.superficie_total} m² tot.`);
  return parts.join(' · ');
}

function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function DetalleRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'oklch(55% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

export function PaginaPreviewListado({ publicaciones, telefono }: { publicaciones: PublicacionPreview[]; telefono: string | null }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 10, overflow: 'hidden' }}>
      {publicaciones.map((p, i) => {
        const expanded = expandedId === p.id;
        const embedUrl = p.video_url ? videoEmbedUrl(p.video_url) : null;
        return (
          <div key={p.id} style={{ borderTop: i === 0 ? 'none' : '1px solid oklch(92% 0.006 250)' }}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setExpandedId(expanded ? null : p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setExpandedId(expanded ? null : p.id);
              }}
              style={{ display: 'flex', gap: 16, padding: 16, cursor: 'pointer' }}
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
                <div style={{ fontSize: 12.5, color: 'oklch(50% 0.01 255)', marginBottom: 4 }}>{direccionCorta(p)}</div>
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
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{formatPrecio(p.precio, p.moneda)}</div>
                </div>
                {telefono && (
                  <a
                    href={`https://wa.me/${waDigits(telefono)}?text=${encodeURIComponent(`Hola! Te escribo por "${p.titulo}"`)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'oklch(58% 0.14 150)', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            {expanded && (
              <div style={{ padding: '0 16px 20px', borderTop: '1px solid oklch(94% 0.005 250)' }}>
                {p.fotos.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 0 0' }}>
                    {p.fotos.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} src={url} alt="" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, flex: 'none' }} />
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 13, color: 'oklch(45% 0.01 255)', marginTop: 16 }}>{direccionCompleta(p)}</div>

                {p.descripcion && (
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 14, whiteSpace: 'pre-wrap' }}>{p.descripcion}</p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 14, marginTop: 16 }}>
                  <DetalleRow label="Ambientes" value={p.ambientes} />
                  <DetalleRow label="Dormitorios" value={p.dormitorios} />
                  <DetalleRow label="Baños" value={p.banos} />
                  <DetalleRow label="Sup. total" value={p.superficie_total ? `${p.superficie_total} m²` : null} />
                  <DetalleRow label="Sup. cubierta" value={p.superficie_cubierta ? `${p.superficie_cubierta} m²` : null} />
                  <DetalleRow label="Sup. semicubierta" value={p.superficie_semicubierta ? `${p.superficie_semicubierta} m²` : null} />
                  <DetalleRow label="Sup. terreno" value={p.superficie_terreno ? `${p.superficie_terreno} m²` : null} />
                  <DetalleRow label="Antigüedad" value={p.antiguedad} />
                  <DetalleRow label="Orientación" value={p.orientacion} />
                  <DetalleRow label="Estado" value={p.estado} />
                  <DetalleRow label="Expensas" value={p.expensas ? `$ ${p.expensas.toLocaleString('es-AR')}` : null} />
                </div>

                {p.servicios.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'oklch(55% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8 }}>
                      Servicios
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {p.servicios.map((s) => (
                        <span key={s} style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: 'oklch(96% 0.004 250)', color: 'oklch(40% 0.01 255)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {embedUrl && (
                  <div style={{ marginTop: 18, aspectRatio: '16/9', maxWidth: 480 }}>
                    <iframe
                      src={embedUrl}
                      title="Video de la propiedad"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
