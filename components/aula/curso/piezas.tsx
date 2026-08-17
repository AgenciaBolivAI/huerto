import Link from 'next/link';

import type { EstadoLeccion, Racha } from '@/lib/aula/tipos';

/* Piezas pequeñas reutilizadas por el panel, el índice de módulos y la lección. */

export function BarraProgreso({
  porcentaje,
  className = '',
  alto = 'h-2',
}: {
  porcentaje: number;
  className?: string;
  alto?: string;
}) {
  return (
    <div
      className={`${alto} w-full overflow-hidden rounded-full bg-salvia-200 dark:bg-white/10 ${className}`}
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-bosque-600 to-salvia-500 transition-[width] duration-700 ease-out"
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
}

const ESTILO_ESTADO: Record<EstadoLeccion, { texto: string; clase: string }> = {
  no_iniciada: {
    texto: 'No iniciada',
    clase: 'bg-salvia-100 text-salvia-700 dark:bg-white/5 dark:text-crema-100/50',
  },
  en_curso: {
    texto: 'En curso',
    clase: 'bg-tierra-100 text-tierra-700 dark:bg-tierra-400/15 dark:text-tierra-300',
  },
  completada: {
    texto: 'Completada',
    clase: 'bg-bosque-100 text-bosque-800 dark:bg-bosque-500/20 dark:text-salvia-300',
  },
};

export function InsigniaEstado({ estado }: { estado: EstadoLeccion }) {
  const { texto, clase } = ESTILO_ESTADO[estado];
  return (
    <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${clase}`}>{texto}</span>
  );
}

/** Círculo con el estado de una lección, para las listas. */
export function PuntoEstado({ estado }: { estado: EstadoLeccion }) {
  if (estado === 'completada') {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-bosque-600 text-crema-50">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </span>
    );
  }
  if (estado === 'en_curso') {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-tierra-400">
        <span className="h-2 w-2 rounded-full bg-tierra-400" />
      </span>
    );
  }
  return (
    <span className="h-6 w-6 shrink-0 rounded-full border-2 border-salvia-300 dark:border-white/15" />
  );
}

export function PanelRacha({ racha }: { racha: Racha }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
          racha.actual > 0
            ? 'bg-tierra-400/20 text-tierra-600 dark:text-tierra-300'
            : 'bg-salvia-100 text-salvia-500 dark:bg-white/5 dark:text-crema-100/35'
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M12 2c.5 3.5-1.5 4.5-3 6.5C7.3 10.7 6 12.5 6 15a6 6 0 0 0 12 0c0-2.8-1.4-4.6-2.8-6.2-.4 1-1 1.7-1.8 2.1.4-2.6-.4-5.5-1.4-6.9Z" />
        </svg>
      </span>
      <div className="leading-tight">
        <p className="font-serif text-2xl font-semibold text-tinta-900 dark:text-crema-50">
          {racha.actual}
          <span className="ml-1 text-sm font-sans font-normal text-tinta-500 dark:text-crema-100/50">
            {racha.actual === 1 ? 'día' : 'días'}
          </span>
        </p>
        <p className="text-xs text-tinta-500 dark:text-crema-100/50">
          {racha.estudiadoHoy
            ? 'Racha viva · ya estudiaste hoy'
            : racha.actual > 0
              ? 'Estudia hoy para no cortarla'
              : 'Sin racha activa'}
          {racha.maxima > racha.actual && ` · récord ${racha.maxima}`}
        </p>
      </div>
    </div>
  );
}

/** Cifra grande con su etiqueta, para la fila de métricas del panel. */
export function Metrica({
  valor,
  etiqueta,
  sufijo,
}: {
  valor: number | string;
  etiqueta: string;
  sufijo?: string;
}) {
  return (
    <div className="leading-tight">
      <p className="font-serif text-2xl font-semibold text-tinta-900 dark:text-crema-50">
        {valor}
        {sufijo && (
          <span className="ml-0.5 text-sm font-sans font-normal text-tinta-500 dark:text-crema-100/50">
            {sufijo}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-xs text-tinta-500 dark:text-crema-100/50">{etiqueta}</p>
    </div>
  );
}

/** Aviso que ocupa el lugar de una sección aún no construida. */
export function Proximamente({
  titulo,
  descripcion,
  fase,
}: {
  titulo: string;
  descripcion: string;
  fase: string;
}) {
  return (
    <div className="seccion py-20">
      <div className="marco-filete mx-auto max-w-xl px-8 py-12 text-center">
        <p className="eyebrow">{fase}</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-bosque-800 dark:text-crema-50">
          {titulo}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-tinta-600 dark:text-crema-100/60">{descripcion}</p>
        <Link
          href="/aula/modulos"
          className="mt-7 inline-flex rounded-full bg-bosque-700 px-6 py-2.5 text-sm font-semibold text-crema-50 transition-colors hover:bg-bosque-800"
        >
          Ir a los módulos
        </Link>
      </div>
    </div>
  );
}
