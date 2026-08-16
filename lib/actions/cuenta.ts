'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type EliminarCuentaState = { error: string | null };

export async function eliminarCuenta(_prevState: EliminarCuentaState, formData: FormData): Promise<EliminarCuentaState> {
  const confirmacion = String(formData.get('confirmacion') || '');
  if (confirmacion !== 'ELIMINAR') {
    return { error: 'Escribí ELIMINAR para confirmar.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('role, inmobiliaria_id').eq('id', user.id).single();
  if (profile?.role !== 'inmobiliaria' || !profile.inmobiliaria_id) {
    return { error: 'No se encontró la cuenta a eliminar.' };
  }
  const inmobiliariaId = profile.inmobiliaria_id;

  const admin = createAdminClient();

  // Gather storage paths before the DB cascade removes the rows that
  // reference them — deleting a row doesn't delete the underlying file.
  const { data: inmobiliaria } = await admin.from('inmobiliarias').select('logo_url').eq('id', inmobiliariaId).single();
  const { data: alquileres } = await admin.from('alquileres').select('id, contrato_pdf_path').eq('inmobiliaria_id', inmobiliariaId);
  const alquilerIds = (alquileres ?? []).map((a) => a.id);

  const { data: propiedades } = alquilerIds.length
    ? await admin.from('propiedades').select('id').in('alquiler_id', alquilerIds)
    : { data: [] as { id: string }[] };
  const propiedadIds = (propiedades ?? []).map((p) => p.id);

  const { data: fotos } = propiedadIds.length
    ? await admin.from('propiedad_fotos').select('storage_path').in('propiedad_id', propiedadIds)
    : { data: [] as { storage_path: string }[] };

  const { error: deleteError } = await admin.from('inmobiliarias').delete().eq('id', inmobiliariaId);
  if (deleteError) return { error: 'No se pudo eliminar la cuenta. Probá de nuevo o contactanos.' };

  const fotoPaths = (fotos ?? []).map((f) => f.storage_path);
  if (fotoPaths.length > 0) await admin.storage.from('propiedad-fotos').remove(fotoPaths);

  const contratoPaths = (alquileres ?? []).map((a) => a.contrato_pdf_path).filter((p): p is string => Boolean(p));
  if (contratoPaths.length > 0) await admin.storage.from('contratos').remove(contratoPaths);

  if (inmobiliaria?.logo_url) await admin.storage.from('logos').remove([inmobiliaria.logo_url]);

  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();

  redirect('/login?motivo=cuenta_eliminada');
}
