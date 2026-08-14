import { createClient } from '@/lib/supabase/server';
import { PerfilForm, PasswordForm } from './forms';

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('nombre, inmobiliaria_id').eq('id', user!.id).single();

  let inmobiliariaNombre = '';
  let telefono = '';
  if (profile?.inmobiliaria_id) {
    const { data: inmobiliaria } = await supabase
      .from('inmobiliarias')
      .select('nombre, telefono')
      .eq('id', profile.inmobiliaria_id)
      .single();
    inmobiliariaNombre = inmobiliaria?.nombre ?? '';
    telefono = inmobiliaria?.telefono ?? '';
  }

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>Configuración</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520 }}>
        <PerfilForm
          nombreInmobiliaria={inmobiliariaNombre}
          nombreContacto={profile?.nombre ?? ''}
          telefono={telefono}
          emailContacto={user?.email ?? ''}
        />
        <PasswordForm />
      </div>
    </div>
  );
}
