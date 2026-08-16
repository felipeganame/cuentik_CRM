'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Operacion } from '@/lib/types';

export type PublicacionInput = {
  tipo: string;
  operacion: Operacion;
  titulo: string;
  descripcion: string;
  precio: number | null;
  localidad: string;
  direccion: string;
  dormitorios: number | null;
  banos: number | null;
  ambientes: number | null;
  superficieTotal: number | null;
  superficieCubierta: number | null;
  superficieTerreno: number | null;
  antiguedad: string;
  orientacion: string;
  estado: string;
  expensas: number | null;
  videoUrl: string;
  servicios: string[];
};

function publicacionRow(input: PublicacionInput) {
  return {
    tipo: input.tipo,
    operacion: input.operacion,
    titulo: input.titulo.trim(),
    descripcion: input.descripcion.trim() || null,
    precio: input.precio,
    localidad: input.localidad.trim() || null,
    direccion: input.direccion.trim() || null,
    dormitorios: input.dormitorios,
    banos: input.banos,
    ambientes: input.ambientes,
    superficie_total: input.superficieTotal,
    superficie_cubierta: input.superficieCubierta,
    superficie_terreno: input.superficieTerreno,
    antiguedad: input.antiguedad.trim() || null,
    orientacion: input.orientacion.trim() || null,
    estado: input.estado.trim() || null,
    expensas: input.expensas,
    video_url: input.videoUrl.trim() || null,
    servicios: input.servicios,
  };
}

async function getInmobiliariaId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('inmobiliaria_id').eq('id', user.id).single();
  return profile?.inmobiliaria_id ?? null;
}

export async function crearPublicacion(input: PublicacionInput): Promise<{ error: string } | { id: string }> {
  const supabase = await createClient();
  const inmobiliariaId = await getInmobiliariaId(supabase);
  if (!inmobiliariaId) return { error: 'No se encontró la inmobiliaria del usuario.' };

  if (!input.titulo.trim()) return { error: 'Ingresá un título para la publicación.' };

  const { data, error } = await supabase
    .from('publicaciones')
    .insert({ inmobiliaria_id: inmobiliariaId, ...publicacionRow(input) })
    .select('id')
    .single();
  if (error || !data) return { error: 'No se pudo crear la publicación.' };

  revalidatePath('/dashboard/pagina');
  return { id: data.id as string };
}

export async function actualizarPublicacion(id: string, input: PublicacionInput): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient();
  if (!input.titulo.trim()) return { error: 'Ingresá un título para la publicación.' };

  const { error } = await supabase.from('publicaciones').update(publicacionRow(input)).eq('id', id);
  if (error) return { error: 'No se pudo guardar la publicación.' };

  revalidatePath('/dashboard/pagina');
  revalidatePath(`/dashboard/pagina/${id}/editar`);
  return { ok: true };
}

export async function eliminarPublicacion(publicacionId: string) {
  const supabase = await createClient();

  const { data: fotos } = await supabase.from('publicacion_fotos').select('storage_path').eq('publicacion_id', publicacionId);
  const { error } = await supabase.from('publicaciones').delete().eq('id', publicacionId);
  if (error) throw error;

  const paths = (fotos ?? []).map((f) => f.storage_path);
  if (paths.length > 0) await supabase.storage.from('publicacion-fotos').remove(paths);

  revalidatePath('/dashboard/pagina');
}

export async function toggleActivaPublicacion(publicacionId: string, activa: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from('publicaciones').update({ activa: !activa }).eq('id', publicacionId);
  if (error) throw error;
  revalidatePath('/dashboard/pagina');
}

export async function recordPublicacionFotoUpload(publicacionId: string, storagePath: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('publicacion_fotos').insert({ publicacion_id: publicacionId, storage_path: storagePath });
  if (error) throw error;
  revalidatePath('/dashboard/pagina');
  revalidatePath(`/dashboard/pagina/${publicacionId}/editar`);
}

export async function deletePublicacionFoto(fotoId: string, storagePath: string, publicacionId: string) {
  const supabase = await createClient();
  await supabase.storage.from('publicacion-fotos').remove([storagePath]);
  const { error } = await supabase.from('publicacion_fotos').delete().eq('id', fotoId);
  if (error) throw error;
  revalidatePath(`/dashboard/pagina/${publicacionId}/editar`);
}

export type PaginaContenidoState = { error: string | null; success: boolean };

export async function updatePaginaContenido(_prevState: PaginaContenidoState, formData: FormData): Promise<PaginaContenidoState> {
  const supabase = await createClient();
  const inmobiliariaId = await getInmobiliariaId(supabase);
  if (!inmobiliariaId) return { error: 'No se encontró la inmobiliaria.', success: false };

  const bio = String(formData.get('pagina_bio') || '').trim();
  const ubicacion = String(formData.get('pagina_ubicacion') || '').trim();

  const { error } = await supabase
    .from('inmobiliarias')
    .update({ pagina_bio: bio || null, pagina_ubicacion: ubicacion || null })
    .eq('id', inmobiliariaId);
  if (error) return { error: 'No se pudo guardar.', success: false };

  revalidatePath('/dashboard/pagina');
  return { error: null, success: true };
}
