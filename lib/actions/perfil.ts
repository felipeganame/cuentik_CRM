'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { formatTelefono } from '@/lib/phone';

export type PerfilState = { error: string | null; success: boolean };

export async function updatePerfil(_prevState: PerfilState, formData: FormData): Promise<PerfilState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado', success: false };

  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user.id).single();
  if (!profile?.inmobiliaria_id) return { error: 'No se encontró la inmobiliaria', success: false };

  const nombreContacto = String(formData.get('nombre_contacto') || '');
  const nombreInmobiliaria = String(formData.get('nombre_inmobiliaria') || '');
  const telefono = formatTelefono(String(formData.get('telefono_dial') || ''), String(formData.get('telefono_area') || ''), String(formData.get('telefono_numero') || ''));

  const { error: profileError } = await supabase.from('profiles').update({ nombre: nombreContacto }).eq('id', user.id);
  if (profileError) return { error: 'No se pudo guardar el perfil.', success: false };

  const { error: inmobiliariaError } = await supabase
    .from('inmobiliarias')
    .update({ nombre: nombreInmobiliaria, telefono })
    .eq('id', profile.inmobiliaria_id);
  if (inmobiliariaError) return { error: 'No se pudo guardar la inmobiliaria.', success: false };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/configuracion');
  return { error: null, success: true };
}

export async function recordLogoUpload(storagePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id, inmobiliarias(logo_url)').eq('id', user.id).single();
  if (!profile?.inmobiliaria_id) throw new Error('No se encontró la inmobiliaria');

  const rel = profile.inmobiliarias as unknown as { logo_url: string | null } | { logo_url: string | null }[] | null;
  const oldPath = Array.isArray(rel) ? rel[0]?.logo_url : rel?.logo_url;

  const { error } = await supabase.from('inmobiliarias').update({ logo_url: storagePath }).eq('id', profile.inmobiliaria_id);
  if (error) throw error;

  if (oldPath) await supabase.storage.from('logos').remove([oldPath]);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/configuracion');
}

export type PasswordState = { error: string | null; success: boolean };

export async function updatePassword(_prevState: PasswordState, formData: FormData): Promise<PasswordState> {
  const supabase = await createClient();
  const nueva = String(formData.get('nueva_password') || '');

  if (nueva.length < 8) {
    return { error: 'La nueva contraseña debe tener al menos 8 caracteres.', success: false };
  }

  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) return { error: 'No se pudo cambiar la contraseña.', success: false };

  return { error: null, success: true };
}
