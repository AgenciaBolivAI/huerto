'use client';

import { useMemo, useState } from 'react';
import type { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';

interface Props {
  products: Product[];
  categories: Category[];
}

export function TiendaClient({ products, categories }: Props) {
  const [activeSlug, setActiveSlug] = useState<string>('todas');

  const visible = useMemo(() => {
    if (activeSlug === 'todas') return products;
    const cat = categories.find((c) => c.slug === activeSlug);
    return cat ? products.filter((p) => p.category_id === cat.id) : products;
  }, [activeSlug, products, categories]);

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  const pill = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-medium transition-all ${
      active
        ? 'bg-brand-700 text-crema-50 shadow-soft'
        : 'bg-white text-brand-800 ring-1 ring-brand-200 hover:ring-brand-400'
    }`;

  return (
    <div>
      {/* Encabezado de la tienda */}
      <section className="border-b border-oro-300/40 bg-brand-50/50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="eyebrow text-tierra-600">El catálogo</p>
          <span className="rule-grow mt-4" />
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
            Tienda del vivero
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-800/75">
            Todo lo que tu lote en Prados del Sur necesita: del cerco vivo a los árboles de
            sombra, pasando por frutales injertados y los sabores caribeños de nuestro huerto.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Filtro por categoría */}
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={() => setActiveSlug('todas')} className={pill(activeSlug === 'todas')}>
            Todas
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => setActiveSlug(c.slug)} className={pill(activeSlug === c.slug)}>
              {c.name}
            </button>
          ))}
        </div>

        {activeCategory && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-tierra-200 bg-tierra-100/50 px-5 py-4">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-tierra-500" />
            <p className="text-sm leading-relaxed text-tierra-700">{activeCategory.description}</p>
          </div>
        )}

        <p className="mt-8 text-sm text-brand-500">
          {visible.length} {visible.length === 1 ? 'variedad' : 'variedades'}
          {activeCategory ? ` en ${activeCategory.name.toLowerCase()}` : ' disponibles'}
        </p>

        {/* Catálogo */}
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-16 text-center text-brand-500">No hay productos en esta categoría.</p>
        )}
      </div>
    </div>
  );
}
