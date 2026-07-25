'use client';

import { useEffect, useState } from 'react';

/**
 * Índice lateral de la lección. Resalta la sección que se está leyendo usando
 * un IntersectionObserver sobre los encabezados que rehype-slug ya numeró.
 */
export function IndiceLeccion({
  secciones,
  tieneQuiz,
}: {
  secciones: { id: string; titulo: string }[];
  tieneQuiz: boolean;
}) {
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    const encabezados = secciones
      .map((s) => document.getElementById(s.id))
      .filter((e): e is HTMLElement => e !== null);
    if (encabezados.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        // Se toma el encabezado visible más alto, para que al desplazarse hacia
        // arriba el resaltado retroceda igual de bien que hacia abajo.
        const visibles = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibles.length > 0) setActiva(visibles[0].target.id);
      },
      // La banda superior evita que el resaltado salte antes de tiempo por
      // culpa de la cabecera fija.
      { rootMargin: '-88px 0px -70% 0px', threshold: 0 },
    );

    encabezados.forEach((e) => observador.observe(e));
    return () => observador.disconnect();
  }, [secciones]);

  return (
    <nav className="sticky top-24">
      <p className="eyebrow">En esta lección</p>
      <ul className="mt-4 space-y-1 border-l border-salvia-200 dark:border-crema-100/10">
        {secciones.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-[0.82rem] leading-snug transition-colors ${
                activa === s.id
                  ? 'border-bosque-600 font-medium text-bosque-800 dark:border-salvia-400 dark:text-salvia-300'
                  : 'border-transparent text-tinta-500 hover:border-salvia-400 hover:text-tinta-800 dark:text-crema-100/45 dark:hover:text-crema-100/75'
              }`}
            >
              {s.titulo}
            </a>
          </li>
        ))}
        {tieneQuiz && (
          <li>
            <a
              href="#quiz"
              className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[0.82rem] font-medium text-tierra-600 transition-colors hover:border-tierra-400 dark:text-tierra-300"
            >
              Quiz
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}
