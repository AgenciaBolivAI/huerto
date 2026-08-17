'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Order, OrderStatus, Product } from '@/lib/types';
import { LOW_STOCK_THRESHOLD } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatBs, formatDateTime } from '@/lib/utils';
import { LogoutButton } from './logout-button';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-brand-100 text-brand-800',
};

interface Props {
  initialOrders: Order[];
  initialProducts: Product[];
  userEmail: string;
}

export function AdminDashboard({ initialOrders, initialProducts, userEmail }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orderFilter, setOrderFilter] = useState<'todos' | 'retail' | 'b2b'>('todos');
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});
  const [savingStock, setSavingStock] = useState<string | null>(null);

  const refetchOrders = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setOrders(data as Order[]);
  }, []);

  // Suscripción en tiempo real a cambios en orders
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        void refetchOrders();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refetchOrders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const supabase = createClient();
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  async function saveStock(product: Product) {
    const newStock = stockDrafts[product.id];
    if (newStock === undefined || newStock < 0) return;
    setSavingStock(product.id);
    const supabase = createClient();
    await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)));
    setSavingStock(null);
  }

  const filteredOrders = useMemo(
    () => orders.filter((o) => orderFilter === 'todos' || o.customer_type === orderFilter),
    [orders, orderFilter],
  );
  const lowStockCount = products.filter((p) => p.stock < LOW_STOCK_THRESHOLD).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-brand-900">Panel de administración</h1>
          <p className="mt-1 text-sm text-brand-500">Sesión: {userEmail}</p>
        </div>
        <LogoutButton />
      </div>

      {/* Pedidos */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-brand-900">
            Pedidos <span className="text-sm font-normal text-brand-500">(actualización en tiempo real)</span>
          </h2>
          <div className="flex gap-2">
            {(
              [
                ['todos', 'Todos'],
                ['retail', 'Minoristas'],
                ['b2b', 'B2B'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setOrderFilter(value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  orderFilter === value
                    ? 'bg-brand-700 text-crema-50 shadow-soft'
                    : 'bg-white text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="mt-4 rounded-xl border border-brand-100 bg-white p-6 text-center text-brand-500">
            Aún no hay pedidos{orderFilter !== 'todos' ? ' de este tipo' : ''}.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {filteredOrders.map((order) => (
              <li key={order.id} className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-brand-900">
                        {order.customer_type === 'b2b'
                          ? order.business_name || order.customer_name
                          : order.customer_name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          order.customer_type === 'b2b'
                            ? 'bg-tierra-100 text-tierra-700'
                            : 'bg-brand-100 text-brand-800'
                        }`}
                      >
                        {order.customer_type === 'b2b' ? 'B2B' : 'Minorista'}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-brand-800/70">
                      Tel: {order.phone}
                      {order.email && ` · ${order.email}`}
                      {order.customer_type === 'retail' && order.lot_number && ` · Lote: ${order.lot_number}`}
                      {order.customer_type === 'b2b' && order.customer_name !== order.business_name &&
                        ` · Contacto: ${order.customer_name}`}
                      {order.delivery_mode &&
                        ` · ${order.delivery_mode === 'pickup' ? 'Retiro en vivero' : 'Entrega en urbanización'}`}
                    </p>
                    {order.address && (
                      <p className="text-sm text-brand-800/70">Dirección: {order.address}</p>
                    )}
                    <p className="text-xs text-brand-500">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-800">{formatBs(order.total)}</p>
                    <label className="mt-1 block text-xs text-brand-500">
                      Estado:{' '}
                      <select
                        value={order.status}
                        onChange={(e) => void updateStatus(order.id, e.target.value as OrderStatus)}
                        className="rounded border border-brand-200 px-2 py-1 text-xs"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
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
                {order.notes && (
                  <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                    Nota: {order.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Inventario */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-brand-900">
          Inventario
          {lowStockCount > 0 && (
            <span className="ml-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              {lowStockCount} producto{lowStockCount > 1 ? 's' : ''} con stock bajo (&lt; {LOW_STOCK_THRESHOLD})
            </span>
          )}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-brand-100 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 bg-brand-50 text-left text-brand-900">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Precio minorista</th>
                <th className="px-4 py-3 font-semibold">Precio B2B</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const lowStock = product.stock < LOW_STOCK_THRESHOLD;
                const draft = stockDrafts[product.id] ?? product.stock;
                const dirty = stockDrafts[product.id] !== undefined && draft !== product.stock;
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-brand-50 last:border-0 ${lowStock ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-brand-900">
                      {product.name}
                      {lowStock && (
                        <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                          Stock bajo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatBs(product.price_retail)}</td>
                    <td className="px-4 py-3">{formatBs(product.price_b2b)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={draft}
                        onChange={(e) =>
                          setStockDrafts((prev) => ({
                            ...prev,
                            [product.id]: Number(e.target.value),
                          }))
                        }
                        className="w-20 rounded border border-brand-200 px-2 py-1"
                        aria-label={`Stock de ${product.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={!dirty || savingStock === product.id}
                        onClick={() => void saveStock(product)}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {savingStock === product.id ? 'Guardando…' : 'Guardar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
