'use client';

import { useActionState, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { recordLogoUpload, updatePassword, updatePerfil, type PasswordState, type PerfilState } from '@/lib/actions/perfil';
import { parseTelefono } from '@/lib/phone';

function fieldStyle() {
  return { width: '100%', padding: '9px 11px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 7, fontSize: 13.5 } as const;
}

function soloDigitos(e: React.ChangeEvent<HTMLInputElement>) {
  e.target.value = e.target.value.replace(/\D/g, '');
}

const perfilInitial: PerfilState = { error: null, success: false };
const passwordInitial: PasswordState = { error: null, success: false };
const MAX_LOGO_BYTES = 1024 * 1024;

export function LogoForm({ inmobiliariaId, logoUrl }: { inmobiliariaId: string; logoUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
      setError('Solo se aceptan imágenes JPEG, PNG o SVG.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError('El logo no puede superar 1 MB.');
      return;
    }
    setUploading(true);
    const supabase = createClient();
    try {
      const path = `${inmobiliariaId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(path, file);
      if (uploadError) throw uploadError;
      await recordLogoUpload(path);
      router.refresh();
    } catch {
      setError('No se pudo subir el logo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
        Logo de la inmobiliaria
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 10, border: '1px solid oklch(90% 0.007 250)', background: 'oklch(97% 0.004 250)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: 'none' }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: 11, color: 'oklch(60% 0.01 255)' }}>Sin logo</span>
          )}
        </div>
        <label style={{ padding: '9px 14px', border: '1px solid oklch(87% 0.007 250)', borderRadius: 8, background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: uploading ? 'default' : 'pointer' }}>
          {uploading ? 'Subiendo…' : logoUrl ? 'Reemplazar logo' : 'Subir logo'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/svg+xml"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      {error && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{error}</div>}
    </div>
  );
}

export function PerfilForm({
  nombreInmobiliaria,
  nombreContacto,
  telefono,
  emailContacto,
}: {
  nombreInmobiliaria: string;
  nombreContacto: string;
  telefono: string;
  emailContacto: string;
}) {
  const [state, formAction, pending] = useActionState(updatePerfil, perfilInitial);

  return (
    <form action={formAction} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
        Perfil de la inmobiliaria
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nombre de la inmobiliaria</div>
          <input name="nombre_inmobiliaria" type="text" defaultValue={nombreInmobiliaria} style={fieldStyle()} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nombre de contacto</div>
          <input name="nombre_contacto" type="text" defaultValue={nombreContacto} style={fieldStyle()} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email de contacto</div>
          <input type="text" value={emailContacto} disabled style={{ ...fieldStyle(), background: 'oklch(96% 0.004 250)', color: 'oklch(50% 0.01 255)' }} />
          <div style={{ fontSize: 11.5, color: 'oklch(55% 0.01 255)', marginTop: 5 }}>Es el email con el que iniciás sesión, no se puede modificar acá.</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Teléfono</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              name="telefono_area"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Cód. área"
              defaultValue={parseTelefono(telefono).area}
              onChange={soloDigitos}
              style={{ ...fieldStyle(), width: 90 }}
            />
            <input
              name="telefono_numero"
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="Número"
              defaultValue={parseTelefono(telefono).numero}
              onChange={soloDigitos}
              style={fieldStyle()}
            />
          </div>
        </div>
      </div>
      {state.error && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{state.error}</div>}
      {state.success && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(45% 0.13 150)' }}>Guardado.</div>}
      <button
        type="submit"
        disabled={pending}
        style={{ marginTop: 16, padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
      >
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, passwordInitial);

  return (
    <form action={formAction} style={{ background: '#fff', border: '1px solid oklch(90% 0.007 250)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(52% 0.01 255)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 14 }}>
        Seguridad
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nueva contraseña</div>
        <input name="nueva_password" type="password" placeholder="Elegí una nueva contraseña" style={fieldStyle()} />
      </div>
      {state.error && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(56% 0.19 25)' }}>{state.error}</div>}
      {state.success && <div style={{ marginTop: 10, fontSize: 12.5, color: 'oklch(45% 0.13 150)' }}>Contraseña actualizada.</div>}
      <button
        type="submit"
        disabled={pending}
        style={{ marginTop: 16, padding: '10px 16px', border: 'none', borderRadius: 8, background: 'oklch(55% 0.16 250)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: pending ? 'default' : 'pointer' }}
      >
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}
