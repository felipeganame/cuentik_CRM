import type { SupabaseClient } from '@supabase/supabase-js';

export async function getCurrentRole(supabase: SupabaseClient): Promise<'superadmin' | 'inmobiliaria' | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return (profile?.role as 'superadmin' | 'inmobiliaria' | undefined) ?? null;
}

export async function requireSuperadmin(supabase: SupabaseClient) {
  const role = await getCurrentRole(supabase);
  if (role !== 'superadmin') throw new Error('No autorizado');
}
