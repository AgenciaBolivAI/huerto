import Link from 'next/link';
import type { Metadata } from 'next';

import { buscarLeccionPorId, obtenerCurso, obtenerGlosario } from '@/lib/aula/contenido';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Glosario' };

/**
 * Glosario global: todos los términos que el curso define, con su definición y
 * la lección donde se explican a fondo.
 *
 * Filtra y busca en el servidor, y no en el navegador, por una razón concreta:
 * son casi dos mil quinientos términos y dos megas y medio de definiciones.
 * Mandarlos enteros para que el navegador filtre castigaría justamente al
 * lector que este curso quiere alcanzar —teléfono barato, datos que se pagan—.
 * Aquí solo viaja la letra que se está mirando, y la búsqueda es un formulario
 * que funciona con el JavaScript desactivado.
 */

/** Sin tildes y en minúsculas, que es como busca la gente. */
const plano = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
/* Cuántos términos por página. Con definiciones de ~700 caracteres, ciento
 * veinte entradas pesaban casi medio mega de HTML: demasiado para un teléfono
 * con datos contados, que es el lector de este curso. Sesenta deja la página
 * en torno a los 200 KB y el resto se pagina. */
const TOPE = 60;

export default function PaginaGlosario({
  searchParams,
}: {
  searchParams: { q?: string; letra?: string; p?: string };
}) {
  const glosario = obtenerGlosario();
  const curso = obtenerCurso();

  const numeroDeModulo = new Map(curso.map((m) => [m.id, m.datos.numero]));

  const consulta = (searchParams.q ?? '').trim();
  const buscando = consulta.length > 0;

  const porLetra = new Map<string, number>();
  for (const t of glosario) {
    const l = plano(t.termino).charAt(0).toUpperCase();
    porLetra.set(l, (porLetra.get(l) ?? 0) + 1);
  }

  const letraPedida = (searchParams.letra ?? '').toUpperCase();
  const letra = LETRAS.includes(letraPedida) ? letraPedida : 'A';

  let resultados = glosario;
  if (buscando) {
    const q = plano(consulta);
    resultados = glosario.filter(
      (t) =>
        plano(t.termino).includes(q) ||
        plano(t.slug).includes(q) ||
        (t.sinonimos ?? []).some((s) => plano(s).includes(q)) ||
        plano(t.definicion).includes(q),
    );
  } else {
    resultados = glosario.filter((t) => plano(t.termino).charAt(0).toUpperCase() === letra);
  }

  const total = resultados.length;
  const paginas = Math.max(1, Math.ceil(total / TOPE));
  const pagina = Math.min(Math.max(1, Number.parseInt(searchParams.p ?? '1', 10) || 1), paginas);
  const mostrados = resultados.slice((pagina - 1) * TOPE, pagina * TOPE);

  const enlacePagina = (n: number) => {
    const p = new URLSearchParams();
    if (buscando) p.set('q', consulta);
    else p.set('letra', letra);
    if (n > 1) p.set('p', String(n));
    return `/aula/glosario?${p.toString()}`;
  };

  return (
    <div className="seccion py-14">
      <p className="eyebrow">Vocabulario</p>
      <span className="regla-crece mt-2" />
      <h1 className="mt-4 font-serif text-3xl font-semibold text-bosque-800 dark:text-crema-50 sm:text-4xl">
        Glosario
      </h1>
      <p className="mt-3 max-w-2xl text-tinta-600 dark:text-crema-100/60">
        Los {glosario.length.toLocaleString('es-BO')} términos que el curso define, cada uno con la
        lección donde se explica a fondo. Ninguno se da por sabido: si aparece en una lección, está
        aquí.
      </p>

      {/* Formulario normal: busca aunque el navegador no ejecute JavaScript. */}
      <form action="/aula/glosario" method="get" className="mt-8 flex max-w-xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={consulta}
          placeholder="Buscar un término, un sinónimo o una palabra de la definición"
          aria-label="Buscar en el glosario"
          className="min-w-0 flex-1 rounded-full border border-salvia-300 bg-white/80 px-5 py-2.5 text-sm text-tinta-800 placeholder:text-tinta-400 focus:border-bosque-600 focus:outline-none dark:border-crema-100/15 dark:bg-tinta-900/60 dark:text-crema-100/85 dark:placeholder:text-crema-100/30"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-bosque-700 px-5 py-2.5 text-sm font-semibold text-crema-50 transition-colors hover:bg-bosque-800"
        >
          Buscar
        </button>
      </form>

      {buscando ? (
        <p className="mt-5 text-sm text-tinta-500 dark:text-crema-100/50">
          {total === 0 ? (
            <>
              Ningún término coincide con <strong>«{consulta}»</strong>.{' '}
              <Link href="/aula/glosario" className="text-bosque-700 underline dark:text-salvia-300">
                Ver el glosario completo
              </Link>
            </>
          ) : (
            <>
              {total} {total === 1 ? 'término' : 'términos'} para{' '}
              <strong className="text-tinta-700 dark:text-crema-100/75">«{consulta}»</strong>
              {paginas > 1 && <> · página {pagina} de {paginas}</>} ·{' '}
              <Link href="/aula/glosario" className="text-bosque-700 underline dark:text-salvia-300">
                limpiar
              </Link>
            </>
          )}
        </p>
      ) : (
        <nav aria-label="Índice alfabético" className="mt-6 flex flex-wrap gap-1.5">
          {LETRAS.map((l) => {
            const n = porLetra.get(l) ?? 0;
            const activa = l === letra;
            if (n === 0)
              return (
                <span
                  key={l}
                  className="grid h-9 w-9 place-items-center rounded-full text-sm text-tinta-300 dark:text-crema-100/15"
                  aria-hidden="true"
                >
                  {l}
                </span>
              );
            return (
              <Link
                key={l}
                href={`/glosario?letra=${l}`}
                aria-current={activa ? 'page' : undefined}
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-medium transition-colors ${
                  activa
                    ? 'bg-bosque-700 text-crema-50'
                    : 'text-tinta-600 hover:bg-salvia-100 hover:text-bosque-800 dark:text-crema-100/60 dark:hover:bg-white/5'
                }`}
              >
                {l}
              </Link>
            );
          })}
        </nav>
      )}

      {!buscando && (
        <p className="mt-5 text-sm text-tinta-500 dark:text-crema-100/50">
          {total} {total === 1 ? 'término' : 'términos'} con {letra}
          {paginas > 1 && (
            <>
              {' '}
              · página {pagina} de {paginas}
            </>
          )}
        </p>
      )}

      <dl className="mt-8 space-y-3">
        {mostrados.map((t) => {
          const leccion = t.leccion ? buscarLeccionPorId(t.leccion) : null;
          const numero = leccion ? numeroDeModulo.get(leccion.moduloId) : undefined;

          return (
            <div
              key={t.slug}
              id={t.slug}
              className="scroll-mt-24 rounded-2xl bg-white/70 px-5 py-5 ring-1 ring-tinta-900/5 dark:bg-tinta-900/50 dark:ring-crema-100/10 sm:px-6"
            >
              <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-serif text-lg font-semibold text-bosque-800 dark:text-crema-50">
                  {t.termino}
                </span>
                {(t.sinonimos ?? []).length > 0 && (
                  <span className="text-sm text-tinta-400 dark:text-crema-100/35">
                    también: {(t.sinonimos ?? []).join(', ')}
                  </span>
                )}
              </dt>

              <dd className="mt-2.5 text-[0.95rem] leading-relaxed text-tinta-700 dark:text-crema-100/70">
                {t.definicion}
              </dd>

              {leccion && (
                <dd className="mt-3">
                  <Link
                    href={`/aula/modulos/${leccion.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-bosque-700 transition-colors hover:text-bosque-800 dark:text-salvia-300"
                  >
                    {numero !== undefined && (
                      <span className="text-tinta-400 dark:text-crema-100/35">
                        Módulo {numero} ·
                      </span>
                    )}
                    {leccion.meta.titulo}
                    <span aria-hidden="true">→</span>
                  </Link>
                </dd>
              )}
            </div>
          );
        })}
      </dl>

      {paginas > 1 && (
        <nav
          aria-label="Paginación del glosario"
          className="mt-10 flex items-center justify-between gap-4 border-t border-salvia-200/70 pt-6 dark:border-crema-100/10"
        >
          {pagina > 1 ? (
            <Link
              href={enlacePagina(pagina - 1)}
              className="rounded-full border border-salvia-300 px-5 py-2 text-sm font-medium text-tinta-600 transition-colors hover:border-bosque-600 hover:text-bosque-800 dark:border-crema-100/15 dark:text-crema-100/60"
            >
              ← Anteriores
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-tinta-400 dark:text-crema-100/35">
            {pagina} / {paginas}
          </span>
          {pagina < paginas ? (
            <Link
              href={enlacePagina(pagina + 1)}
              className="rounded-full border border-salvia-300 px-5 py-2 text-sm font-medium text-tinta-600 transition-colors hover:border-bosque-600 hover:text-bosque-800 dark:border-crema-100/15 dark:text-crema-100/60"
            >
              Siguientes →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
