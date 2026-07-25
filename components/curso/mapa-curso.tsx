import Link from 'next/link';

import type { ModuloCompleto, ProgresoLeccion } from '@/lib/tipos';

import { BarraProgreso } from './piezas';

/**
 * Mapa visual del curso: una tarjeta por módulo, numerada, con su avance.
 *
 * Los módulos sin lecciones todavía se muestran igualmente, atenuados: el mapa
 * enseña el recorrido completo desde el primer día, no solo lo ya escrito.
 */
export function MapaCurso({
  curso,
  progreso,
}: {
  curso: ModuloCompleto[];
  progreso: Map<string, ProgresoLeccion>;
}) {
  return (
    <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {curso.map((modulo) => {
        const total = modulo.lecciones.length;
        const completadas = modulo.lecciones.filter(
          (l) => progreso.get(l.id)?.estado === 'completada',
        ).length;
        const enCurso = modulo.lecciones.some((l) => progreso.get(l.id)?.estado === 'en_curso');
        const pct = total === 0 ? 0 : Math.round((completadas / total) * 100);
        const vacio = total === 0;
        const terminado = total > 0 && completadas === total;

        return (
          <li key={modulo.id}>
            <Link
              href={`/modulos/${modulo.id}`}
              className={`group flex h-full flex-col rounded-2xl p-5 ring-1 transition-all duration-300 ${
                vacio
                  ? 'bg-white/40 ring-tinta-900/5 hover:ring-salvia-400 dark:bg-tinta-900/30 dark:ring-crema-100/5'
                  : 'bg-white/70 shadow-suave ring-tinta-900/5 hover:-translate-y-0.5 hover:shadow-realce hover:ring-salvia-400 dark:bg-tinta-900/60 dark:ring-crema-100/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-serif text-sm font-semibold transition-colors ${
                    terminado
                      ? 'bg-bosque-600 text-crema-50'
                      : enCurso
                        ? 'bg-tierra-400 text-tinta-900'
                        : 'bg-salvia-100 text-bosque-700 group-hover:bg-salvia-200 dark:bg-white/5 dark:text-salvia-300'
                  }`}
                >
                  {terminado ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  ) : (
                    modulo.datos.numero
                  )}
                </span>

                <span className="mt-1 shrink-0 text-[0.68rem] font-medium text-tinta-400 dark:text-crema-100/35">
                  {vacio ? 'Por escribir' : `${completadas}/${total}`}
                </span>
              </div>

              <h3
                className={`mt-3.5 font-serif text-[1.05rem] font-semibold leading-snug ${
                  vacio
                    ? 'text-tinta-500 dark:text-crema-100/45'
                    : 'text-bosque-800 dark:text-crema-50'
                }`}
              >
                {modulo.datos.titulo}
              </h3>

              <p className="mt-2 line-clamp-3 flex-1 text-[0.86rem] leading-relaxed text-tinta-500 dark:text-crema-100/50">
                {modulo.datos.resumen}
              </p>

              {!vacio && <BarraProgreso porcentaje={pct} className="mt-4" alto="h-1.5" />}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
