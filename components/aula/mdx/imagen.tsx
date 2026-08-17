'use client';

import { useState } from 'react';

/* ────────────────────────────────────────────────────────────────────────────
 * Imágenes de las lecciones.
 *
 * Todas viven en `public/imagenes/{modulo}/{leccion}/`, descargadas al repo.
 * Nada se sirve desde una CDN externa: la lección debe verse entera sin
 * conexión, igual que las carátulas de los videos.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Diagrama científico. Fondo crema fijo en ambos temas: son ilustraciones
 * planas dibujadas sobre crema, y ponerlas sobre un fondo oscuro las dejaría
 * flotando en un rectángulo claro con aspecto de error.
 */
export function Diagrama({
  src,
  pie,
  alt,
}: {
  src: string;
  pie?: string;
  alt: string;
}) {
  return (
    <figure className="not-prose my-9">
      <div className="overflow-hidden rounded-2xl bg-crema-50 ring-1 ring-tinta-900/10 dark:ring-crema-100/15">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full" loading="lazy" />
      </div>
      {pie && (
        <figcaption className="mt-3 flex gap-2.5 text-sm leading-relaxed text-tinta-600 dark:text-crema-100/60">
          <span className="mt-[3px] h-3.5 w-0.5 shrink-0 rounded bg-tierra-400" aria-hidden="true" />
          <span>{pie}</span>
        </figcaption>
      )}
    </figure>
  );
}

/** Fotografía o ilustración atmosférica. Se permite recorte y ampliación. */
export function Ilustracion({
  src,
  pie,
  alt,
  ancho = 'normal',
}: {
  src: string;
  pie?: string;
  alt: string;
  /** `amplio` desborda el ancho de lectura para dar respiro visual. */
  ancho?: 'normal' | 'amplio';
}) {
  return (
    <figure className={`not-prose my-10 ${ancho === 'amplio' ? 'lg:-mx-16' : ''}`}>
      <div className="overflow-hidden rounded-2xl bg-tinta-900 shadow-realce ring-1 ring-tinta-900/10 dark:ring-crema-100/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full" loading="lazy" />
      </div>
      {pie && (
        <figcaption className="mt-3 text-center text-sm italic text-tinta-500 dark:text-crema-100/50">
          {pie}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Portada de la lección. Se muestra a sangre bajo la cabecera y se degrada
 * hacia el fondo para que el texto que sigue no arranque en seco.
 */
export function PortadaLeccion({ src, alt }: { src: string; alt: string }) {
  const [rota, setRota] = useState(false);
  if (rota) return null;

  return (
    <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-tinta-900 shadow-realce">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setRota(true)}
        className="h-full w-full object-cover"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-tinta-950/45 to-transparent" />
    </div>
  );
}
