'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { mesActualLabel } from '@/lib/types';

export async function toggleServicioActivo(servicioId: string, alquilerId: string) {
  const supabase = await createClient();
  const { data: servicio, error: fetchError } = await supabase
    .from('servicios')
    .select('activo')
    .eq('id', servicioId)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from('servicios').update({ activo: !servicio.activo }).eq('id', servicioId);
  if (error) throw error;

  revalidatePath(`/dashboard/alquileres/${alquilerId}`);
}

export async function toggleServicioPagado(servicioId: string, alquilerId: string) {
  const supabase = await createClient();
  const { data: servicio, error: fetchError } = await supabase
    .from('servicios')
    .select('pagado_mes_actual')
    .eq('id', servicioId)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('servicios')
    .update({ pagado_mes_actual: !servicio.pagado_mes_actual })
    .eq('id', servicioId);
  if (error) throw error;

  revalidatePath(`/dashboard/alquileres/${alquilerId}`);
}

export async function cambiarPagaServicio(servicioId: string, alquilerId: string, paga: 'locador' | 'locatario') {
  const supabase = await createClient();
  const { error } = await supabase.from('servicios').update({ paga }).eq('id', servicioId);
  if (error) throw error;

  revalidatePath(`/dashboard/alquileres/${alquilerId}`);
}

export async function toggleMesActual(alquilerId: string) {
  const supabase = await createClient();
  const mes = mesActualLabel();

  const { data: existing } = await supabase
    .from('pagos_historial')
    .select('id, estado')
    .eq('alquiler_id', alquilerId)
    .eq('mes', mes)
    .maybeSingle();

  if (existing) {
    const nextEstado = existing.estado === 'pagado' ? 'vencido' : 'pagado';
    const { error } = await supabase.from('pagos_historial').update({ estado: nextEstado }).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('pagos_historial').insert({ alquiler_id: alquilerId, mes, estado: 'pagado' });
    if (error) throw error;
  }

  revalidatePath(`/dashboard/alquileres/${alquilerId}`);
  revalidatePath('/dashboard');
}

export async function updateCondiciones(alquilerId: string, formData: FormData) {
  const supabase = await createClient();

  const monto = Number(formData.get('monto'));
  const diaPago = Number(formData.get('dia_pago'));
  const metodoPago = String(formData.get('metodo_pago') || '');
  const cuenta = String(formData.get('cuenta') || '');
  const frecuenciaPago = String(formData.get('frecuencia_pago') || '');
  const actualizacionTipo = String(formData.get('actualizacion_tipo') || 'indice') as 'porcentaje' | 'indice';
  const actualizacionValor = String(formData.get('actualizacion_valor') || '');
  const frecuenciaActualizacion = String(formData.get('frecuencia_actualizacion') || '');

  const { error } = await supabase
    .from('alquileres')
    .update({
      monto,
      dia_pago: diaPago,
      metodo_pago: metodoPago,
      cuenta,
      frecuencia_pago: frecuenciaPago,
      actualizacion_tipo: actualizacionTipo,
      actualizacion_valor: actualizacionValor,
      frecuencia_actualizacion: frecuenciaActualizacion,
    })
    .eq('id', alquilerId);
  if (error) throw error;

  revalidatePath(`/dashboard/alquileres/${alquilerId}`);
  revalidatePath('/dashboard');
}

export type WizardPropiedadInput = {
  direccion: string;
  localidad: string;
  tipo: string;
};

export type WizardPersonaInput = {
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  domicilio: string;
};

export type WizardServicioInput = {
  nombre: string;
  paga: 'locador' | 'locatario';
  referencia: string;
  activo: boolean;
};

export async function createAlquiler(input: {
  propiedades: WizardPropiedadInput[];
  locador: WizardPersonaInput;
  locatario: WizardPersonaInput;
  garantes: WizardPersonaInput[];
  monto: number;
  diaPago: number;
  metodoPago: string;
  cuenta: string;
  frecuenciaPago: string;
  actualizacionTipo: 'porcentaje' | 'indice';
  actualizacionValor: string;
  frecuenciaActualizacion: string;
  fechaInicio: string;
  fechaFin: string;
  servicios: WizardServicioInput[];
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('inmobiliaria_id')
    .eq('id', user.id)
    .single();
  if (profileError || !profile?.inmobiliaria_id) throw new Error('No se encontró la inmobiliaria del usuario');

  const { data: alquiler, error: alquilerError } = await supabase
    .from('alquileres')
    .insert({
      inmobiliaria_id: profile.inmobiliaria_id,
      monto: input.monto,
      dia_pago: input.diaPago,
      metodo_pago: input.metodoPago,
      cuenta: input.cuenta,
      frecuencia_pago: input.frecuenciaPago,
      actualizacion_tipo: input.actualizacionTipo,
      actualizacion_valor: input.actualizacionValor,
      frecuencia_actualizacion: input.frecuenciaActualizacion,
      fecha_inicio: input.fechaInicio,
      fecha_fin: input.fechaFin,
    })
    .select()
    .single();
  if (alquilerError) throw alquilerError;

  const propiedadesCreadas: { id: string }[] = [];
  for (const p of input.propiedades) {
    const { data: propiedad, error: propiedadError } = await supabase
      .from('propiedades')
      .insert({ alquiler_id: alquiler.id, direccion: p.direccion, localidad: p.localidad, tipo: p.tipo })
      .select()
      .single();
    if (propiedadError) throw propiedadError;
    propiedadesCreadas.push(propiedad);
  }

  const partes: { persona: WizardPersonaInput; rol: 'locador' | 'locatario' | 'garante' }[] = [
    { persona: input.locador, rol: 'locador' },
    { persona: input.locatario, rol: 'locatario' },
    ...input.garantes.map((g) => ({ persona: g, rol: 'garante' as const })),
  ];

  for (const { persona, rol } of partes) {
    const { data: contacto, error: contactoError } = await supabase.from('contactos').insert(persona).select().single();
    if (contactoError) throw contactoError;
    const { error: parteError } = await supabase
      .from('alquiler_partes')
      .insert({ alquiler_id: alquiler.id, contacto_id: contacto.id, rol });
    if (parteError) throw parteError;
  }

  const propiedadPrincipal = propiedadesCreadas[0];
  if (propiedadPrincipal) {
    for (const sv of input.servicios) {
      const { error: servicioError } = await supabase.from('servicios').insert({
        propiedad_id: propiedadPrincipal.id,
        nombre: sv.nombre,
        paga: sv.paga,
        referencia: sv.referencia || null,
        activo: sv.activo,
        pagado_mes_actual: false,
      });
      if (servicioError) throw servicioError;
    }
  }

  const { error: pagoError } = await supabase
    .from('pagos_historial')
    .insert({ alquiler_id: alquiler.id, mes: mesActualLabel(), estado: 'pendiente' });
  if (pagoError) throw pagoError;

  revalidatePath('/dashboard');
  return { id: alquiler.id as string };
}
