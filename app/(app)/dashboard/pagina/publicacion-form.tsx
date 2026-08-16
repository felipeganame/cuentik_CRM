'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  actualizarPublicacion,
  crearPublicacion,
  deletePublicacionFoto,
  recordPublicacionFotoUpload,
  type PublicacionInput,
} from '@/lib/actions/publicaciones';
import { ESTADO_OPCIONES, ORIENTACION_OPCIONES, SERVICIOS_OPCIONES, TIPOS_CON_TERRENO, type Moneda, type Operacion, type Publicacion } from '@/lib/types';
import type { PublicacionFotoConUrl } from '@/lib/queries';
import { PAISES } from '@/lib/paises';

const TIPOS = ['Departamento', 'Casa', 'Terreno', 'Cochera', 'Local', 'Oficina'];
const MAX_FOTO_BYTES = 1024 * 1024;
const MAX_FOTOS = 15;

function fieldStyle() {
  return { width: '100%', padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5, fontFamily: 'inherit' } as const;
}

function numOrNull(v: string): number | null {
  return v.trim() ? Number(v) : null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginTop: 22, marginBottom: 12 }}>
      {children}
    </div>
  );
}

export function PublicacionForm({
  mode,
  inmobiliariaId,
  publicacion,
  fotos = [],
}: {
  mode: 'crear' | 'editar';
  inmobiliariaId: string;
  publicacion?: Publicacion;
  fotos?: PublicacionFotoConUrl[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState(publicacion?.tipo ?? 'Departamento');
  const [operacion, setOperacion] = useState<Operacion>(publicacion?.operacion ?? 'alquiler');
  const [titulo, setTitulo] = useState(publicacion?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(publicacion?.descripcion ?? '');
  const [precio, setPrecio] = useState(publicacion?.precio != null ? String(publicacion.precio) : '');
  const [moneda, setMoneda] = useState<Moneda>(publicacion?.moneda ?? 'ARS');
  const [expensas, setExpensas] = useState(publicacion?.expensas != null ? String(publicacion.expensas) : '');
  const [pais, setPais] = useState(publicacion?.pais ?? 'Argentina');
  const [provincia, setProvincia] = useState(publicacion?.provincia ?? 'Córdoba');
  const [ciudad, setCiudad] = useState(publicacion?.ciudad ?? '');
  const [calle, setCalle] = useState(publicacion?.calle ?? '');
  const [numero, setNumero] = useState(publicacion?.numero ?? '');
  const [barrio, setBarrio] = useState(publicacion?.barrio ?? '');
  const [dormitorios, setDormitorios] = useState(publicacion?.dormitorios != null ? String(publicacion.dormitorios) : '');
  const [banos, setBanos] = useState(publicacion?.banos != null ? String(publicacion.banos) : '');
  const [ambientes, setAmbientes] = useState(publicacion?.ambientes != null ? String(publicacion.ambientes) : '');
  const [superficieTotal, setSuperficieTotal] = useState(publicacion?.superficie_total != null ? String(publicacion.superficie_total) : '');
  const [superficieCubierta, setSuperficieCubierta] = useState(publicacion?.superficie_cubierta != null ? String(publicacion.superficie_cubierta) : '');
  const [superficieSemicubierta, setSuperficieSemicubierta] = useState(publicacion?.superficie_semicubierta != null ? String(publicacion.superficie_semicubierta) : '');
  const [superficieTerreno, setSuperficieTerreno] = useState(publicacion?.superficie_terreno != null ? String(publicacion.superficie_terreno) : '');
  const [antiguedad, setAntiguedad] = useState(publicacion?.antiguedad ?? '');
  const [orientacion, setOrientacion] = useState(publicacion?.orientacion ?? '');
  const [estado, setEstado] = useState(publicacion?.estado ?? ESTADO_OPCIONES[0]);
  const [videoUrl, setVideoUrl] = useState(publicacion?.video_url ?? '');
  const [servicios, setServicios] = useState<string[]>(publicacion?.servicios ?? []);
  const [servicioCustom, setServicioCustom] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tieneTerreno = TIPOS_CON_TERRENO.includes(tipo as (typeof TIPOS_CON_TERRENO)[number]);

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleServicio(s: string) {
    setServicios((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function agregarServicioCustom() {
    const valor = servicioCustom.trim();
    if (!valor || servicios.includes(valor)) {
      setServicioCustom('');
      return;
    }
    setServicios((prev) => [...prev, valor]);
    setServicioCustom('');
  }

  async function handleSubmit() {
    setSaving(true);
    setErrorMsg(null);

    const input: PublicacionInput = {
      tipo,
      operacion,
      titulo,
      descripcion,
      precio: numOrNull(precio),
      moneda,
      pais,
      provincia,
      ciudad,
      calle,
      numero,
      barrio,
      dormitorios: numOrNull(dormitorios),
      banos: numOrNull(banos),
      ambientes: numOrNull(ambientes),
      superficieTotal: tieneTerreno ? numOrNull(superficieTotal) : null,
      superficieCubierta: numOrNull(superficieCubierta),
      superficieSemicubierta: numOrNull(superficieSemicubierta),
      superficieTerreno: tieneTerreno ? numOrNull(superficieTerreno) : null,
      antiguedad,
      orientacion,
      estado,
      expensas: numOrNull(expensas),
      videoUrl,
      servicios,
    };

    try {
      if (mode === 'crear') {
        const result = await crearPublicacion(input);
        if ('error' in result) {
          setErrorMsg(result.error);
          setSaving(false);
          return;
        }
        const supabase = createClient();
        for (const file of pendingFiles) {
          const path = `${inmobiliariaId}/${result.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('publicacion-fotos').upload(path, file);
          if (!uploadError) await recordPublicacionFotoUpload(result.id, path);
        }
        router.push('/dashboard/pagina');
      } else if (publicacion) {
        const result = await actualizarPublicacion(publicacion.id, input);
        if ('error' in result) {
          setErrorMsg(result.error);
          setSaving(false);
          return;
        }
        router.push('/dashboard/pagina');
      }
    } catch {
      setErrorMsg('No se pudo guardar la publicación. Intentá de nuevo.');
      setSaving(false);
    }
  }

  async function handleAddFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);
    const files = Array.from(fileList);
    for (const file of files) {
      if (file.type !== 'image/jpeg') {
        setErrorMsg('Solo se aceptan imágenes JPEG.');
        return;
      }
      if (file.size > MAX_FOTO_BYTES) {
        setErrorMsg(`"${file.name}" supera 1 MB.`);
        return;
      }
    }

    if (mode === 'crear') {
      const nextFiles = [...pendingFiles, ...files].slice(0, MAX_FOTOS);
      setPendingFiles(nextFiles);
      setPendingPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return nextFiles.map((f) => URL.createObjectURL(f));
      });
      return;
    }

    if (!publicacion) return;
    const supabase = createClient();
    for (const file of files) {
      const path = `${inmobiliariaId}/${publicacion.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('publicacion-fotos').upload(path, file);
      if (!uploadError) await recordPublicacionFotoUpload(publicacion.id, path);
    }
    router.refresh();
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemovePendingFile(index: number) {
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDeleteFoto(fotoId: string, url: string) {
    if (!publicacion) return;
    const path = new URL(url).pathname.split('/publicacion-fotos/').pop()?.split('?')[0];
    if (!path) return;
    await deletePublicacionFoto(fotoId, decodeURIComponent(path), publicacion.id);
    router.refresh();
  }

  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Título *">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Depto 2 ambientes en Nueva Córdoba" style={fieldStyle()} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Tipo">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={fieldStyle()}>
              {TIPOS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Operación">
            <select value={operacion} onChange={(e) => setOperacion(e.target.value as Operacion)} style={fieldStyle()}>
              <option value="alquiler">Alquiler</option>
              <option value="venta">Venta</option>
            </select>
          </Field>
        </div>

        <SectionTitle>Ubicación</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="País *">
            <select value={pais} onChange={(e) => setPais(e.target.value)} style={fieldStyle()}>
              {PAISES.map((p) => (
                <option key={p.iso} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Provincia *">
            <input value={provincia} onChange={(e) => setProvincia(e.target.value)} placeholder="Ej: Córdoba" style={fieldStyle()} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Ciudad *">
            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ej: Ciudad de Córdoba" style={fieldStyle()} />
          </Field>
          <Field label="Barrio">
            <input value={barrio} onChange={(e) => setBarrio(e.target.value)} placeholder="Ej: Nueva Córdoba" style={fieldStyle()} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Field label="Calle *">
            <input value={calle} onChange={(e) => setCalle(e.target.value)} placeholder="Ej: Poeta Lugones" style={fieldStyle()} />
          </Field>
          <Field label="Número *">
            <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ej: 300" style={fieldStyle()} />
          </Field>
        </div>

        <SectionTitle>Precio</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Moneda">
            <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} style={fieldStyle()}>
              <option value="ARS">Pesos (ARS)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </Field>
          <Field label="Precio">
            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Dejalo vacío para “Consultar precio”" style={fieldStyle()} />
          </Field>
          <Field label="Expensas">
            <input type="number" value={expensas} onChange={(e) => setExpensas(e.target.value)} style={fieldStyle()} />
          </Field>
        </div>

        <SectionTitle>Detalles</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Ambientes">
            <input type="number" value={ambientes} onChange={(e) => setAmbientes(e.target.value)} style={fieldStyle()} />
          </Field>
          <Field label="Dormitorios">
            <input type="number" value={dormitorios} onChange={(e) => setDormitorios(e.target.value)} style={fieldStyle()} />
          </Field>
          <Field label="Baños">
            <input type="number" value={banos} onChange={(e) => setBanos(e.target.value)} style={fieldStyle()} />
          </Field>
          {tieneTerreno && (
            <Field label="Sup. total (m², opcional)">
              <input type="number" value={superficieTotal} onChange={(e) => setSuperficieTotal(e.target.value)} style={fieldStyle()} />
            </Field>
          )}
          <Field label="Sup. cubierta (m², opcional)">
            <input type="number" value={superficieCubierta} onChange={(e) => setSuperficieCubierta(e.target.value)} style={fieldStyle()} />
          </Field>
          <Field label="Sup. semicubierta (m², opcional)">
            <input type="number" value={superficieSemicubierta} onChange={(e) => setSuperficieSemicubierta(e.target.value)} style={fieldStyle()} />
          </Field>
          {tieneTerreno && (
            <Field label="Sup. terreno (m², opcional)">
              <input type="number" value={superficieTerreno} onChange={(e) => setSuperficieTerreno(e.target.value)} style={fieldStyle()} />
            </Field>
          )}
          <Field label="Antigüedad">
            <input value={antiguedad} onChange={(e) => setAntiguedad(e.target.value)} placeholder="Ej: A estrenar, 20 años" style={fieldStyle()} />
          </Field>
          <Field label="Orientación">
            <select value={orientacion} onChange={(e) => setOrientacion(e.target.value)} style={fieldStyle()}>
              <option value="">Sin especificar</option>
              {ORIENTACION_OPCIONES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Estado *">
            <select value={estado} onChange={(e) => setEstado(e.target.value)} style={fieldStyle()}>
              {ESTADO_OPCIONES.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </Field>
        </div>

        <SectionTitle>Servicios</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {SERVICIOS_OPCIONES.map((s) => {
            const checked = servicios.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleServicio(s)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 20,
                  border: `1px solid ${checked ? 'var(--accent)' : 'oklch(87% 0.007 250)'}`,
                  background: checked ? 'oklch(96% 0.03 40)' : '#fff',
                  color: checked ? 'var(--accent-deep, var(--accent))' : 'oklch(45% 0.01 255)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            );
          })}
          {servicios
            .filter((s) => !(SERVICIOS_OPCIONES as readonly string[]).includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleServicio(s)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 20,
                  border: '1px solid var(--accent)',
                  background: 'oklch(96% 0.03 40)',
                  color: 'var(--accent-deep, var(--accent))',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s} ×
              </button>
            ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={servicioCustom}
            onChange={(e) => setServicioCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarServicioCustom();
              }
            }}
            placeholder="Agregar otro servicio (Ej: Aire acondicionado)"
            style={{ ...fieldStyle(), flex: 1 }}
          />
          <button
            type="button"
            onClick={agregarServicioCustom}
            style={{ padding: '9px 16px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Agregar
          </button>
        </div>

        <SectionTitle>Descripción</SectionTitle>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} style={{ ...fieldStyle(), resize: 'vertical' }} />

        <SectionTitle>Video (opcional)</SectionTitle>
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Link de YouTube o Vimeo" style={fieldStyle()} />

        <SectionTitle>Fotos {mode === 'crear' ? '(se suben al crear la publicación)' : ''}</SectionTitle>
        <div>
          {mode === 'editar' && fotos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginBottom: 10 }}>
              {fotos.map((foto) => (
                <div key={foto.id} style={{ position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto.url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid oklch(90% 0.007 250)', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => handleDeleteFoto(foto.id, foto.url)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', fontSize: 11, lineHeight: 1 }}
                    aria-label="Eliminar foto"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {mode === 'crear' && pendingPreviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginBottom: 10 }}>
              {pendingPreviews.map((url, i) => (
                <div key={url} style={{ position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid oklch(90% 0.007 250)', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => handleRemovePendingFile(i)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', fontSize: 11, lineHeight: 1 }}
                    aria-label="Quitar foto"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <label style={{ display: 'inline-block', padding: '8px 14px', border: '1px dashed oklch(80% 0.01 250)', borderRadius: 8, background: 'none', fontSize: 12.5, fontWeight: 600, color: 'oklch(52% 0.01 255)', cursor: 'pointer' }}>
            + Agregar fotos (JPEG, hasta 1MB)
            <input ref={inputRef} type="file" accept="image/jpeg" multiple onChange={(e) => handleAddFiles(e.target.files)} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {errorMsg && <div style={{ marginTop: 16, fontSize: 13, color: 'oklch(56% 0.19 25)' }}>{errorMsg}</div>}

      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}
        >
          {saving ? 'Guardando…' : mode === 'crear' ? 'Crear publicación' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/pagina')}
          style={{ padding: '10px 20px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, background: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
