import Link from 'next/link';
import type { Metadata } from 'next';

import { ExportarNotas } from '@/components/aula/curso/exportar-notas';
import { buscarLeccionPorId, obtenerCurso } from '@/lib/aula/contenido';
import { obtenerTodasLasNotas } from '@/lib/aula/progreso';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Todas mis notas' };

const fecha = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Todas las notas del curso en una sola página, en el orden del temario.
 *
 * El cuaderno vive dentro de cada lección; esto es la vista de conjunto y, sobre
 * todo, la salida: un archivo Markdown con todo lo escrito. Un curso que promete
 * acceso libre tiene que dejar que el estudiante se lleve lo suyo sin pedir
 * permiso ni depender de que el sitio siga en pie.
 */
export default async function PaginaNotas() {
  const [notas, curso] = await Promise.all([obtenerTodasLasNotas(), obtenerCurso()]);

  // Se ordenan por el temario y no por fecha: las notas se releen siguiendo el
  // curso, no el orden en que se escribieron.
  const orden = new Map<string, number>();
  curso.forEach((m, im) =>
    m.lecciones.forEach((l, il) => orden.set(l.id, im * 1000 + il)),
  );

  const enriquecidas = notas
    .map((n) => {
      const leccion = buscarLeccionPorId(n.leccionId);
      const modulo = leccion ? curso.find((m) => m.id === leccion.moduloId) : undefined;
      return { ...n, leccion, modulo, peso: orden.get(n.leccionId) ?? Number.MAX_SAFE_INTEGER };
    })
    .sort((a, b) => a.peso - b.peso);

  const palabras = enriquecidas.reduce((s, n) => s + n.contenido.trim().split(/\s+/).length, 0);

  const markdown = [
    '# Mis notas · Aula de Rizoma del Sur',
    '',
    ...enriquecidas.flatMap((n) => [
      `## ${n.modulo ? `${n.modulo.datos.numero}. ` : ''}${n.leccion?.meta.titulo ?? n.leccionId}`,
      n.modulo ? `*${n.modulo.datos.titulo}*` : '',
      '',
      n.contenido.trim(),
      '',
    ]),
  ].join('\n');

  return (
    <div className="seccion py-14">
      <p className="eyebrow">Cuaderno</p>
      <span className="regla-crece mt-2" />
      <h1 className="mt-4 font-serif text-3xl font-semibold text-bosque-800 dark:text-crema-50 sm:text-4xl">
        Todas mis notas
      </h1>

      {enriquecidas.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-2xl bg-white/70 px-6 py-8 ring-1 ring-tinta-900/5 dark:bg-tinta-900/50 dark:ring-crema-100/10">
          <p className="text-tinta-600 dark:text-crema-100/60">
            Todavía no has escrito ninguna nota. Cada lección tiene su cuaderno al final: lo que
            escribas ahí aparece aquí, reunido y en el orden del curso, y se puede descargar entero.
          </p>
          <Link
            href="/aula/modulos"
            className="mt-5 inline-block rounded-full bg-bosque-700 px-5 py-2.5 text-sm font-semibold text-crema-50 transition-colors hover:bg-bosque-800"
          >
            Ir al índice
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-3 max-w-2xl text-tinta-600 dark:text-crema-100/60">
            {enriquecidas.length} {enriquecidas.length === 1 ? 'nota' : 'notas'} ·{' '}
            {palabras.toLocaleString('es-BO')}{' '}
            {palabras === 1 ? 'palabra' : 'palabras'}, en el orden del temario.
          </p>

          <div className="mt-7">
            <ExportarNotas markdown={markdown} nombre="notas-aula-rizoma-del-sur.md" />
          </div>

          <div className="mt-10 space-y-4">
            {enriquecidas.map((n) => (
              <article
                key={n.leccionId}
                className="rounded-2xl bg-white/70 px-5 py-5 ring-1 ring-tinta-900/5 dark:bg-tinta-900/50 dark:ring-crema-100/10 sm:px-6"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="min-w-0 font-serif text-lg font-semibold text-bosque-800 dark:text-crema-50">
                    <Link href={`/aula/modulos/${n.leccionId}`} className="hover:underline">
                      {n.leccion?.meta.titulo ?? n.leccionId}
                    </Link>
                  </h2>
                  {n.actualizadaEn && (
                    <span className="shrink-0 text-xs text-tinta-400 dark:text-crema-100/35">
                      {fecha(n.actualizadaEn)}
                    </span>
                  )}
                </header>

                {n.modulo && (
                  <p className="mt-0.5 text-sm text-tinta-500 dark:text-crema-100/45">
                    Módulo {n.modulo.datos.numero} · {n.modulo.datos.titulo}
                  </p>
                )}

                <p className="mt-3.5 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-tinta-700 dark:text-crema-100/70">
                  {n.contenido.trim()}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
