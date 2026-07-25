'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Bloqueo suave de prerrequisitos: avisa de lo que conviene haber visto antes,
 * pero nunca impide leer la lección. Saltarse el orden es decisión del alumno,
 * y el contenido ya está visible debajo — esto solo lo señala.
 */
export function AvisoPrerrequisitos({
  faltantes,
}: {
  faltantes: { id: string; titulo: string }[];
}) {
  const [oculto, setOculto] = useState(false);
  if (oculto || faltantes.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl bg-tierra-50 px-5 py-4 ring-1 ring-tierra-300 dark:bg-tierra-900/25 dark:ring-tierra-400/30 sm:px-6">
      <div className="flex gap-3.5">
        <svg
          viewBox="0 0 24 24"
          className="mt-0.5 h-5 w-5 shrink-0 text-tierra-600 dark:text-tierra-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 8v5M12 16.5h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-tierra-800 dark:text-tierra-200">
            Esta lección se apoya en {faltantes.length === 1 ? 'otra que aún no has' : 'otras que aún no has'} completado
          </p>
          <ul className="mt-2 space-y-1">
            {faltantes.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/modulos/${f.id}`}
                  className="text-sm font-medium text-tierra-700 underline decoration-tierra-400 underline-offset-2 hover:text-tierra-900 dark:text-tierra-300 dark:hover:text-tierra-200"
                >
                  {f.titulo}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOculto(true)}
            className="mt-3.5 rounded-full bg-tierra-400/25 px-4 py-1.5 text-sm font-semibold text-tierra-800 transition-colors hover:bg-tierra-400/40 dark:text-tierra-200"
          >
            Seguir de todos modos
          </button>
        </div>
      </div>
    </div>
  );
}
