'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null; mfaRequired?: boolean };

async function redirectByRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<never> {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return redirect(profile?.role === 'superadmin' ? '/superadmin' : '/dashboard');
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'Email o contraseña incorrectos.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, inmobiliarias(estado)')
    .eq('id', data.user.id)
    .single();

  if (profile?.role === 'inmobiliaria') {
    const rel = profile.inmobiliarias as unknown as { estado: string } | { estado: string }[] | null;
    const estado = Array.isArray(rel) ? rel[0]?.estado : rel?.estado;
    if (estado === 'Suspendido') {
      await supabase.auth.signOut();
      return { error: 'Tu cuenta está suspendida. Contactá a Cuentik CRM para regularizar el pago.' };
    }
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    return { error: null, mfaRequired: true };
  }

  return redirectByRole(supabase, data.user.id);
}

export async function verifyMfaCode(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const code = String(formData.get('code') || '');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Tu sesión expiró, volvé a ingresar tu email y contraseña.' };

  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === 'verified');
  if (factorsError || !factor) return { error: 'No se encontró un factor de verificación activo.' };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { error: 'Código incorrecto. Probá de nuevo.', mfaRequired: true };

  return redirectByRole(supabase, user.id);
}
