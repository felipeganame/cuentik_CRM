'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { deleteFoto, recordContratoUpload, recordFotoUpload } from '@/lib/actions/alquileres';
import type { FotoConUrl } from '@/lib/queries';

const MAX_BYTES = 1024 * 1024;
const MAX_FOTOS = 15;

export function FotosUploader({
  alquilerId,
  propiedadId,
  inmobiliariaId,
  fotos,
}: {
  alquilerId: string;
  propiedadId: string;
  inmobiliariaId: string;
  fotos: FotoConUrl[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    if (fotos.length + fileList.length > MAX_FOTOS) {
      setError(`Máximo ${MAX_FOTOS} fotos por propiedad.`);
      return;
    }

    const files = Array.from(fileList);
    for (const file of files) {
      if (file.type !== 'image/jpeg') {
        setError('Solo se aceptan imágenes JPEG.');
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" supera 1 MB.`);
        return;
      }
    }

    setUploading(true);
    const supabase = createClient();
    try {
      for (const file of files) {
        const path = `${inmobiliariaId}/${propiedadId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('propiedad-fotos').upload(path, file);
        if (uploadError) throw uploadError;
        await recordFotoUpload(propiedadId, alquilerId, path);
      }
      router.refresh();
    } catch {
      setError('No se pudo subir alguna de las fotos.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete(fotoId: string, url: string) {
    const path = new URL(url).pathname.split(`/propiedad-fotos/`).pop()?.split('?')[0];
    if (!path) return;
    await deleteFoto(fotoId, decodeURIComponent(path), alquilerId);
    router.refresh();
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
        {fotos.map((foto) => (
          <div key={foto.id} style={{ position: 'relative' }}>
            <img src={foto.url} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid oklch(90% 0.007 250)' }} />
            <button
              type="button"
              onClick={() => handleDelete(foto.id, foto.url)}
              style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}
              aria-label="Eliminar foto"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <label
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 100,
          border: '1px dashed oklch(80% 0.01 250)', borderRadius: 10, cursor: uploading ? 'default' : 'pointer',
          fontSize: 12.5, color: 'oklch(52% 0.01 255)', fontWeight: 600,
        }}
      >
        {uploading ? 'Subiendo…' : 'Arrastrá o seleccioná hasta 15 fotos'}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg"
          multiple
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </label>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: 'oklch(56% 0.19 25)' }}>{error}</div>}
    </div>
  );
}

export function ContratoUploader({ alquilerId, inmobiliariaId, contratoUrl }: { alquilerId: string; inmobiliariaId: string; contratoUrl: string | null }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF.');
      return;
    }
    setUploading(true);
    const supabase = createClient();
    try {
      const path = `${inmobiliariaId}/${alquilerId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('contratos').upload(path, file);
      if (uploadError) throw uploadError;
      await recordContratoUpload(alquilerId, path);
      router.refresh();
    } catch {
      setError('No se pudo subir el contrato.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {contratoUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid oklch(88% 0.007 250)', borderRadius: 10, padding: '14px 16px', maxWidth: 480, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'oklch(94% 0.03 250)', color: 'oklch(50% 0.14 250)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flex: 'none' }}>
            PDF
          </div>
          <a href={contratoUrl} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Ver contrato
          </a>
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: 'oklch(55% 0.01 255)', marginBottom: 10 }}>Todavía no se subió el contrato.</div>
      )}
      <label style={{ display: 'inline-block', padding: '7px 12px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, background: '#fff', fontSize: 12, fontWeight: 600, cursor: uploading ? 'default' : 'pointer' }}>
        {uploading ? 'Subiendo…' : contratoUrl ? 'Reemplazar' : 'Subir contrato'}
        <input type="file" accept="application/pdf" disabled={uploading} onChange={(e) => handleFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
      </label>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: 'oklch(56% 0.19 25)' }}>{error}</div>}
    </div>
  );
}
