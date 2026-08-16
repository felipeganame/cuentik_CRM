import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentRole } from '@/lib/auth';
import { logout } from '@/app/(app)/actions';
import { SuperadminNavLinks } from './nav-links';

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const role = await getCurrentRole(supabase);

  if (!role) redirect('/login');
  if (role !== 'superadmin') redirect('/dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 230, flex: 'none', background: 'oklch(19% 0.02 258)', color: 'oklch(85% 0.01 258)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 6px 4px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Vollkorn, serif' }}>Cuentik CRM</div>
        </div>
        <div style={{ fontSize: 12, color: 'oklch(55% 0.02 258)', padding: '0 6px 22px' }}>Superadmin</div>
        <SuperadminNavLinks />
        <div style={{ flex: 1 }} />
        <form action={logout}>
          <button
            type="submit"
            style={{ border: 'none', background: 'none', borderTop: '1px solid oklch(28% 0.02 258)', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'oklch(40% 0.02 258)', flex: 'none' }} />
            <div style={{ fontSize: 12.5, color: 'oklch(75% 0.01 258)' }}>Cerrar sesión</div>
          </button>
        </form>
      </div>
      <div style={{ flex: 1, padding: '36px 40px', overflow: 'auto' }}>{children}</div>
    </div>
  );
}
