'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireSuperadmin } from '@/lib/auth';
import { formatTelefono } from '@/lib/phone';

export async function createInmobiliaria(formData: FormData): Promise<{ error: string } | { id: string }> {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const nombre = String(formData.get('nombre') || '').trim();
  const emailContacto = String(formData.get('email_contacto') || '').trim();
  const password = String(formData.get('password') || '');
  const telefono = formatTelefono(String(formData.get('telefono_area') || ''), String(formData.get('telefono_numero') || ''));
  const limiteAlquileres = Number(formData.get('limite_alquileres')) || 20;
  const fechaVencimiento = String(formData.get('fecha_vencimiento') || '') || null;
  const montoMensual = Number(formData.get('monto_mensual')) || 0;

  if (!nombre || !emailContacto || password.length < 8) {
    return { error: 'Datos incompletos: nombre, email y contraseña (mín. 8 caracteres) son obligatorios.' };
  }

  const admin = createAdminClient();

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: emailContacto,
    password,
    email_confirm: true,
  });
  if (userError || !userData?.user) {
    return { error: `No se pudo crear el usuario: ${userError?.message ?? 'error desconocido'}` };
  }

  const { data: inmobiliaria, error: inmobiliariaError } = await admin
    .from('inmobiliarias')
    .insert({
      nombre,
      email_contacto: emailContacto,
      telefono,
      limite_alquileres: limiteAlquileres,
      fecha_vencimiento: fechaVencimiento,
      monto_mensual: montoMensual,
    })
    .select()
    .single();
  if (inmobiliariaError || !inmobiliaria) {
    await admin.auth.admin.deleteUser(userData.user.id);
    return { error: `No se pudo crear la inmobiliaria: ${inmobiliariaError?.message ?? 'error desconocido'}` };
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
    return { error: `No se pudo crear el perfil: ${profileError.message}` };
  }

  revalidatePath('/superadmin');
  return { id: inmobiliaria.id as string };
}

export async function updateInmobiliaria(id: string, formData: FormData): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const nombre = String(formData.get('nombre') || '');
  const telefono = formatTelefono(String(formData.get('telefono_area') || ''), String(formData.get('telefono_numero') || ''));
  const limiteAlquileres = Number(formData.get('limite_alquileres')) || 20;
  const fechaVencimiento = String(formData.get('fecha_vencimiento') || '') || null;
  const estado = String(formData.get('estado') || 'Activo');
  const cobroEstado = String(formData.get('cobro_estado') || 'Pendiente');
  const montoMensual = Number(formData.get('monto_mensual')) || 0;

  const { error } = await supabase
    .from('inmobiliarias')
    .update({
      nombre,
      telefono,
      limite_alquileres: limiteAlquileres,
      fecha_vencimiento: fechaVencimiento,
      estado,
      cobro_estado: cobroEstado,
      monto_mensual: montoMensual,
    })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/${id}`);
  return { ok: true };
}

export async function toggleEstadoInmobiliaria(id: string, nuevoEstado: 'Activo' | 'Suspendido') {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const { error } = await supabase.from('inmobiliarias').update({ estado: nuevoEstado }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/superadmin');
}

function randomPassword() {
  return Array.from({ length: 12 }, () => Math.random().toString(36)[2] || '0').join('');
}

export async function resetInmobiliariaPassword(id: string): Promise<{ error: string } | { password: string }> {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('inmobiliaria_id', id)
    .eq('role', 'inmobiliaria')
    .single();
  if (profileError || !profile) return { error: 'No se encontró la cuenta de esta inmobiliaria.' };

  const password = randomPassword();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(profile.id, { password });
  if (error) return { error: error.message };

  return { password };
}
