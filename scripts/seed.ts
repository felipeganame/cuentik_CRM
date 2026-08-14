import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

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
      limite_propiedades: 50,
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
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
