import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { BarraProgreso, InsigniaEstado, PuntoEstado } from '@/components/aula/curso/piezas';
import { PortadaLeccion } from '@/components/aula/mdx/imagen';
import { listarIdsModulos, obtenerCurso, obtenerModuloCompleto } from '@/lib/aula/contenido';
import { obtenerTodoElProgreso } from '@/lib/aula/progreso';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return listarIdsModulos().map((modulo) => ({ modulo }));
}

export function generateMetadata({ params }: { params: { modulo: string } }): Metadata {
  const modulo = obtenerModuloCompleto(params.modulo);
  return { title: modulo ? `${modulo.datos.numero}. ${modulo.datos.titulo}` : 'Módulo' };
}

export default async function PaginaModulo({ params }: { params: { modulo: string } }) {
  const modulo = obtenerModuloCompleto(params.modulo);
  if (!modulo) notFound();

  const progreso = await obtenerTodoElProgreso();
  const curso = obtenerCurso();
  const indice = curso.findIndex((m) => m.id === modulo.id);
  const anterior = indice > 0 ? curso[indice - 1] : null;
  const siguiente = indice < curso.length - 1 ? curso[indice + 1] : null;

  const total = modulo.lecciones.length;
  const completadas = modulo.lecciones.filter(
    (l) => progreso.get(l.id)?.estado === 'completada',
  ).length;
  const pct = total === 0 ? 0 : Math.round((completadas / total) * 100);
  const minutos = modulo.lecciones.reduce((s, l) => s + l.meta.duracionMin, 0);

  return (
    <div className="seccion py-12">
      <nav className="text-sm text-tinta-500 dark:text-crema-100/45">
        <Link href="/aula/modulos" className="hover:text-bosque-700 dark:hover:text-salvia-300">
          Módulos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-tinta-700 dark:text-crema-100/70">
          Módulo {modulo.datos.numero}
        </span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="eyebrow">Módulo {modulo.datos.numero}</p>
        <span className="regla-crece mt-2" />
        <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-bosque-800 dark:text-crema-50 sm:text-4xl">
          {modulo.datos.titulo}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-tinta-600 dark:text-crema-100/60">
          {modulo.datos.resumen}
        </p>
      </header>

      {modulo.datos.portada && (
        <PortadaLeccion
          src={`/imagenes/${modulo.datos.portada}`}
          alt={modulo.datos.portadaAlt ?? ''}
        />
      )}

      {total > 0 ? (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-tinta-500 dark:text-crema-100/50">
            <span>
              <strong className="font-semibold text-tinta-800 dark:text-crema-100/85">
                {total}
              </strong>{' '}
              {total === 1 ? 'lección' : 'lecciones'}
            </span>
            <span>
              <strong className="font-semibold text-tinta-800 dark:text-crema-100/85">
                {Math.round(minutos / 60) || 1}
              </strong>{' '}
              h de estudio estimadas
            </span>
            <span>
              <strong className="font-semibold text-tinta-800 dark:text-crema-100/85">{pct}%</strong>{' '}
              completado
            </span>
          </div>

          <BarraProgreso porcentaje={pct} className="mt-4 max-w-xl" />

          <ol className="mt-10 space-y-3">
            {modulo.lecciones.map((leccion, i) => {
              const estado = progreso.get(leccion.id)?.estado ?? 'no_iniciada';

              // Bloqueo suave: se avisa de los prerrequisitos sin cumplir, pero
              // el enlace sigue activo. Saltar el orden es decisión del alumno.
              const pendientes = leccion.meta.prerrequisitos.filter(
                (p) => (progreso.get(p)?.estado ?? 'no_iniciada') !== 'completada',
              );

              return (
                <li key={leccion.id}>
                  <Link
                    href={`/aula/modulos/${leccion.id}`}
                    className="group flex gap-4 rounded-2xl bg-white/70 p-5 ring-1 ring-tinta-900/5 transition-all hover:-translate-y-0.5 hover:shadow-suave hover:ring-salvia-400 dark:bg-tinta-900/50 dark:ring-crema-100/10"
                  >
                    <div className="flex flex-col items-center gap-2 pt-0.5">
                      <PuntoEstado estado={estado} />
                      {i < modulo.lecciones.length - 1 && (
                        <span className="w-px flex-1 bg-salvia-200 dark:bg-white/10" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <h2 className="font-serif text-lg font-semibold leading-snug text-bosque-800 group-hover:text-bosque-700 dark:text-crema-50">
                          <span className="mr-2 font-mono text-xs font-normal text-tinta-400 dark:text-crema-100/30">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {leccion.meta.titulo}
                        </h2>
                        <div className="flex shrink-0 items-center gap-2">
                          <InsigniaEstado estado={estado} />
                          <span className="text-xs text-tinta-400 dark:text-crema-100/35">
                            {leccion.meta.duracionMin} min
                          </span>
                        </div>
                      </div>

                      {leccion.meta.subtitulo && (
                        <p className="mt-1.5 text-sm leading-relaxed text-tinta-500 dark:text-crema-100/50">
                          {leccion.meta.subtitulo}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-tinta-400 dark:text-crema-100/35">
                        <span>
                          {leccion.meta.objetivos.length}{' '}
                          {leccion.meta.objetivos.length === 1 ? 'objetivo' : 'objetivos'}
                        </span>
                        <span>
                          {leccion.meta.videos.length > 0
                            ? `${leccion.meta.videos.length} ${leccion.meta.videos.length === 1 ? 'video' : 'videos'}`
                            : 'sin video aún'}
                        </span>
                        {leccion.tieneQuiz && <span>quiz</span>}
                      </div>

                      {pendientes.length > 0 && (
                        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-tierra-100 px-2.5 py-1 text-xs text-tierra-700 dark:bg-tierra-400/15 dark:text-tierra-300">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M12 9v4M12 17h.01" />
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                          Conviene ver antes {pendientes.length}{' '}
                          {pendientes.length === 1 ? 'lección previa' : 'lecciones previas'}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <div className="marco-filete mt-10 max-w-2xl px-7 py-10">
          <p className="eyebrow">Todavía sin escribir</p>
          <p className="mt-3 text-tinta-600 dark:text-crema-100/60">
            Este módulo aún no tiene lecciones. El contenido se genera módulo a módulo, a fondo y
            en el orden acordado, en lugar de producir los trece de una vez.
          </p>
        </div>
      )}

      {/* Navegación entre módulos */}
      <nav className="mt-14 flex flex-wrap items-stretch justify-between gap-4 border-t border-salvia-200/70 pt-8 dark:border-crema-100/10">
        {anterior ? (
          <Link
            href={`/aula/modulos/${anterior.id}`}
            className="group max-w-xs flex-1 rounded-xl px-4 py-3 text-left transition-colors hover:bg-salvia-50 dark:hover:bg-white/5"
          >
            <span className="text-xs uppercase tracking-marca text-tinta-400 dark:text-crema-100/35">
              ← Módulo {anterior.datos.numero}
            </span>
            <span className="mt-1 block font-serif font-semibold text-bosque-800 dark:text-crema-100/80">
              {anterior.datos.titulo}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link
            href={`/aula/modulos/${siguiente.id}`}
            className="group max-w-xs flex-1 rounded-xl px-4 py-3 text-right transition-colors hover:bg-salvia-50 dark:hover:bg-white/5"
          >
            <span className="text-xs uppercase tracking-marca text-tinta-400 dark:text-crema-100/35">
              Módulo {siguiente.datos.numero} →
            </span>
            <span className="mt-1 block font-serif font-semibold text-bosque-800 dark:text-crema-100/80">
              {siguiente.datos.titulo}
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
