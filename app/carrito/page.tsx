'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/cart-provider';
import { formatBs } from '@/lib/utils';

export default function CarritoPage() {
  const { items, setQuantity, removeItem, clearCart } = useCart();
  const total = items.reduce((acc, i) => acc + i.product.price_retail * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="eyebrow text-tierra-600">Carrito</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-brand-900">Tu carrito está vacío</h1>
        <p className="mt-4 text-lg text-brand-800/70">
          Explora el catálogo y elige las plantas que harán de tu lote un hogar verde.
        </p>
        <Link
          href="/tienda"
          className="mt-8 inline-block rounded-full bg-brand-700 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-brand-800"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="eyebrow text-tierra-600">Tu selección</p>
      <span className="rule-grow mt-4" />
      <h1 className="mt-6 font-serif text-4xl font-semibold text-brand-900 sm:text-5xl">Carrito</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-brand-100 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                <Image src={product.image_url} alt={product.name} fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-semibold text-brand-900">{product.name}</p>
                <p className="text-sm text-brand-500">
                  {formatBs(product.price_retail)} / {product.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 text-lg font-bold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-brand-900">{quantity}</span>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  onClick={() => setQuantity(product.id, Math.min(quantity + 1, product.stock))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 text-lg font-bold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  +
                </button>
              </div>
              <p className="w-24 text-right font-serif text-lg font-semibold text-brand-800">
                {formatBs(product.price_retail * quantity)}
              </p>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="text-sm text-tierra-600 transition-colors hover:text-tierra-700 hover:underline sm:pl-1"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="font-serif text-xl font-semibold text-brand-900">Resumen</h2>
          <div className="mt-4 flex items-center justify-between border-t border-brand-100 pt-4">
            <span className="text-brand-700">Total</span>
            <span className="font-serif text-2xl font-semibold text-brand-900">{formatBs(total)}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-brand-500">
            Precios minoristas. Si compras como negocio (B2B), verás los precios mayoristas en el
            siguiente paso. No pagas ahora.
          </p>
          <Link
            href="/pedido"
            className="mt-5 block rounded-full bg-brand-700 py-3.5 text-center font-semibold text-crema-50 transition-colors hover:bg-brand-800"
          >
            Confirmar pedido
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="mt-3 w-full rounded-full border border-brand-200 py-3 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-50"
          >
            Vaciar carrito
          </button>
        </aside>
      </div>
    </div>
  );
}
