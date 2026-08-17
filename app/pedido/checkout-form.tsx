'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart-provider';
import type { CustomerType, DeliveryMode } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';
import { formatBs } from '@/lib/utils';

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();

  const [customerType, setCustomerType] = useState<CustomerType>('retail');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('pickup');
  const [businessName, setBusinessName] = useState('');
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sesión del cliente (opcional). Si hay sesión, autocompletamos desde el perfil.
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      setUserId(user.id);
      setUserEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;

      // Autocompletar: perfil primero, correo de la cuenta como respaldo.
      setEmail((prev) => prev || profile?.email || user.email || '');
      if (profile) {
        setCustomerType(profile.customer_type ?? 'retail');
        setCustomerName((prev) => prev || profile.full_name || '');
        setPhone((prev) => prev || profile.phone || '');
        setLotNumber((prev) => prev || profile.lot_number || '');
        setAddress((prev) => prev || profile.address || '');
        setBusinessName((prev) => prev || profile.business_name || '');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const priceFor = (p: { price_retail: number; price_b2b: number }) =>
    customerType === 'b2b' ? p.price_b2b : p.price_retail;
  const total = items.reduce((acc, i) => acc + priceFor(i.product) * i.quantity, 0);

  // La dirección se pide para entregas (minorista) y siempre para B2B; no en retiros.
  const needsAddress = customerType === 'b2b' || deliveryMode === 'delivery';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Tu carrito está vacío. Agrega productos desde la tienda.');
      return;
    }
    setSending(true);

    // Modo demostración: Supabase no configurado -> simular éxito
    if (!isSupabaseConfigured()) {
      clearCart();
      router.push('/pedido/confirmacion?simulado=1');
      return;
    }

    try {
      const supabase = createClient();
      const cleanAddress = needsAddress ? address.trim() : '';

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_type: customerType,
          customer_name: customerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          business_name: customerType === 'b2b' ? businessName.trim() : null,
          lot_number: customerType === 'retail' ? lotNumber.trim() : null,
          address: cleanAddress,
          delivery_mode: customerType === 'retail' ? deliveryMode : null,
          notes: notes.trim() || null,
          total,
          status: 'pending',
          user_id: userId,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map((i) => ({
          order_id: order.id as string,
          product_id: i.product.id,
          quantity: i.quantity,
          unit_price: priceFor(i.product),
        })),
      );
      if (itemsError) throw itemsError;

      // Guardar los datos en el perfil para la próxima vez (mejor esfuerzo).
      if (userId && saveInfo) {
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            full_name: customerName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: cleanAddress,
            lot_number: customerType === 'retail' ? lotNumber.trim() : '',
            business_name: customerType === 'b2b' ? businessName.trim() : '',
            customer_type: customerType,
            updated_at: new Date().toISOString(),
          });
        } catch {
          // Un fallo al guardar el perfil no debe interrumpir la confirmación.
        }
      }

      clearCart();
      router.push('/pedido/confirmacion');
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudo registrar el pedido: ${err.message}`
          : 'No se pudo registrar el pedido. Inténtalo de nuevo.',
      );
      setSending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-brand-100 bg-white p-8 text-center">
        <p className="text-brand-800/70">Tu carrito está vacío.</p>
        <Link
          href="/tienda"
          className="mt-4 inline-block rounded-full bg-brand-700 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-brand-800"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-brand-900 transition-colors placeholder:text-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600/30';

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Aviso de sesión: autocompletado o invitación a iniciar sesión */}
        {isSupabaseConfigured() &&
          (userId ? (
            <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Sesión iniciada como <span className="font-semibold">{userEmail}</span>. Completamos
              tus datos automáticamente; puedes editarlos antes de confirmar.
            </p>
          ) : (
            <p className="rounded-lg border border-brand-100 bg-white px-4 py-3 text-sm text-brand-800/70">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/ingresar?redirect=/pedido"
                className="font-semibold text-brand-700 underline underline-offset-2"
              >
                Inicia sesión
              </Link>{' '}
              y autocompletaremos tus datos. También puedes seguir como invitado.
            </p>
          ))}

        {/* Selector de flujo */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-50 p-2">
          <button
            type="button"
            onClick={() => setCustomerType('retail')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              customerType === 'retail' ? 'bg-brand-700 text-crema-50 shadow-soft' : 'text-brand-800 hover:bg-brand-100'
            }`}
          >
            Propietario Prados del Sur
          </button>
          <button
            type="button"
            onClick={() => setCustomerType('b2b')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              customerType === 'b2b' ? 'bg-brand-700 text-crema-50 shadow-soft' : 'text-brand-800 hover:bg-brand-100'
            }`}
          >
            Negocio / restaurante (B2B)
          </button>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          {customerType === 'retail' ? (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-semibold text-brand-900">Datos del propietario</h2>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nombre">
                  Nombre completo *
                </label>
                <input
                  id="nombre"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputCls}
                  placeholder="Ej.: María Fernanda Rojas"
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="telefono">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    id="telefono"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                    placeholder="Ej.: 70012345"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="correo">
                    Correo electrónico *
                  </label>
                  <input
                    id="correo"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="Ej.: maria@correo.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="lote">
                  Número de lote *
                </label>
                <input
                  id="lote"
                  required
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className={inputCls}
                  placeholder="Ej.: Mz. C-12, Lote 34"
                />
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Modalidad de entrega *</legend>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMode === 'pickup'}
                      onChange={() => setDeliveryMode('pickup')}
                    />
                    Retiro en el vivero (junto al Club House)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMode === 'delivery'}
                      onChange={() => setDeliveryMode('delivery')}
                    />
                    Entrega dentro de la urbanización (en tu lote)
                  </label>
                </div>
              </fieldset>
              {deliveryMode === 'delivery' && (
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="direccion">
                    Dirección de entrega *
                  </label>
                  <input
                    id="direccion"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputCls}
                    placeholder="Ej.: Mz. C-12, Lote 34, casa de rejas verdes"
                    autoComplete="street-address"
                  />
                  <p className="mt-1 text-xs text-brand-500">
                    Indica referencias para ubicar tu lote dentro de Prados del Sur.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-semibold text-brand-900">Cuenta de negocio (B2B)</h2>
              <p className="rounded-lg bg-tierra-100 px-3 py-2 text-sm text-tierra-700">
                Los precios del resumen ya muestran la tarifa mayorista B2B. Para pedidos
                recurrentes (restaurantes del Club House y terceros) indícalo en las notas.
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="negocio">
                  Nombre del negocio *
                </label>
                <input
                  id="negocio"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputCls}
                  placeholder="Ej.: Restaurante Club House"
                  autoComplete="organization"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="contacto">
                    Persona de contacto *
                  </label>
                  <input
                    id="contacto"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={inputCls}
                    placeholder="Ej.: Chef Juan Pérez"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="telefono-b2b">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    id="telefono-b2b"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                    placeholder="Ej.: 70012345"
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="correo-b2b">
                    Correo electrónico *
                  </label>
                  <input
                    id="correo-b2b"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="Ej.: compras@negocio.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="direccion-b2b">
                    Dirección de entrega *
                  </label>
                  <input
                    id="direccion-b2b"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputCls}
                    placeholder="Ej.: Av. Principal 123, zona sur"
                    autoComplete="street-address"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium" htmlFor="notas">
              Notas del pedido {customerType === 'b2b' ? '(pedido mayorista / recurrente)' : ''}
            </label>
            <textarea
              id="notas"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputCls}
              placeholder={
                customerType === 'b2b'
                  ? 'Ej.: Entrega semanal los martes, 10 kg de culantro…'
                  : 'Ej.: Entregar después de las 17:00…'
              }
            />
          </div>

          {userId && (
            <label className="mt-4 flex items-center gap-2 text-sm text-brand-800">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
              />
              Guardar estos datos en mi perfil para la próxima vez
            </label>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
      </div>

      {/* Resumen */}
      <aside className="h-fit rounded-2xl border border-brand-100 bg-white p-6 shadow-soft lg:sticky lg:top-28">
        <h2 className="font-serif text-xl font-semibold text-brand-900">
          Resumen {customerType === 'b2b' && <span className="text-sm font-sans text-tierra-600">(precios B2B)</span>}
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.product.id} className="flex justify-between gap-2">
              <span>
                {i.product.name} × {i.quantity}
              </span>
              <span className="font-medium">{formatBs(priceFor(i.product) * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-brand-100 pt-4">
          <span className="text-sm text-brand-700">Total</span>
          <span className="font-serif text-2xl font-semibold text-brand-900">{formatBs(total)}</span>
        </div>
        <button
          type="submit"
          disabled={sending}
          className="mt-5 w-full rounded-full bg-brand-700 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-200"
        >
          {sending ? 'Enviando…' : 'Confirmar pedido'}
        </button>
        <p className="mt-3 text-center text-xs text-brand-500">
          No pagas ahora. Te contactaremos por WhatsApp para coordinar el pago y la entrega.
        </p>
      </aside>
    </form>
  );
}
