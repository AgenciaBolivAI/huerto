import Link from 'next/link';

import type { Categoria, ModuloCompleto, ProgresoLeccion } from '@/lib/aula/tipos';

import { BarraProgreso } from './piezas';

/**
 * Mapa visual del curso: una tarjeta por módulo, con su portada y su avance.
 *
 * Los módulos sin lecciones todavía se muestran igualmente, atenuados: el mapa
 * enseña el recorrido completo desde el primer día, no solo lo ya escrito.
 *
 * Va agrupado por bloques del temario. Con cuarenta tarjetas seguidas el mapa
 * deja de leerse como un recorrido y pasa a ser un muro: el bloque es lo que
 * permite ubicarse sin contar módulos.
 *
 * Los que aún no tienen portada llevan una banda con su número en lugar de la
 * foto. Ocupa exactamente el mismo alto que una imagen, para que la rejilla no
 * quede a dos alturas mientras se van generando las que faltan.
 */
export function MapaCurso({
  grupos,
  progreso,
}: {
  grupos: { categoria: Categoria | null; modulos: ModuloCompleto[] }[];
  progreso: Map<string, ProgresoLeccion>;
}) {
  return (
    <div className="mt-8 space-y-12">
      {grupos.map((grupo, iGrupo) => (
        <section key={grupo.categoria?.clave ?? 'sin-categoria'}>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-tierra-500 dark:text-tierra-300/70">
              {String(iGrupo + 1).padStart(2, '0')}
            </span>
            <h3 className="font-serif text-lg font-semibold text-bosque-800 dark:text-crema-50">
              {grupo.categoria?.nombre ?? 'Todavía sin bloque'}
            </h3>
            <span className="h-px flex-1 bg-salvia-200 dark:bg-crema-100/10" />
          </div>

          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {grupo.modulos.map((modulo) => {
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
              href={`/aula/modulos/${modulo.id}`}
              className={`group flex h-full flex-col overflow-hidden rounded-2xl ring-1 transition-all duration-300 ${
                vacio
                  ? 'bg-white/40 ring-tinta-900/5 hover:ring-salvia-400 dark:bg-tinta-900/30 dark:ring-crema-100/5'
                  : 'bg-white/70 shadow-suave ring-tinta-900/5 hover:-translate-y-0.5 hover:shadow-realce hover:ring-salvia-400 dark:bg-tinta-900/60 dark:ring-crema-100/10'
              }`}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-salvia-100 dark:bg-white/[0.04]">
                {modulo.datos.portada ? (
                  <>
                    {/* Decorativa: el título va justo debajo y lo dice mejor. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/imagenes/${modulo.datos.portada}`}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
                        vacio ? 'opacity-55 saturate-[0.7]' : ''
                      }`}
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-tinta-950/75 via-tinta-950/25 to-transparent" />
                  </>
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid h-full w-full place-items-center bg-gradient-to-br from-salvia-100 to-salvia-200/60 font-serif text-5xl font-semibold text-bosque-700/15 dark:from-white/[0.05] dark:to-white/[0.02] dark:text-crema-100/10"
                  >
                    {modulo.datos.numero}
                  </span>
                )}

                <span
                  className={`absolute bottom-3 left-3 grid h-9 w-9 shrink-0 place-items-center rounded-full font-serif text-sm font-semibold shadow-suave transition-colors ${
                    terminado
                      ? 'bg-bosque-600 text-crema-50'
                      : enCurso
                        ? 'bg-tierra-400 text-tinta-900'
                        : 'bg-crema-50 text-bosque-700 group-hover:bg-white dark:bg-tinta-900 dark:text-salvia-300'
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

                <span
                  className={`absolute bottom-3.5 right-3.5 text-[0.68rem] font-medium ${
                    modulo.datos.portada
                      ? 'text-crema-50/90'
                      : 'text-tinta-400 dark:text-crema-100/35'
                  }`}
                >
                  {vacio ? 'Por escribir' : `${completadas}/${total}`}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3
                  className={`font-serif text-[1.05rem] font-semibold leading-snug ${
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
              </div>
            </Link>
          </li>
        );
      })}
          </ol>
        </section>
      ))}
    </div>
  );
}
