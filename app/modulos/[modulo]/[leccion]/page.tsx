import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { AvisoPrerrequisitos } from '@/components/leccion/aviso-prerrequisitos';
import { BotonCompletar } from '@/components/leccion/boton-completar';
import { IndiceLeccion } from '@/components/leccion/indice-leccion';
import { RegistradorLeccion } from '@/components/leccion/registrador';
import { PortadaLeccion } from '@/components/mdx/imagen';
import { AvisoVideoPendiente } from '@/components/mdx/video';
import { EditorNotas } from '@/components/notas/editor-notas';
import { Quiz } from '@/components/quiz/quiz';
import {
  buscarLeccionPorId,
  listarIdsModulos,
  listarSlugsLecciones,
  obtenerLeccion,
  obtenerMdx,
  obtenerModulo,
  obtenerQuiz,
  obtenerVecinas,
} from '@/lib/contenido';
import { extraerSecciones, renderizarLeccion } from '@/lib/mdx';
import {
  obtenerIntentos,
  obtenerNota,
  obtenerProgresoLeccion,
  obtenerTodoElProgreso,
} from '@/lib/progreso';

export const dynamic = 'force-dynamic';

interface Params {
  params: { modulo: string; leccion: string };
}

export function generateStaticParams() {
  return listarIdsModulos().flatMap((modulo) =>
    listarSlugsLecciones(modulo).map((leccion) => ({ modulo, leccion })),
  );
}

export function generateMetadata({ params }: Params): Metadata {
  const leccion = obtenerLeccion(params.modulo, params.leccion);
  return { title: leccion?.meta.titulo ?? 'Lección' };
}

export default async function PaginaLeccion({ params }: Params) {
  const leccion = obtenerLeccion(params.modulo, params.leccion);
  const fuente = obtenerMdx(params.modulo, params.leccion);
  const modulo = obtenerModulo(params.modulo);
  if (!leccion || !fuente || !modulo) notFound();

  const { meta, id: leccionId } = leccion;

  // El contenido sale de disco; el estado, de la base de datos. Las cuatro
  // consultas son independientes entre sí, así que se lanzan en paralelo en
  // lugar de encadenar cuatro viajes de ida y vuelta.
  const quiz = obtenerQuiz(params.modulo, params.leccion);
  const secciones = extraerSecciones(fuente);
  const { anterior, siguiente } = obtenerVecinas(leccionId);

  const [contenido, progreso, todoElProgreso, nota, intentos] = await Promise.all([
    renderizarLeccion(fuente, meta.videos, leccionId),
    obtenerProgresoLeccion(leccionId),
    obtenerTodoElProgreso(),
    obtenerNota(leccionId),
    obtenerIntentos(leccionId),
  ]);

  const prerrequisitosFaltantes = meta.prerrequisitos
    .filter((p) => (todoElProgreso.get(p)?.estado ?? 'no_iniciada') !== 'completada')
    .map((p) => ({ id: p, titulo: buscarLeccionPorId(p)?.meta.titulo ?? p }));

  return (
    <>
      <RegistradorLeccion
        leccionId={leccionId}
        moduloId={params.modulo}
        scrollInicial={progreso?.scrollPct ?? 0}
      />

      <div className="seccion py-10">
        <nav className="text-sm text-tinta-500 dark:text-crema-100/45">
          <Link href="/modulos" className="hover:text-bosque-700 dark:hover:text-salvia-300">
            Módulos
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/modulos/${params.modulo}`}
            className="hover:text-bosque-700 dark:hover:text-salvia-300"
          >
            {modulo.numero}. {modulo.titulo}
          </Link>
        </nav>

        <div className="mt-8 gap-12 lg:flex">
          {/* Índice lateral */}
          {secciones.length > 2 && (
            <aside className="hidden w-56 shrink-0 lg:block">
              <IndiceLeccion secciones={secciones} tieneQuiz={quiz !== null} />
            </aside>
          )}

          <article className="min-w-0 flex-1">
            <header>
              <p className="eyebrow">
                Módulo {modulo.numero} · Lección{' '}
                {listarSlugsLecciones(params.modulo).indexOf(params.leccion) + 1}
              </p>
              <span className="regla-crece mt-2" />
              <h1 className="mt-4 max-w-3xl font-serif text-3xl font-semibold leading-[1.15] text-bosque-800 dark:text-crema-50 sm:text-4xl">
                {meta.titulo}
              </h1>
              {meta.subtitulo && (
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-tinta-600 dark:text-crema-100/60">
                  {meta.subtitulo}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-tinta-500 dark:text-crema-100/45">
                <span>{meta.duracionMin} min de lectura</span>
                <span>
                  {meta.videos.length > 0
                    ? `${meta.videos.length} ${meta.videos.length === 1 ? 'video' : 'videos'} verificados`
                    : 'sin video todavía'}
                </span>
                {quiz && <span>{quiz.preguntas.length} preguntas</span>}
              </div>
            </header>

            {meta.portada && (
              <PortadaLeccion
                src={`/imagenes/${leccionId}/${meta.portada}`}
                alt={meta.portadaAlt ?? ''}
              />
            )}

            {prerrequisitosFaltantes.length > 0 && (
              <AvisoPrerrequisitos faltantes={prerrequisitosFaltantes} />
            )}

            {/* Objetivos de aprendizaje */}
            <section className="marco-filete mt-9 bg-white/60 px-6 py-6 dark:bg-tinta-900/40 sm:px-8">
              <p className="eyebrow">Al terminar esta lección sabrás</p>
              <ul className="mt-4 space-y-2.5">
                {meta.objetivos.map((objetivo, i) => (
                  <li key={i} className="flex gap-3 text-[0.97rem] leading-relaxed text-tinta-700 dark:text-crema-100/75">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-tierra-400" />
                    {objetivo}
                  </li>
                ))}
              </ul>
            </section>

            {/* Cuerpo de la lección */}
            <div className="prosa mt-12">{contenido}</div>

            {/* Si no hay videos curados, se dice explícitamente. Es preferible a
                un enlace aproximado o roto. */}
            {meta.videos.length === 0 && <AvisoVideoPendiente />}

            {/* Referencias */}
            {meta.referencias.length > 0 && (
              <section className="mt-14 rounded-2xl bg-white/60 p-6 ring-1 ring-tinta-900/5 dark:bg-tinta-900/40 dark:ring-crema-100/10">
                <p className="eyebrow">Para profundizar</p>
                <ul className="mt-4 space-y-3">
                  {meta.referencias.map((r, i) => (
                    <li key={i} className="text-[0.94rem] leading-relaxed">
                      <span className="font-medium text-tinta-800 dark:text-crema-100/85">
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-salvia-400 underline-offset-2 hover:text-bosque-700 dark:hover:text-salvia-300"
                          >
                            {r.titulo}
                          </a>
                        ) : (
                          r.titulo
                        )}
                      </span>
                      <span className="text-tinta-500 dark:text-crema-100/45"> — {r.fuente}</span>
                      {r.nota && (
                        <span className="block text-sm text-tinta-500 dark:text-crema-100/45">
                          {r.nota}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Completar */}
            <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-salvia-200/70 pt-8 dark:border-crema-100/10">
              <BotonCompletar
                leccionId={leccionId}
                moduloId={params.modulo}
                estadoInicial={progreso?.estado ?? 'no_iniciada'}
              />
              {quiz && (
                <a
                  href="#quiz"
                  className="rounded-full px-5 py-3 text-sm font-semibold text-bosque-700 underline decoration-salvia-400 underline-offset-4 hover:text-bosque-800 dark:text-salvia-300"
                >
                  Ir al quiz ↓
                </a>
              )}
            </div>

            {/* Cuaderno */}
            <div className="mt-10">
              <EditorNotas leccionId={leccionId} notaInicial={nota} />
            </div>

            {/* Quiz */}
            {quiz && (
              <div className="mt-14">
                <Quiz
                  leccionId={leccionId}
                  preguntas={quiz.preguntas}
                  intentosPrevios={intentos}
                />
              </div>
            )}

            {/* Navegación entre lecciones */}
            <nav className="mt-16 flex flex-wrap items-stretch justify-between gap-4 border-t border-salvia-200/70 pt-8 dark:border-crema-100/10">
              {anterior ? (
                <Link
                  href={`/modulos/${anterior.id}`}
                  className="max-w-xs flex-1 rounded-xl px-4 py-3 transition-colors hover:bg-salvia-50 dark:hover:bg-white/5"
                >
                  <span className="text-xs uppercase tracking-marca text-tinta-400 dark:text-crema-100/35">
                    ← Anterior
                  </span>
                  <span className="mt-1 block font-serif font-semibold text-bosque-800 dark:text-crema-100/80">
                    {anterior.meta.titulo}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {siguiente && (
                <Link
                  href={`/modulos/${siguiente.id}`}
                  className="max-w-xs flex-1 rounded-xl px-4 py-3 text-right transition-colors hover:bg-salvia-50 dark:hover:bg-white/5"
                >
                  <span className="text-xs uppercase tracking-marca text-tinta-400 dark:text-crema-100/35">
                    Siguiente →
                  </span>
                  <span className="mt-1 block font-serif font-semibold text-bosque-800 dark:text-crema-100/80">
                    {siguiente.meta.titulo}
                  </span>
                </Link>
              )}
            </nav>
          </article>
        </div>
      </div>
    </>
  );
}
