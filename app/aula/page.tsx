import Link from 'next/link';

import { BarraProgreso, Metrica, PanelRacha } from '@/components/aula/curso/piezas';
import { MapaCurso } from '@/components/aula/curso/mapa-curso';
import { buscarLeccionPorId, obtenerCurso, obtenerCursoPorCategoria} from '@/lib/aula/contenido';
import { obtenerAjuste, obtenerRacha, obtenerTodoElProgreso } from '@/lib/aula/progreso';

export const dynamic = 'force-dynamic';

export default async function Panel() {
  const curso = obtenerCurso();
  // Las tres consultas son independientes: se lanzan a la vez para no encadenar
  // tres viajes de ida y vuelta a Supabase en el renderizado del panel.
  const [progreso, racha, ultimaId] = await Promise.all([
    obtenerTodoElProgreso(),
    obtenerRacha(),
    obtenerAjuste('ultima_leccion'),
  ]);

  const todasLasLecciones = curso.flatMap((m) => m.lecciones);
  const total = todasLasLecciones.length;
  const completadas = todasLasLecciones.filter(
    (l) => progreso.get(l.id)?.estado === 'completada',
  ).length;
  const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);

  const minutosTotales = todasLasLecciones.reduce((s, l) => s + l.meta.duracionMin, 0);
  const segundosEstudiados = [...progreso.values()].reduce((s, p) => s + p.segundosEstudio, 0);

  // "Continuar donde quedé": la última lección abierta, si todavía existe en
  // disco. Se comprueba porque el contenido puede reorganizarse entre sesiones.
  const ultima = ultimaId ? buscarLeccionPorId(ultimaId) : null;
  const siguiente = ultima ?? todasLasLecciones[0] ?? null;
  const estadoSiguiente = siguiente ? progreso.get(siguiente.id)?.estado : undefined;

  return (
    <>
      {/* ─────────────────────────── Misión ───────────────────────────
          Lo primero que se ve al entrar no es el progreso: es por qué existe
          esto. El aula es la parte educativa de un proyecto comunitario, y la
          gratuidad no es un detalle de precio, es el planteamiento entero. */}
      <section className="relative isolate overflow-hidden bg-bosque-800 text-crema-50 dark:bg-tinta-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[url('/images/brand/patron-marca.jpg')] bg-cover bg-center opacity-[0.06]"
          aria-hidden="true"
        />
        <div className="seccion relative py-16 sm:py-24">
          <div className="animate-aparecer-arriba max-w-3xl">
            <p className="eyebrow text-tierra-300">Proyecto comunitario · Acceso libre</p>
            <span className="regla-crece mt-2 bg-tierra-300" />
            <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              El conocimiento para hacer crecer la zona, abierto para quien lo quiera.
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-crema-100/85 sm:text-xl">
              Rizoma del Sur es un proyecto comunitario y{' '}
              <strong className="font-semibold text-crema-50">gratuito</strong>. No vendemos este
              curso ni pedimos cuenta para leerlo: existe para que la comunidad pueda aprender y
              desarrollarse.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-crema-100/70">
              Solo brindamos herramientas para facilitar el progreso de la comunidad, y entendemos
              que eso <strong className="font-semibold text-crema-100">empieza con la educación</strong>.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {siguiente && (
                <Link
                  href={`/aula/modulos/${siguiente.id}`}
                  className="rounded-full bg-crema-50 px-6 py-3 text-sm font-semibold text-bosque-800 shadow-realce transition-transform hover:-translate-y-0.5"
                >
                  {estadoSiguiente ? 'Continuar donde quedé' : 'Empezar por el principio'}
                </Link>
              )}
              <Link
                href="/aula/modulos"
                className="rounded-full border border-crema-100/35 px-6 py-3 text-sm font-semibold text-crema-50 transition-colors hover:bg-white/10"
              >
                Ver los {curso.length} módulos
              </Link>
            </div>
          </div>

          {/* Lo que hay dentro, dicho en números y sin adornos. */}
          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-crema-100/15 pt-8 sm:grid-cols-4">
            {[
              { n: curso.length, t: 'módulos' },
              { n: total, t: 'lecciones' },
              { n: Math.round(minutosTotales / 60), t: 'horas de lectura' },
              { n: 'Bs 0', t: 'para siempre' },
            ].map((x) => (
              <div key={x.t}>
                <dt className="font-serif text-3xl font-semibold sm:text-4xl">{x.n}</dt>
                <dd className="mt-1 text-sm text-crema-100/60">{x.t}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="seccion pt-14 sm:pt-20">
        <div className="animate-aparecer-arriba">
          <p className="eyebrow">El curso</p>
          <span className="regla-crece mt-2" />
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-semibold leading-[1.1] text-bosque-800 dark:text-crema-50 sm:text-4xl">
            De cero a experto: la tierra, los oficios y la tecnología
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-tinta-600 dark:text-crema-100/65">
            Empieza en el suelo y las plantas, y sigue en la construcción, el agua, la electrónica,
            la programación, la carpintería, la soldadura, los motores, el dinero de la casa y la
            salud de la familia. No hace falta tener tierra para que sirva:{' '}
            <strong className="font-semibold text-tinta-800 dark:text-crema-100/85">Rizoma del Sur</strong>{' '}
            es el caso sobre el que están escritas las lecciones, no el destino. Nada de recetas: el
            mecanismo, para que puedas aplicarlo donde estés.
          </p>
        </div>

        {/* Progreso global */}
        <div className="tarjeta mt-10 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <div className="min-w-0">
              <p className="eyebrow">Tu progreso</p>
              <p className="mt-2 font-serif text-4xl font-semibold text-bosque-800 dark:text-crema-50">
                {porcentaje}
                <span className="text-2xl">%</span>
              </p>
              <p className="mt-1 text-sm text-tinta-500 dark:text-crema-100/50">
                {completadas} de {total} {total === 1 ? 'lección' : 'lecciones'} completadas
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
              <PanelRacha racha={racha} />
              <Metrica
                valor={Math.round(segundosEstudiados / 60)}
                sufijo="min"
                etiqueta="Tiempo de estudio"
              />
              <Metrica
                valor={Math.round(minutosTotales / 60)}
                sufijo="h"
                etiqueta="Duración del curso"
              />
            </div>
          </div>

          <BarraProgreso porcentaje={porcentaje} className="mt-6" alto="h-2.5" />

          {siguiente && (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-salvia-200/80 pt-6 dark:border-crema-100/10">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-marca text-tierra-600 dark:text-tierra-300">
                  {estadoSiguiente === 'en_curso'
                    ? 'Continuar donde quedaste'
                    : estadoSiguiente === 'completada'
                      ? 'Última lección vista'
                      : 'Empezar por aquí'}
                </p>
                <p className="mt-1.5 truncate font-serif text-lg font-semibold text-bosque-800 dark:text-crema-50">
                  {siguiente.meta.titulo}
                </p>
              </div>
              <Link
                href={`/aula/modulos/${siguiente.id}`}
                className="shrink-0 rounded-full bg-bosque-700 px-6 py-2.5 text-sm font-semibold text-crema-50 shadow-suave transition-colors hover:bg-bosque-800"
              >
                {estadoSiguiente === 'en_curso' ? 'Continuar' : 'Abrir lección'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Mapa del curso */}
      <section className="seccion mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Mapa del curso</p>
            <span className="regla-crece mt-2" />
            <h2 className="mt-4 font-serif text-2xl font-semibold text-bosque-800 dark:text-crema-50 sm:text-3xl">
              El recorrido completo
            </h2>
          </div>
        </div>

        <MapaCurso grupos={obtenerCursoPorCategoria()} progreso={progreso} />
      </section>
    </>
  );
}
