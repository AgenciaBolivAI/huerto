import Link from 'next/link';

import { BarraProgreso, Metrica, PanelRacha } from '@/components/curso/piezas';
import { MapaCurso } from '@/components/curso/mapa-curso';
import { buscarLeccionPorId, obtenerCurso } from '@/lib/contenido';
import { obtenerAjuste, obtenerRacha, obtenerTodoElProgreso } from '@/lib/progreso';

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
      <section className="seccion pt-14 sm:pt-20">
        <div className="animate-aparecer-arriba">
          <p className="eyebrow">Curso completo · 13 módulos</p>
          <span className="regla-crece mt-2" />
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.1] text-bosque-800 dark:text-crema-50 sm:text-5xl">
            De 0 a Experto en Huertos y Viveros
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-tinta-600 dark:text-crema-100/65">
            La ciencia y la práctica necesarias para diseñar, construir, operar, automatizar y
            monetizar <strong className="font-semibold text-tinta-800 dark:text-crema-100/85">Rizoma del Sur</strong> —
            2.474 m² de vivero y huerto biológico en Santa Cruz de la Sierra.
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
                href={`/modulos/${siguiente.id}`}
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

        <MapaCurso curso={curso} progreso={progreso} />
      </section>
    </>
  );
}
