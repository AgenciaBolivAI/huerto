import type { ReactNode } from 'react';

/* ────────────────────────────────────────────────────────────────────────────
 * Bloques destacados que se usan dentro del MDX de las lecciones.
 *
 * Los dos primeros — APLICAR A RIZOMA DEL SUR y CONTEXTO BOLIVIA — son la
 * firma del curso y `scripts/validar-contenido.mjs` exige que aparezcan en
 * toda lección marcada como práctica.
 * ──────────────────────────────────────────────────────────────────────────── */

interface PropsBloque {
  children: ReactNode;
  /** Sustituye el subtítulo por defecto de la cabecera. */
  titulo?: string;
}

function Icono({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/**
 * Cómo se traduce el concepto de la lección a los 2.474 m² concretos del
 * proyecto. Es el bloque que convierte teoría en decisiones de terreno.
 */
export function AplicarRizoma({ children, titulo }: PropsBloque) {
  return (
    <aside className="not-prose my-9 overflow-hidden rounded-2xl bg-bosque-700 text-crema-50 shadow-realce dark:bg-bosque-800">
      <div className="flex items-center gap-3 border-b border-crema-50/15 px-5 py-3.5 sm:px-7">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-crema-50/10 text-salvia-300">
          <Icono className="h-4 w-4">
            {/* Brote emergiendo de un surco */}
            <path d="M12 20v-7" />
            <path d="M12 13c0-3 2-5 5-5 0 3-2 5-5 5Z" />
            <path d="M12 15c0-2.5-1.7-4.2-4.2-4.2 0 2.5 1.7 4.2 4.2 4.2Z" />
            <path d="M4 20h16" />
          </Icono>
        </span>
        <div className="min-w-0">
          <h4 className="!mt-0 font-sans text-[0.7rem] font-bold uppercase tracking-marca text-salvia-300">
            Aplicar a Rizoma del Sur
          </h4>
          <p className="mt-0.5 truncate text-xs text-crema-100/70">
            {titulo ?? '2.474 m² · Estrellas del Sur, Zanja Honda, Santa Cruz'}
          </p>
        </div>
      </div>
      <div className="prosa-invertida px-5 py-5 sm:px-7 sm:py-6">{children}</div>
    </aside>
  );
}

/**
 * En qué se diferencia lo que dicen las fuentes de EE.UU. o Europa de lo que
 * realmente aplica en suelos, clima, insumos y mercado bolivianos.
 */
export function ContextoBolivia({ children, titulo }: PropsBloque) {
  return (
    <aside className="not-prose my-9 overflow-hidden rounded-2xl bg-tierra-50 ring-1 ring-tierra-300 dark:bg-tierra-900/25 dark:ring-tierra-400/30">
      <div className="flex items-center gap-3 border-b border-tierra-300/70 px-5 py-3.5 dark:border-tierra-400/25 sm:px-7">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tierra-400/20 text-tierra-700 dark:text-tierra-300">
          <Icono className="h-4 w-4">
            {/* Capas de perfil de suelo */}
            <path d="M3 8h18" />
            <path d="M3 13h18" />
            <path d="M3 18h18" />
            <path d="M7 8V5" />
            <path d="M15 13V8" />
          </Icono>
        </span>
        <div className="min-w-0">
          <h4 className="!mt-0 font-sans text-[0.7rem] font-bold uppercase tracking-marca text-tierra-700 dark:text-tierra-300">
            Contexto Bolivia
          </h4>
          <p className="mt-0.5 truncate text-xs text-tierra-700/70 dark:text-tierra-200/60">
            {titulo ?? 'Suelos, clima, insumos y mercado locales'}
          </p>
        </div>
      </div>
      <div className="prosa px-5 py-5 sm:px-7 sm:py-6">{children}</div>
    </aside>
  );
}

/**
 * Analogía de ingeniería o de sistemas. El estudiante lleva 14 años
 * programando: un concepto agronómico entra mucho más rápido si primero se
 * ancla en algo que ya conoce.
 */
export function Analogia({ children, titulo }: PropsBloque) {
  return (
    <aside className="not-prose my-8 rounded-xl border-l-[3px] border-salvia-500 bg-salvia-50 px-5 py-4 dark:bg-salvia-900/25">
      <p className="!mt-0 flex items-center gap-2 font-sans text-[0.7rem] font-bold uppercase tracking-marca text-salvia-700 dark:text-salvia-300">
        <Icono className="h-3.5 w-3.5">
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M16 3h3a2 2 0 0 1 2 2v3" />
          <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          <path d="M9 12h6" />
        </Icono>
        {titulo ?? 'Analogía de ingeniería'}
      </p>
      <div className="prosa mt-2.5 text-[1rem]">{children}</div>
    </aside>
  );
}

/** Dato numérico o hecho que conviene retener. */
export function Dato({ children, titulo }: PropsBloque) {
  return (
    <aside className="not-prose my-7 rounded-xl bg-bosque-50 px-5 py-4 ring-1 ring-bosque-200 dark:bg-bosque-900/30 dark:ring-bosque-700/50">
      <p className="!mt-0 font-sans text-[0.7rem] font-bold uppercase tracking-marca text-bosque-700 dark:text-salvia-300">
        {titulo ?? 'Dato clave'}
      </p>
      <div className="prosa mt-2 text-[1rem]">{children}</div>
    </aside>
  );
}

/** Error frecuente o trampa en la que es fácil caer. */
export function Advertencia({ children, titulo }: PropsBloque) {
  return (
    <aside className="not-prose my-7 rounded-xl bg-amber-50 px-5 py-4 ring-1 ring-amber-300 dark:bg-amber-950/30 dark:ring-amber-700/40">
      <p className="!mt-0 flex items-center gap-2 font-sans text-[0.7rem] font-bold uppercase tracking-marca text-amber-800 dark:text-amber-300">
        <Icono className="h-3.5 w-3.5">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </Icono>
        {titulo ?? 'Cuidado'}
      </p>
      <div className="prosa mt-2 text-[1rem]">{children}</div>
    </aside>
  );
}

/** Figura o esquema con pie. El contenido suele ser ASCII o una tabla. */
export function Figura({
  children,
  pie,
}: {
  children: ReactNode;
  pie?: string;
}) {
  return (
    <figure className="not-prose my-8">
      <div className="overflow-x-auto rounded-xl bg-tinta-900 p-5 dark:bg-black/40 dark:ring-1 dark:ring-crema-100/10">
        <div className="min-w-fit font-mono text-[0.8rem] leading-[1.65] text-crema-100 [white-space:pre]">
          {children}
        </div>
      </div>
      {pie && (
        <figcaption className="mt-2.5 text-center text-sm text-tinta-500 dark:text-crema-100/50">
          {pie}
        </figcaption>
      )}
    </figure>
  );
}

/** Ecuación destacada con su lectura en palabras. */
export function Formula({
  children,
  explicacion,
}: {
  children: ReactNode;
  explicacion?: string;
}) {
  return (
    <div className="not-prose my-7 rounded-xl border border-dashed border-salvia-400 bg-white/60 px-5 py-4 text-center dark:bg-tinta-900/50">
      <p className="font-mono text-[1.05rem] leading-relaxed text-bosque-800 dark:text-salvia-200">
        {children}
      </p>
      {explicacion && (
        <p className="mt-2 text-sm italic text-tinta-500 dark:text-crema-100/55">{explicacion}</p>
      )}
    </div>
  );
}

/**
 * Envoltura de tabla con desbordamiento horizontal propio: las tablas de este
 * curso (rangos de pH, densidades, calendarios) no deben forzar scroll lateral
 * en toda la página.
 */
export function Tabla({ children }: { children: ReactNode }) {
  return <div className="tabla-envoltura my-7">{children}</div>;
}
