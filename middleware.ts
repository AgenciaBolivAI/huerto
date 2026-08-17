import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Protege rutas con sesión de Supabase:
//  - /admin (excepto /admin/login) -> redirige a /admin/login
//  - /cuenta                       -> redirige a /ingresar
// Si Supabase no está configurado, deja pasar: las páginas muestran el aviso
// de configuración en lugar de romperse.
export async function middleware(request: NextRequest) {
  if (!isConfigured) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAccount = pathname.startsWith('/cuenta');
  if (!isAdmin && !isAccount) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = isAccount ? '/ingresar' : '/admin/login';
    if (isAccount) url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/cuenta/:path*'],
};
