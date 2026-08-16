'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  actualizarPublicacion,
  crearPublicacion,
  deletePublicacionFoto,
  recordPublicacionFotoUpload,
  type PublicacionInput,
} from '@/lib/actions/publicaciones';
import type { Operacion, Publicacion } from '@/lib/types';
import type { PublicacionFotoConUrl } from '@/lib/queries';

const TIPOS = ['Departamento', 'Casa', 'Terreno', 'Cochera', 'Local', 'Oficina'];
const MAX_FOTO_BYTES = 1024 * 1024;
const MAX_FOTOS = 15;

function fieldStyle() {
  return { width: '100%', padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5, fontFamily: 'inherit' } as const;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
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
  const [localidad, setLocalidad] = useState(publicacion?.localidad ?? '');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!titulo.trim()) {
      setErrorMsg('Ingresá un título para la publicación.');
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    const input: PublicacionInput = {
      tipo,
      operacion,
      titulo,
      descripcion,
      precio: precio.trim() ? Number(precio) : null,
      localidad,
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
      setPendingFiles((prev) => [...prev, ...files].slice(0, MAX_FOTOS));
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Precio">
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Dejalo vacío para “Consultar precio”"
              style={fieldStyle()}
            />
          </Field>
          <Field label="Localidad">
            <input value={localidad} onChange={(e) => setLocalidad(e.target.value)} placeholder="Ej: Nueva Córdoba" style={fieldStyle()} />
          </Field>
        </div>
        <Field label="Descripción">
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} style={{ ...fieldStyle(), resize: 'vertical' }} />
        </Field>

        <Field label={`Fotos ${mode === 'crear' ? `(se suben al crear la publicación)` : ''}`}>
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
          {mode === 'crear' && pendingFiles.length > 0 && (
            <div style={{ fontSize: 12, color: 'oklch(50% 0.01 255)', marginBottom: 8 }}>
              {pendingFiles.length} foto(s) seleccionada(s)
            </div>
          )}
          <label style={{ display: 'inline-block', padding: '8px 14px', border: '1px dashed oklch(80% 0.01 250)', borderRadius: 8, background: 'none', fontSize: 12.5, fontWeight: 600, color: 'oklch(52% 0.01 255)', cursor: 'pointer' }}>
            + Agregar fotos (JPEG, hasta 1MB)
            <input ref={inputRef} type="file" accept="image/jpeg" multiple onChange={(e) => handleAddFiles(e.target.files)} style={{ display: 'none' }} />
          </label>
        </Field>
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
