'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { LOW_STOCK_THRESHOLD } from '@/lib/types';
import { formatBs } from '@/lib/utils';
import { useCart } from '@/components/cart-provider';

interface Props {
  product: Product;
  priceMode?: 'retail' | 'b2b';
}

export function ProductCard({ product, priceMode = 'retail' }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const price = priceMode === 'b2b' ? product.price_b2b : product.price_retail;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock < LOW_STOCK_THRESHOLD;

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-50">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            outOfStock ? 'opacity-70 grayscale' : ''
          }`}
        />
        {lowStock && (
          <span className="absolute left-3 top-3 rounded-full bg-tierra-500 px-3 py-1 text-xs font-semibold text-white shadow-soft">
            Últimas unidades
          </span>
        )}
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-900/85 px-3 py-1 text-xs font-semibold text-crema-50">
            Agotado
          </span>
        )}
        {priceMode === 'b2b' && (
          <span className="absolute right-3 top-3 rounded-full bg-crema-50/90 px-3 py-1 text-xs font-semibold text-tierra-600 shadow-soft">
            Precio B2B
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-lg font-semibold leading-snug text-brand-900">{product.name}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-brand-800/70">{product.description}</p>
        <p className="text-xs uppercase tracking-wide text-brand-500">{product.unit}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p className="font-serif text-2xl font-semibold text-brand-800">{formatBs(price)}</p>
            <p className={`text-xs font-medium ${outOfStock ? 'text-tierra-600' : 'text-brand-500'}`}>
              {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Agregar ${product.name} al carrito`}
            className={`flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all ${
              outOfStock
                ? 'cursor-not-allowed bg-brand-100 text-brand-400'
                : added
                  ? 'bg-tierra-500 text-white'
                  : 'bg-brand-700 text-crema-50 hover:bg-brand-800'
            }`}
          >
            {outOfStock ? (
              'Agotado'
            ) : added ? (
              <>
                Agregado
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
