import type { Metadata } from 'next';

import {
  Agua,
  AreaVolumen,
  CaidaTension,
  Hormigon,
  PrecioMargen,
  ReglaDeTres,
} from '@/components/aula/curso/calculadoras';

export const metadata: Metadata = { title: 'Herramientas' };

/**
 * Las calculadoras del curso.
 *
 * Cada una corresponde a una cuenta que el temario enseña a hacer a mano, y
 * enseña su fórmula junto al resultado: la herramienta está para ahorrar
 * tiempo, no para sustituir el criterio. Ninguna trae precios ni valores
 * locales metidos por dentro — todo lo que depende del mercado o de la obra lo
 * escribe quien la usa.
 */
export default function PaginaHerramientas() {
  return (
    <div className="seccion py-14">
      <p className="eyebrow">Calculadoras</p>
      <span className="regla-crece mt-2" />
      <h1 className="mt-4 font-serif text-3xl font-semibold text-bosque-800 dark:text-crema-50 sm:text-4xl">
        Herramientas
      </h1>
      <p className="mt-3 max-w-2xl text-tinta-600 dark:text-crema-100/60">
        Las cuentas que más se repiten en el curso, resueltas aquí para no tener que rehacerlas cada
        vez. Cada una muestra su fórmula: la idea es que puedas hacerla en un papel el día que no
        tengas el teléfono a mano.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ReglaDeTres />
        <AreaVolumen />
        <Hormigon />
        <Agua />
        <PrecioMargen />
        <CaidaTension />
      </div>

      <p className="mt-10 max-w-2xl text-sm leading-relaxed text-tinta-500 dark:text-crema-100/45">
        Ninguna de estas herramientas sustituye el cálculo de quien firma una obra o una instalación.
        Sirven para dimensionar, comparar opciones y detectar un disparate antes de comprar el
        material.
      </p>
    </div>
  );
}
