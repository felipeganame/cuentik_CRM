'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EMAIL_PATTERN, formatTelefono } from '@/lib/phone';

const DEFAULT_LIMITE_ALQUILERES = 20;

export type RegistroState = { error: string | null };

export async function registrarInmobiliaria(_prevState: RegistroState, formData: FormData): Promise<RegistroState> {
  const nombre = String(formData.get('nombre') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const telefono = formatTelefono(
    String(formData.get('telefono_dial') || ''),
    String(formData.get('telefono_area') || ''),
    String(formData.get('telefono_numero') || '')
  );

  if (!nombre) return { error: 'Ingresá el nombre de tu inmobiliaria.' };
  if (!EMAIL_PATTERN.test(email)) return { error: 'Ingresá un email válido.' };
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' };

  const admin = createAdminClient();

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError || !userData?.user) {
    if (userError?.message?.toLowerCase().includes('already been registered')) {
      return { error: 'Ya existe una cuenta con ese email. Iniciá sesión en vez de registrarte de nuevo.' };
    }
    return { error: 'No se pudo crear la cuenta. Probá de nuevo.' };
  }

  const { data: inmobiliaria, error: inmobiliariaError } = await admin
    .from('inmobiliarias')
    .insert({
      nombre,
      email_contacto: email,
      telefono,
      limite_alquileres: DEFAULT_LIMITE_ALQUILERES,
    })
    .select()
    .single();
  if (inmobiliariaError || !inmobiliaria) {
    await admin.auth.admin.deleteUser(userData.user.id);
    return { error: 'No se pudo crear la cuenta. Probá de nuevo.' };
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: userData.user.id,
    role: 'inmobiliaria',
    inmobiliaria_id: inmobiliaria.id,
    nombre,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id);
    await admin.from('inmobiliarias').delete().eq('id', inmobiliaria.id);
    return { error: 'No se pudo crear la cuenta. Probá de nuevo.' };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect('/login');
  }

  redirect('/dashboard');
}
