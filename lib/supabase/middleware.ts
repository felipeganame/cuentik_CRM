import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/login';
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isSuperadmin = request.nextUrl.pathname.startsWith('/superadmin');

  if (!user && (isDashboard || isSuperadmin)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && (isLoginPage || isDashboard || isSuperadmin)) {
    const { data: profile } = await supabase.from('profiles').select('role, inmobiliarias(estado)').eq('id', user.id).single();
    const home = profile?.role === 'superadmin' ? '/superadmin' : '/dashboard';

    if (isDashboard && profile?.role === 'inmobiliaria') {
      const rel = profile.inmobiliarias as unknown as { estado: string } | { estado: string }[] | null;
      const estado = Array.isArray(rel) ? rel[0]?.estado : rel?.estado;
      if (estado === 'Suspendido') {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('motivo', 'suspendido');
        return NextResponse.redirect(url);
      }
    }

    if (isLoginPage || (isDashboard && profile?.role === 'superadmin') || (isSuperadmin && profile?.role !== 'superadmin')) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return response;
}
