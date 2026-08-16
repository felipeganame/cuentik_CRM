'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireSuperadmin } from '@/lib/auth';

export async function createInmobiliaria(formData: FormData) {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const nombre = String(formData.get('nombre') || '').trim();
  const emailContacto = String(formData.get('email_contacto') || '').trim();
  const password = String(formData.get('password') || '');
  const telefono = String(formData.get('telefono') || '');
  const limitePropiedades = Number(formData.get('limite_propiedades')) || 20;
  const fechaVencimiento = String(formData.get('fecha_vencimiento') || '') || null;

  if (!nombre || !emailContacto || password.length < 8) {
    throw new Error('Datos incompletos: nombre, email y contraseña (mín. 8 caracteres) son obligatorios.');
  }

  const admin = createAdminClient();

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: emailContacto,
    password,
    email_confirm: true,
  });
  if (userError) throw userError;

  const { data: inmobiliaria, error: inmobiliariaError } = await admin
    .from('inmobiliarias')
    .insert({
      nombre,
      email_contacto: emailContacto,
      telefono,
      limite_propiedades: limitePropiedades,
      fecha_vencimiento: fechaVencimiento,
    })
    .select()
    .single();
  if (inmobiliariaError) throw inmobiliariaError;

  const { error: profileError } = await admin.from('profiles').insert({
    id: userData.user.id,
    role: 'inmobiliaria',
    inmobiliaria_id: inmobiliaria.id,
    nombre,
  });
  if (profileError) throw profileError;

  revalidatePath('/superadmin');
  return { id: inmobiliaria.id as string };
}

export async function updateInmobiliaria(id: string, formData: FormData) {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const nombre = String(formData.get('nombre') || '');
  const telefono = String(formData.get('telefono') || '');
  const limitePropiedades = Number(formData.get('limite_propiedades')) || 20;
  const fechaVencimiento = String(formData.get('fecha_vencimiento') || '') || null;
  const estado = String(formData.get('estado') || 'Activo');
  const cobroEstado = String(formData.get('cobro_estado') || 'Pendiente');

  const { error } = await supabase
    .from('inmobiliarias')
    .update({
      nombre,
      telefono,
      limite_propiedades: limitePropiedades,
      fecha_vencimiento: fechaVencimiento,
      estado,
      cobro_estado: cobroEstado,
    })
    .eq('id', id);
  if (error) throw error;

  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/${id}`);
}

function randomPassword() {
  return Array.from({ length: 12 }, () => Math.random().toString(36)[2] || '0').join('');
}

export async function resetInmobiliariaPassword(id: string): Promise<string> {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('inmobiliaria_id', id)
    .eq('role', 'inmobiliaria')
    .single();
  if (profileError || !profile) throw new Error('No se encontró la cuenta de esta inmobiliaria.');

  const password = randomPassword();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(profile.id, { password });
  if (error) throw error;

  return password;
}
