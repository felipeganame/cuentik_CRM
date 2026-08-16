'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EMAIL_PATTERN, formatTelefono, telefonoErrorMessage } from '@/lib/phone';

const DEFAULT_LIMITE_ALQUILERES = 20;

export type RegistroState = { error: string | null; success: boolean };

export async function registrarInmobiliaria(_prevState: RegistroState, formData: FormData): Promise<RegistroState> {
  const nombre = String(formData.get('nombre') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const telefonoNumero = String(formData.get('telefono_numero') || '');
  const telefono = formatTelefono(String(formData.get('telefono_dial') || ''), telefonoNumero);

  if (!nombre) return { error: 'Ingresá el nombre de tu inmobiliaria.', success: false };
  if (!EMAIL_PATTERN.test(email)) return { error: 'Ingresá un email válido.', success: false };
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.', success: false };
  const telefonoError = telefonoErrorMessage(telefonoNumero);
  if (telefonoError) return { error: telefonoError, success: false };

  const admin = createAdminClient();

  // Real (non-admin) signUp so Supabase sends its own confirmation email and
  // the account can't log in until the link is clicked — email_confirm would
  // let admin.createUser skip that entirely.
  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cuentik-crm-pehx.vercel.app';
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (userError || !userData?.user) {
    if (userError?.message?.toLowerCase().includes('already registered') || userError?.code === 'user_already_exists') {
      return { error: 'Ya existe una cuenta con ese email. Iniciá sesión en vez de registrarte de nuevo.', success: false };
    }
    return { error: 'No se pudo crear la cuenta. Probá de nuevo.', success: false };
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
    return { error: 'No se pudo crear la cuenta. Probá de nuevo.', success: false };
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
    return { error: 'No se pudo crear la cuenta. Probá de nuevo.', success: false };
  }

  return { error: null, success: true };
}
