'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'Email o contraseña incorrectos.' };
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
  redirect(profile?.role === 'superadmin' ? '/superadmin' : '/dashboard');
}
