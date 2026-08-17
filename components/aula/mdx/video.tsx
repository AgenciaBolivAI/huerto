'use client';

import { useState } from 'react';

import { extraerIdYouTube, type Video } from '@/lib/aula/tipos';

/* ────────────────────────────────────────────────────────────────────────────
 * Reproductor de video con carga diferida.
 *
 * La carátula es la miniatura que `scripts/verificar-videos.mjs` descargó a
 * `public/thumbs/`, no la de i.ytimg.com. Gracias a eso la lección se ve
 * completa sin conexión, y solo al pulsar reproducir se contacta con YouTube.
 * ──────────────────────────────────────────────────────────────────────────── */

const ETIQUETA_IDIOMA: Record<Video['idioma'], string | null> = {
  es: null, // el idioma por defecto del curso no necesita distintivo
  en: 'EN',
  pt: 'PT',
};

export function ReproductorVideo({ video }: { video: Video }) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [miniaturaRota, setMiniaturaRota] = useState(false);

  const id = extraerIdYouTube(video.url);
  if (!id) return null;

  const etiqueta = ETIQUETA_IDIOMA[video.idioma];

  return (
    <figure className="not-prose my-9">
      <div className="overflow-hidden rounded-2xl bg-tinta-900 shadow-realce ring-1 ring-tinta-900/10 dark:ring-crema-100/10">
        <div className="relative aspect-video w-full">
          {reproduciendo ? (
            <iframe
              // youtube-nocookie evita que ver una lección siembre cookies de
              // seguimiento en un entorno que, por lo demás, es totalmente local.
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&hl=es`}
              title={video.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setReproduciendo(true)}
              className="group absolute inset-0 h-full w-full cursor-pointer"
              aria-label={`Reproducir: ${video.titulo}`}
            >
              {!miniaturaRota ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/thumbs/${id}.jpg`}
                  alt=""
                  onError={() => setMiniaturaRota(true)}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-bosque-800 to-tinta-900" />
              )}

              <span className="absolute inset-0 bg-gradient-to-t from-tinta-950/85 via-tinta-950/20 to-transparent" />

              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-crema-50/95 shadow-realce transition duration-300 group-hover:scale-110 group-hover:bg-white">
                  <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-bosque-700" aria-hidden="true">
                    <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
                  </svg>
                </span>
              </span>

              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-left sm:p-5">
                <span className="min-w-0">
                  <span className="block text-[0.95rem] font-semibold leading-snug text-crema-50 sm:text-base">
                    {video.titulo}
                  </span>
                  <span className="mt-1 block text-xs text-crema-100/70">{video.canal}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {etiqueta && (
                    <span className="rounded bg-tierra-400 px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wide text-tinta-900">
                      {etiqueta}
                    </span>
                  )}
                  <span className="rounded bg-tinta-950/75 px-1.5 py-0.5 font-mono text-[0.7rem] text-crema-100">
                    {video.duracion}
                  </span>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      <figcaption className="mt-3 flex gap-2.5 text-sm leading-relaxed text-tinta-600 dark:text-crema-100/60">
        <span className="mt-[3px] h-3.5 w-0.5 shrink-0 rounded bg-tierra-400" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-tinta-700 dark:text-crema-100/80">
            Por qué este video:
          </strong>{' '}
          {video.porQue}
          {video.idioma === 'en' && (
            <>
              {' '}
              <span className="text-tinta-500 dark:text-crema-100/45">
                (en inglés — no se encontró material equivalente en español; activa los subtítulos
                automáticos de YouTube si te ayuda).
              </span>
            </>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * El MDX referenció un id que no está en `meta.json`. Se hace ruidoso a
 * propósito: un video mal referenciado debe verse, no fallar en silencio.
 * `scripts/validar-contenido.mjs` también lo detecta antes del build.
 */
export function VideoNoEncontrado({ id }: { id: string }) {
  return (
    <div className="not-prose my-8 rounded-xl border-2 border-dashed border-red-400 bg-red-50 p-5 dark:bg-red-950/30">
      <p className="font-sans text-sm font-semibold text-red-700 dark:text-red-300">
        Video «{id}» referenciado en el MDX pero ausente de meta.json
      </p>
      <p className="mt-1.5 text-sm text-red-600/90 dark:text-red-200/70">
        Añádelo al array <code className="font-mono">videos</code> del meta.json de esta lección y
        ejecuta <code className="font-mono">npm run verificar-videos:fix</code>.
      </p>
    </div>
  );
}

/**
 * Aviso que sustituye a los videos cuando ninguno superó la curación.
 * Es deliberadamente preferible a un enlace roto o fuera de tema.
 */
export function AvisoVideoPendiente() {
  return (
    <div className="not-prose my-8 flex items-start gap-3 rounded-xl border border-dashed border-salvia-400 bg-salvia-50/70 px-5 py-4 dark:bg-salvia-900/20">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="mt-0.5 h-5 w-5 shrink-0 text-salvia-600 dark:text-salvia-400"
        aria-hidden="true"
      >
        <path d="M12 8v4l2.5 2.5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
      <div>
        <p className="font-sans text-sm font-semibold text-salvia-800 dark:text-salvia-200">
          Pendiente de curar video para esta lección
        </p>
        <p className="mt-1 text-sm text-salvia-700/85 dark:text-salvia-300/70">
          No se encontró todavía material en video verificable y realmente centrado en este tema.
          Antes que incluir un enlace aproximado o roto, la lección se queda sin video.
        </p>
      </div>
    </div>
  );
}
