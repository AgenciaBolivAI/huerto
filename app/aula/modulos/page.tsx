import Link from 'next/link';
import type { Metadata } from 'next';

import { BarraProgreso, PuntoEstado } from '@/components/aula/curso/piezas';
import { obtenerCurso, obtenerCursoPorCategoria } from '@/lib/aula/contenido';
import { obtenerTodoElProgreso } from '@/lib/aula/progreso';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Módulos' };

/** Índice desplegado del curso: todos los módulos con sus lecciones a la vista. */
export default async function IndiceModulos() {
  const curso = obtenerCurso();
  const grupos = obtenerCursoPorCategoria();
  const progreso = await obtenerTodoElProgreso();

  return (
    <div className="seccion py-14">
      <p className="eyebrow">Índice</p>
      <span className="regla-crece mt-2" />
      <h1 className="mt-4 font-serif text-3xl font-semibold text-bosque-800 dark:text-crema-50 sm:text-4xl">
        Los {curso.length} módulos
      </h1>
      <p className="mt-3 max-w-2xl text-tinta-600 dark:text-crema-100/60">
        Agrupados en {grupos.length} bloques, en el orden en que conviene recorrerlos. Cada bloque
        dice qué deja al lector antes de pasar al siguiente.
      </p>

      <div className="mt-12 space-y-14">
        {grupos.map((grupo, iGrupo) => (
          <section key={grupo.categoria?.clave ?? 'sin-categoria'}>
            <header className="max-w-3xl border-l-[3px] border-tierra-400 pl-5">
              <p className="eyebrow text-tierra-600 dark:text-tierra-300">
                Bloque {iGrupo + 1}
              </p>
              <h2 className="mt-1.5 font-serif text-2xl font-semibold text-bosque-800 dark:text-crema-50">
                {grupo.categoria?.nombre ?? 'Todavía sin bloque'}
              </h2>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-tinta-600 dark:text-crema-100/60">
                {grupo.categoria?.descripcion ??
                  'Módulos que aún no declaran a qué bloque del temario pertenecen.'}
              </p>
            </header>

            <div className="mt-6 space-y-4">
        {grupo.modulos.map((modulo) => {
          const total = modulo.lecciones.length;
          const completadas = modulo.lecciones.filter(
            (l) => progreso.get(l.id)?.estado === 'completada',
          ).length;
          const pct = total === 0 ? 0 : Math.round((completadas / total) * 100);

          return (
            <section
              key={modulo.id}
              className="overflow-hidden rounded-2xl bg-white/70 ring-1 ring-tinta-900/5 dark:bg-tinta-900/50 dark:ring-crema-100/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-4">
                  {/* La foto sustituye al círculo del número, con el número
                      encima: el índice tiene 38 filas y una miniatura extra por
                      fila lo volvería una galería en vez de un índice. */}
                  {modulo.datos.portada ? (
                    <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/imagenes/${modulo.datos.portada}`}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 bg-tinta-950/45" />
                      <span className="relative font-serif text-sm font-semibold text-crema-50">
                        {modulo.datos.numero}
                      </span>
                    </span>
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-salvia-100 font-serif text-sm font-semibold text-bosque-700 dark:bg-white/5 dark:text-salvia-300">
                      {modulo.datos.numero}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-lg font-semibold text-bosque-800 dark:text-crema-50">
                      <Link href={`/aula/modulos/${modulo.id}`} className="hover:underline">
                        {modulo.datos.titulo}
                      </Link>
                    </h2>
                    <p className="mt-0.5 line-clamp-1 text-sm text-tinta-500 dark:text-crema-100/50">
                      {modulo.datos.resumen}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs font-medium text-tinta-400 dark:text-crema-100/35">
                    {total === 0 ? 'Por escribir' : `${completadas}/${total}`}
                  </span>
                  <div className="w-24">
                    <BarraProgreso porcentaje={pct} alto="h-1.5" />
                  </div>
                </div>
              </div>

              {total > 0 && (
                <ul className="border-t border-salvia-200/70 dark:border-crema-100/10">
                  {modulo.lecciones.map((leccion, i) => {
                    const estado = progreso.get(leccion.id)?.estado ?? 'no_iniciada';
                    return (
                      <li key={leccion.id}>
                        <Link
                          href={`/aula/modulos/${leccion.id}`}
                          className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-salvia-50 dark:hover:bg-white/5 sm:px-6"
                        >
                          <PuntoEstado estado={estado} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.94rem] font-medium text-tinta-800 dark:text-crema-100/85">
                              <span className="mr-2 font-mono text-xs text-tinta-400 dark:text-crema-100/30">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              {leccion.meta.titulo}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-tinta-400 dark:text-crema-100/35">
                            {leccion.meta.duracionMin} min
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
