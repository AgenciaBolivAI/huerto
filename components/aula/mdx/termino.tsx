'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/**
 * Término técnico dentro del texto. Al pulsarlo despliega su definición sin
 * sacar al lector de la lección; el enlace lleva a donde se explica a fondo.
 *
 * Cada término se define además en prosa la primera vez que aparece — esto es
 * un recordatorio a mano, no un sustituto de esa explicación.
 */
export function Termino({
  children,
  definicion,
  leccion,
  tituloLeccion,
}: {
  children: React.ReactNode;
  definicion: string | null;
  leccion?: string;
  tituloLeccion?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const alPulsarFuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };

    document.addEventListener('mousedown', alPulsarFuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alPulsarFuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [abierto]);

  // Sin definición en el glosario se renderiza como texto normal: un término
  // que aún no se ha catalogado no debe romper la lectura.
  if (!definicion) return <>{children}</>;

  return (
    <span ref={contenedor} className="relative inline-block">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="cursor-help border-b border-dotted border-salvia-500 font-medium text-bosque-700 transition-colors hover:border-bosque-600 hover:text-bosque-800 dark:text-salvia-300 dark:hover:text-salvia-200"
      >
        {children}
      </button>

      {abierto && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 block w-72 -translate-x-1/2 rounded-xl bg-tinta-900 p-3.5 text-left text-sm font-normal leading-relaxed text-crema-100 shadow-realce ring-1 ring-crema-100/10 sm:w-80"
        >
          <span className="block">{definicion}</span>
          {leccion && (
            <Link
              href={`/aula/modulos/${leccion}`}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-salvia-300 hover:text-salvia-200"
              onClick={() => setAbierto(false)}
            >
              Se explica en: {tituloLeccion ?? leccion}
              <span aria-hidden="true">→</span>
            </Link>
          )}
          <span
            className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-tinta-900"
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
