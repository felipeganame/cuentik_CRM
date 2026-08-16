import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { mesActualLabel } from '../lib/types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = 'marina@delcentro.com.ar';
const TEST_PASSWORD = 'Locaria2026!';

async function main() {
  const { data: inmobiliaria, error: inmobiliariaError } = await supabase
    .from('inmobiliarias')
    .insert({
      nombre: 'Inmobiliaria del Centro',
      email_contacto: TEST_EMAIL,
      telefono: '351 555 0000',
      limite_alquileres: 50,
      estado: 'Activo',
      fecha_vencimiento: '2027-01-01',
    })
    .select()
    .single();

  if (inmobiliariaError) throw inmobiliariaError;

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (userError) throw userError;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userData.user.id,
    role: 'inmobiliaria',
    inmobiliaria_id: inmobiliaria.id,
    nombre: 'Marina Ríos',
  });

  if (profileError) throw profileError;

  console.log('Seeded inmobiliaria:', inmobiliaria.id);
  console.log('Seeded login:', TEST_EMAIL, TEST_PASSWORD);

  await seedAlquiler(inmobiliaria.id, {
    direccion: 'Depto 3B, Nueva Córdoba',
    localidad: 'Nueva Córdoba',
    tipo: 'Departamento',
    monto: 185000,
    diaPago: 10,
    locador: { nombre: 'Elena Suárez', dni: '27.451.902', telefono: '351 555 2210', email: 'elena.suarez@mail.com', domicilio: 'Bv. Illia 245, Centro' },
    locatario: { nombre: 'Fabián Torres', dni: '33.980.114', telefono: '351 555 7788', email: 'fabian.torres@mail.com', domicilio: 'Av. Colón 890, Alta Córdoba' },
    estadoMesActual: 'pagado',
  });

  await seedAlquiler(inmobiliaria.id, {
    direccion: 'Casa 12, Cerro de las Rosas',
    localidad: 'Cerro de las Rosas',
    tipo: 'Casa',
    monto: 310000,
    diaPago: 5,
    locador: { nombre: 'Raúl Medina', dni: '20.115.774', telefono: '351 555 3321', email: 'raul.medina@mail.com', domicilio: 'Rondeau 512, Nueva Córdoba' },
    locatario: { nombre: 'Gimena Ortiz', dni: '35.220.887', telefono: '351 555 9012', email: 'gimena.ortiz@mail.com', domicilio: 'Av. Rafael Núñez 4500' },
    estadoMesActual: 'vencido',
  });

  await seedAlquiler(inmobiliaria.id, {
    direccion: 'Local 4, Centro',
    localidad: 'Centro',
    tipo: 'Local',
    monto: 420000,
    diaPago: 1,
    locador: { nombre: 'Jorge Bianchi', dni: '18.902.331', telefono: '351 555 4410', email: 'jorge.bianchi@mail.com', domicilio: '27 de Abril 210' },
    locatario: { nombre: 'Comercial Andes SRL', dni: '30-71234567-9', telefono: '351 555 6789', email: 'administracion@andes.com.ar', domicilio: 'San Jerónimo 890' },
    estadoMesActual: 'pendiente',
  });

  console.log('Seeded 3 alquileres with propiedades, contactos, servicios and current-month pagos_historial.');
}

type SeedPersona = { nombre: string; dni: string; telefono: string; email: string; domicilio: string };

async function seedAlquiler(
  inmobiliariaId: string,
  input: {
    direccion: string;
    localidad: string;
    tipo: string;
    monto: number;
    diaPago: number;
    locador: SeedPersona;
    locatario: SeedPersona;
    estadoMesActual: 'pagado' | 'pendiente' | 'vencido';
  }
) {
  const { data: alquiler, error: alquilerError } = await supabase
    .from('alquileres')
    .insert({
      inmobiliaria_id: inmobiliariaId,
      monto: input.monto,
      dia_pago: input.diaPago,
      metodo_pago: 'Transferencia bancaria',
      cuenta: 'LOCARIA.' + input.direccion.replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase(),
      frecuencia_pago: 'Mensual',
      actualizacion_tipo: 'indice',
      actualizacion_valor: 'ICL',
      frecuencia_actualizacion: 'Trimestral',
      fecha_inicio: '2025-03-10',
      fecha_fin: '2027-03-10',
    })
    .select()
    .single();
  if (alquilerError) throw alquilerError;

  const { data: propiedad, error: propiedadError } = await supabase
    .from('propiedades')
    .insert({ alquiler_id: alquiler.id, direccion: input.direccion, localidad: input.localidad, tipo: input.tipo })
    .select()
    .single();
  if (propiedadError) throw propiedadError;

  for (const [rol, persona] of [
    ['locador', input.locador],
    ['locatario', input.locatario],
  ] as const) {
    const { data: contacto, error: contactoError } = await supabase.from('contactos').insert(persona).select().single();
    if (contactoError) throw contactoError;
    const { error: parteError } = await supabase
      .from('alquiler_partes')
      .insert({ alquiler_id: alquiler.id, contacto_id: contacto.id, rol });
    if (parteError) throw parteError;
  }

  const servicios = ['Agua', 'Luz', 'Gas', 'Municipalidad', 'Rentas', 'Expensas'];
  for (let i = 0; i < servicios.length; i++) {
    const { error: servicioError } = await supabase.from('servicios').insert({
      propiedad_id: propiedad.id,
      nombre: servicios[i],
      paga: i < 3 ? 'locatario' : 'locador',
      referencia: (1000 + i * 37).toString(),
      activo: true,
      pagado_mes_actual: input.estadoMesActual === 'pagado',
    });
    if (servicioError) throw servicioError;
  }

  const { error: pagoError } = await supabase.from('pagos_historial').insert({
    alquiler_id: alquiler.id,
    mes: mesActualLabel(),
    estado: input.estadoMesActual,
  });
  if (pagoError) throw pagoError;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
