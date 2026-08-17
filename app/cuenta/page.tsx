import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Order, Profile } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { formatBs, formatDateTime } from '@/lib/utils';
import { AccountForm } from './account-form';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mi cuenta' };

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
};

function AvisoConfig() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-serif text-4xl font-semibold text-brand-900">Mi cuenta</h1>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">Las cuentas no están disponibles</p>
        <p className="mt-2">
          Esta sección necesita Supabase configurado. Mientras tanto puedes comprar como invitado.
        </p>
      </div>
    </div>
  );
}

export default async function CuentaPage() {
  if (!isSupabaseConfigured()) return <AvisoConfig />;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/ingresar?redirect=/cuenta');

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const profileData: Profile = {
    id: user.id,
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    email: profile?.email || user.email || '',
    address: profile?.address ?? '',
    lot_number: profile?.lot_number ?? '',
    business_name: profile?.business_name ?? '',
    customer_type: profile?.customer_type ?? 'retail',
    updated_at: profile?.updated_at ?? '',
  };

  const orderList = (orders ?? []) as Order[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-tierra-600">Tu cuenta</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-brand-900">Mi cuenta</h1>
        </div>
        <p className="text-sm text-brand-500">{user.email}</p>
      </div>

      {/* Perfil editable */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold text-brand-900">Mis datos</h2>
        <p className="mt-1 text-sm text-brand-800/70">
          Estos datos autocompletan el checkout la próxima vez que compres.
        </p>
        <AccountForm profile={profileData} />
      </section>

      {/* Historial de pedidos */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold text-brand-900">Mis pedidos</h2>
        {orderList.length === 0 ? (
          <p className="mt-4 rounded-xl border border-brand-100 bg-white p-6 text-center text-brand-500">
            Todavía no tienes pedidos.{' '}
            <Link href="/tienda" className="font-semibold text-brand-700 underline underline-offset-2">
              Explora la tienda
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {orderList.map((order) => (
              <li key={order.id} className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-brand-500">{formatDateTime(order.created_at)}</p>
                    <p className="mt-1 text-sm text-brand-800/70">
                      {order.delivery_mode === 'delivery'
                        ? 'Entrega en la urbanización'
                        : order.delivery_mode === 'pickup'
                          ? 'Retiro en el vivero'
                          : order.customer_type === 'b2b'
                            ? 'Pedido B2B'
                            : 'Pedido'}
                      {order.address ? ` · ${order.address}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-800">{formatBs(order.total)}</p>
                    <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
                {order.order_items && order.order_items.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-brand-50 pt-3 text-sm text-brand-800">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.products?.name ?? 'Producto'} × {item.quantity}
                        </span>
                        <span>{formatBs(item.unit_price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
