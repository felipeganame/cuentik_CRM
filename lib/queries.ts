import type { SupabaseClient } from '@supabase/supabase-js';
import { mesActualLabel, type Alquiler, type AlquilerParte, type Contacto, type Inmobiliaria, type PagoHistorial, type Propiedad, type Servicio } from './types';

export async function listInmobiliarias(supabase: SupabaseClient): Promise<Inmobiliaria[]> {
  const { data, error } = await supabase.from('inmobiliarias').select('*').order('nombre', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getInmobiliaria(supabase: SupabaseClient, id: string): Promise<Inmobiliaria | null> {
  const { data, error } = await supabase.from('inmobiliarias').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data;
}

export async function getUsoAlquileres(supabase: SupabaseClient, inmobiliariaId: string): Promise<{ usados: number; limite: number }> {
  const { data: inmobiliaria } = await supabase.from('inmobiliarias').select('limite_alquileres').eq('id', inmobiliariaId).single();
  const { count } = await supabase
    .from('alquileres')
    .select('id', { count: 'exact', head: true })
    .eq('inmobiliaria_id', inmobiliariaId);

  return { usados: count ?? 0, limite: inmobiliaria?.limite_alquileres ?? 0 };
}

export type InmobiliariaConMetricas = Inmobiliaria & {
  alquileresActivos: number;
  propiedadesActuales: number;
  diasParaVencimiento: number | null;
};

export async function listInmobiliariasConMetricas(supabase: SupabaseClient): Promise<InmobiliariaConMetricas[]> {
  const inmobiliarias = await listInmobiliarias(supabase);
  if (inmobiliarias.length === 0) return [];

  const { data: alquileres } = await supabase.from('alquileres').select('id, inmobiliaria_id');
  const alquilerToInmobiliaria = new Map((alquileres ?? []).map((a) => [a.id, a.inmobiliaria_id as string]));
  const alquilerIds = (alquileres ?? []).map((a) => a.id);

  const { data: propiedades } = alquilerIds.length
    ? await supabase.from('propiedades').select('id, alquiler_id').in('alquiler_id', alquilerIds)
    : { data: [] as { id: string; alquiler_id: string }[] };

  const alquileresPorInmobiliaria = new Map<string, number>();
  for (const a of alquileres ?? []) {
    const id = a.inmobiliaria_id as string;
    alquileresPorInmobiliaria.set(id, (alquileresPorInmobiliaria.get(id) ?? 0) + 1);
  }

  const propiedadesPorInmobiliaria = new Map<string, number>();
  for (const p of propiedades ?? []) {
    const inmobiliariaId = alquilerToInmobiliaria.get(p.alquiler_id);
    if (!inmobiliariaId) continue;
    propiedadesPorInmobiliaria.set(inmobiliariaId, (propiedadesPorInmobiliaria.get(inmobiliariaId) ?? 0) + 1);
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return inmobiliarias.map((i) => ({
    ...i,
    alquileresActivos: alquileresPorInmobiliaria.get(i.id) ?? 0,
    propiedadesActuales: propiedadesPorInmobiliaria.get(i.id) ?? 0,
    diasParaVencimiento: i.fecha_vencimiento
      ? Math.round((new Date(i.fecha_vencimiento + 'T00:00:00').getTime() - hoy.getTime()) / 86400000)
      : null,
  }));
}

export type AlquilerListItem = Alquiler & {
  propiedadPrincipal: Propiedad | null;
  locador: Contacto | null;
  locatario: Contacto | null;
  estadoPagoMesActual: 'pagado' | 'pendiente' | 'vencido';
  serviciosPendientes: number;
};

export async function listLocalidadesUsadas(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.from('propiedades').select('localidad');
  const unique = new Set((data ?? []).map((p) => p.localidad).filter(Boolean));
  return Array.from(unique).sort();
}

export async function listAlquileres(supabase: SupabaseClient): Promise<AlquilerListItem[]> {
  const { data: alquileres, error } = await supabase
    .from('alquileres')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!alquileres || alquileres.length === 0) return [];

  const alquilerIds = alquileres.map((a) => a.id);

  const [{ data: propiedades }, { data: partes }, { data: historial }] = await Promise.all([
    supabase.from('propiedades').select('*').in('alquiler_id', alquilerIds),
    supabase
      .from('alquiler_partes')
      .select('*, contacto:contactos(*)')
      .in('alquiler_id', alquilerIds),
    supabase.from('pagos_historial').select('*').in('alquiler_id', alquilerIds).eq('mes', mesActualLabel()),
  ]);

  const propiedadesByAlquiler = new Map<string, Propiedad[]>();
  for (const p of propiedades ?? []) {
    const list = propiedadesByAlquiler.get(p.alquiler_id) ?? [];
    list.push(p);
    propiedadesByAlquiler.set(p.alquiler_id, list);
  }

  const partesByAlquiler = new Map<string, AlquilerParte[]>();
  for (const parte of (partes ?? []) as AlquilerParte[]) {
    const list = partesByAlquiler.get(parte.alquiler_id) ?? [];
    list.push(parte);
    partesByAlquiler.set(parte.alquiler_id, list);
  }

  const historialByAlquiler = new Map<string, PagoHistorial>();
  for (const h of (historial ?? []) as PagoHistorial[]) {
    historialByAlquiler.set(h.alquiler_id, h);
  }

  const propiedadIds = (propiedades ?? []).map((p) => p.id);
  const { data: servicios } = propiedadIds.length
    ? await supabase.from('servicios').select('propiedad_id, activo, pagado_mes_actual').in('propiedad_id', propiedadIds)
    : { data: [] as { propiedad_id: string; activo: boolean; pagado_mes_actual: boolean }[] };

  const propiedadToAlquiler = new Map<string, string>();
  for (const p of propiedades ?? []) propiedadToAlquiler.set(p.id, p.alquiler_id);

  const serviciosPendientesByAlquiler = new Map<string, number>();
  for (const sv of servicios ?? []) {
    if (!sv.activo || sv.pagado_mes_actual) continue;
    const alquilerId = propiedadToAlquiler.get(sv.propiedad_id);
    if (!alquilerId) continue;
    serviciosPendientesByAlquiler.set(alquilerId, (serviciosPendientesByAlquiler.get(alquilerId) ?? 0) + 1);
  }

  return alquileres.map((a) => {
    const propList = propiedadesByAlquiler.get(a.id) ?? [];
    const parteList = partesByAlquiler.get(a.id) ?? [];
    const locador = parteList.find((p) => p.rol === 'locador')?.contacto ?? null;
    const locatario = parteList.find((p) => p.rol === 'locatario')?.contacto ?? null;
    return {
      ...a,
      propiedadPrincipal: propList[0] ?? null,
      locador,
      locatario,
      estadoPagoMesActual: historialByAlquiler.get(a.id)?.estado ?? 'pendiente',
      serviciosPendientes: serviciosPendientesByAlquiler.get(a.id) ?? 0,
    };
  });
}

export type FotoConUrl = { id: string; propiedadId: string; url: string };

export type AlquilerDetail = Alquiler & {
  propiedades: Propiedad[];
  locador: Contacto | null;
  locatario: Contacto | null;
  garantes: Contacto[];
  servicios: (Servicio & { propiedad: Propiedad | null })[];
  historial: PagoHistorial[];
  estadoPagoMesActual: 'pagado' | 'pendiente' | 'vencido';
  fotos: FotoConUrl[];
  contratoUrl: string | null;
};

export async function getAlquilerDetail(supabase: SupabaseClient, alquilerId: string): Promise<AlquilerDetail | null> {
  const { data: alquiler, error } = await supabase.from('alquileres').select('*').eq('id', alquilerId).single();
  if (error || !alquiler) return null;

  const [{ data: propiedades }, { data: partes }, { data: historial }] = await Promise.all([
    supabase.from('propiedades').select('*').eq('alquiler_id', alquilerId),
    supabase.from('alquiler_partes').select('*, contacto:contactos(*)').eq('alquiler_id', alquilerId),
    supabase.from('pagos_historial').select('*').eq('alquiler_id', alquilerId).order('mes', { ascending: true }),
  ]);

  const propiedadIds = (propiedades ?? []).map((p) => p.id);
  const { data: servicios } = propiedadIds.length
    ? await supabase.from('servicios').select('*').in('propiedad_id', propiedadIds)
    : { data: [] as Servicio[] };

  const propiedadById = new Map((propiedades ?? []).map((p) => [p.id, p]));
  const parteList = (partes ?? []) as AlquilerParte[];

  const mesActual = mesActualLabel();
  const historialActual = (historial ?? []).find((h) => h.mes === mesActual);

  const [{ data: fotoRows }, { data: contratoSigned }] = await Promise.all([
    propiedadIds.length
      ? supabase.from('propiedad_fotos').select('*').in('propiedad_id', propiedadIds)
      : Promise.resolve({ data: [] as { id: string; propiedad_id: string; storage_path: string }[] }),
    alquiler.contrato_pdf_path
      ? supabase.storage.from('contratos').createSignedUrl(alquiler.contrato_pdf_path, 3600)
      : Promise.resolve({ data: null }),
  ]);

  const fotos: FotoConUrl[] = [];
  if (fotoRows && fotoRows.length > 0) {
    const { data: signedList } = await supabase.storage
      .from('propiedad-fotos')
      .createSignedUrls(fotoRows.map((f) => f.storage_path), 3600);
    const urlByPath = new Map((signedList ?? []).map((s) => [s.path, s.signedUrl]));
    for (const foto of fotoRows) {
      const url = urlByPath.get(foto.storage_path);
      if (url) fotos.push({ id: foto.id, propiedadId: foto.propiedad_id, url });
    }
  }

  const contratoUrl = contratoSigned?.signedUrl ?? null;

  return {
    ...alquiler,
    propiedades: propiedades ?? [],
    locador: parteList.find((p) => p.rol === 'locador')?.contacto ?? null,
    locatario: parteList.find((p) => p.rol === 'locatario')?.contacto ?? null,
    garantes: parteList.filter((p) => p.rol === 'garante').map((p) => p.contacto).filter(Boolean) as Contacto[],
    fotos,
    contratoUrl,
    servicios: (servicios ?? []).map((sv) => ({ ...sv, propiedad: propiedadById.get(sv.propiedad_id) ?? null })),
    historial: historial ?? [],
    estadoPagoMesActual: historialActual?.estado ?? 'pendiente',
  };
}
