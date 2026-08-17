import { redirect } from 'next/navigation';
import type { Order, Product } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { AdminDashboard } from './admin-dashboard';
import { LogoutButton } from './logout-button';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Administración' };

function AvisoConfig() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-serif text-3xl font-semibold text-brand-900">Panel de administración</h1>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">Supabase no está configurado</p>
        <p className="mt-2">
          El panel necesita una base de datos para mostrar pedidos en tiempo real e inventario.
          Para activarlo:
        </p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>
            Crea un proyecto en <span className="font-medium">supabase.com</span> y ejecuta
            <code className="mx-1 rounded bg-amber-100 px-1">supabase/schema.sql</code> y
            <code className="mx-1 rounded bg-amber-100 px-1">supabase/seed.sql</code>.
          </li>
          <li>
            Copia <code className="mx-1 rounded bg-amber-100 px-1">.env.local.example</code> a
            <code className="mx-1 rounded bg-amber-100 px-1">.env.local</code> con tu URL y anon key.
          </li>
          <li>
            Crea un usuario en Authentication y regístralo en la tabla
            <code className="mx-1 rounded bg-amber-100 px-1">admin_users</code>.
          </li>
        </ol>
        <p className="mt-3">
          Mientras tanto, la tienda funciona en modo demostración con datos locales y pedidos
          simulados.
        </p>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <AvisoConfig />;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  // Verificación contra la tabla admin_users (además del middleware de sesión)
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold text-brand-900">Acceso no autorizado</h1>
        <p className="mt-3 text-brand-800/70">
          La cuenta <span className="font-medium">{user.email}</span> no está registrada como
          administradora. Pide al propietario que la agregue a la tabla
          <code className="mx-1 rounded bg-gray-100 px-1">admin_users</code>.
        </p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    );
  }

  const [{ data: orders }, { data: products }] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('products').select('*').order('name'),
  ]);

  return (
    <AdminDashboard
      initialOrders={(orders ?? []) as Order[]}
      initialProducts={(products ?? []) as Product[]}
      userEmail={user.email ?? ''}
    />
  );
}
