import Link from 'next/link';

import { getCategories, getProducts } from '@/lib/data';
import { PRIMEROS_PASOS, leccionesDe } from '@/lib/puentes';
import { TiendaClient } from './tienda-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tienda',
  description:
    'Catálogo del vivero Rizoma del Sur: cercos vivos, árboles de sombra, palmeras, frutales y cultivos caribeños de especialidad.',
  alternates: { canonical: '/tienda' },
};

export default async function TiendaPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const conLecciones = categories
    .map((c) => ({ categoria: c, lecciones: leccionesDe(c.slug) }))
    .filter((x) => x.lecciones.length > 0);

  return (
    <>
      <TiendaClient products={products} categories={categories} />

      {/* Vender una planta sin decir cómo se cuida es vender la mitad. El curso
          es gratis y explica exactamente lo que hay en este catálogo, así que
          lo honesto es enseñarlo aquí y no esperar a que lo encuentren. */}
      <section className="border-t border-brand-200/70 bg-brand-50/60">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow">Antes de plantar</p>
          <span className="rule-grow mt-2" />
          <h2 className="mt-6 max-w-3xl font-serif text-3xl font-semibold leading-tight text-brand-900 sm:text-4xl">
            Todo lo que vendemos está explicado, gratis, en el aula.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-800/80">
            No hace falta comprar nada para leerlo, ni crear una cuenta. Si te llevas una planta de
            aquí, estas lecciones son las que evitan que se muera en el primer mes.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {conLecciones.map(({ categoria, lecciones }) => (
              <div key={categoria.id}>
                <h3 className="font-serif text-lg font-semibold text-brand-900">{categoria.name}</h3>
                <ul className="mt-3 space-y-2">
                  {lecciones.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/aula/modulos/${l.id}`}
                        className="text-sm font-medium text-brand-700 underline-offset-4 transition-colors hover:text-brand-900 hover:underline"
                      >
                        {l.titulo} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-brand-200 pt-8">
            <p className="text-sm font-semibold uppercase tracking-brand text-brand-500">
              Sirve para cualquier planta que te lleves
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              {PRIMEROS_PASOS.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/aula/modulos/${l.id}`}
                    className="text-sm font-medium text-brand-700 underline-offset-4 transition-colors hover:text-brand-900 hover:underline"
                  >
                    {l.titulo} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
