import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logout } from './actions';
import { NavLinks } from './nav-links';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, inmobiliaria_id, inmobiliarias(nombre, logo_url)')
    .eq('id', user.id)
    .single();

  const inmobiliariaRel = profile?.inmobiliarias as unknown as
    | { nombre: string; logo_url: string | null }
    | { nombre: string; logo_url: string | null }[]
    | null;
  const inmobiliaria = Array.isArray(inmobiliariaRel) ? inmobiliariaRel[0] : inmobiliariaRel;
  const inmobiliariaNombre = inmobiliaria?.nombre ?? '';

  let inmobiliariaLogoUrl: string | null = null;
  if (inmobiliaria?.logo_url) {
    const { data: signed } = await supabase.storage.from('logos').createSignedUrl(inmobiliaria.logo_url, 3600);
    inmobiliariaLogoUrl = signed?.signedUrl ?? null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 230, flex: 'none', background: 'oklch(19% 0.02 258)', color: 'oklch(85% 0.01 258)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 6px 4px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'oklch(55% 0.16 250)' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Cuentik CRM</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 22px' }}>
          {inmobiliariaLogoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={inmobiliariaLogoUrl} alt="" style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'contain', background: '#fff', flex: 'none' }} />
          )}
          <div style={{ fontSize: 12, color: 'oklch(55% 0.02 258)' }}>{inmobiliariaNombre}</div>
        </div>
        <NavLinks />
        <div style={{ flex: 1 }} />
        <form action={logout}>
          <button
            type="submit"
            style={{ border: 'none', background: 'none', borderTop: '1px solid oklch(28% 0.02 258)', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'oklch(40% 0.02 258)', flex: 'none' }} />
            <div style={{ fontSize: 12.5, color: 'oklch(75% 0.01 258)' }}>{profile?.nombre ?? 'Cerrar sesión'}</div>
          </button>
        </form>
      </div>
      <div style={{ flex: 1, padding: '36px 40px', overflow: 'auto' }}>{children}</div>
    </div>
  );
}
