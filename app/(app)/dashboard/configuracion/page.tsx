import { createClient } from '@/lib/supabase/server';
import { PerfilForm, PasswordForm, LogoForm } from './forms';

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('nombre, inmobiliaria_id').eq('id', user!.id).single();

  let inmobiliariaNombre = '';
  let telefono = '';
  let logoUrl: string | null = null;
  if (profile?.inmobiliaria_id) {
    const { data: inmobiliaria } = await supabase
      .from('inmobiliarias')
      .select('nombre, telefono, logo_url')
      .eq('id', profile.inmobiliaria_id)
      .single();
    inmobiliariaNombre = inmobiliaria?.nombre ?? '';
    telefono = inmobiliaria?.telefono ?? '';
    if (inmobiliaria?.logo_url) {
      const { data: signed } = await supabase.storage.from('logos').createSignedUrl(inmobiliaria.logo_url, 3600);
      logoUrl = signed?.signedUrl ?? null;
    }
  }

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>Configuración</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520 }}>
        <LogoForm inmobiliariaId={profile?.inmobiliaria_id ?? ''} logoUrl={logoUrl} />
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
