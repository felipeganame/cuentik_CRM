'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { EMAIL_PATTERN } from '@/lib/phone';

export type RecuperarState = { error: string | null; success: boolean };

export async function solicitarRecuperacion(_prevState: RecuperarState, formData: FormData): Promise<RecuperarState> {
  const email = String(formData.get('email') || '').trim();
  if (!EMAIL_PATTERN.test(email)) return { error: 'Ingresá un email válido.', success: false };

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cuentik-crm-pehx.vercel.app';
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  // Always report success, whether or not the email is registered — avoids
  // leaking which emails have an account.
  return { error: null, success: true };
}

export type ActualizarPasswordState = { error: string | null; success: boolean };

export async function actualizarPassword(
  _prevState: ActualizarPasswordState,
  formData: FormData
): Promise<ActualizarPasswordState> {
  const password = String(formData.get('password') || '');
  const confirmacion = String(formData.get('confirmacion') || '');

  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.', success: false };
  if (password !== confirmacion) return { error: 'Las contraseñas no coinciden.', success: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'El link expiró o ya se usó. Pedí uno nuevo desde "Olvidé mi contraseña".', success: false };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: 'No se pudo actualizar la contraseña. Probá de nuevo.', success: false };

  return { error: null, success: true };
}
