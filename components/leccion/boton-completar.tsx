'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { accionAlternarCompletada } from '@/lib/acciones';
import type { EstadoLeccion } from '@/lib/tipos';

export function BotonCompletar({
  leccionId,
  moduloId,
  estadoInicial,
}: {
  leccionId: string;
  moduloId: string;
  estadoInicial: EstadoLeccion;
}) {
  const [estado, setEstado] = useState(estadoInicial);
  const [pendiente, iniciarTransicion] = useTransition();
  const router = useRouter();

  const completada = estado === 'completada';

  function alternar() {
    // Optimista: el botón responde en el acto y luego se confirma con la base
    // de datos; si algo fallara, el refresh devolvería el estado real.
    const optimista: EstadoLeccion = completada ? 'en_curso' : 'completada';
    setEstado(optimista);

    iniciarTransicion(async () => {
      const real = await accionAlternarCompletada(leccionId, moduloId);
      setEstado(real);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pendiente}
      className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-all disabled:opacity-70 ${
        completada
          ? 'bg-bosque-100 text-bosque-800 ring-1 ring-bosque-300 hover:bg-bosque-200 dark:bg-bosque-500/20 dark:text-salvia-300 dark:ring-bosque-600'
          : 'bg-bosque-700 text-crema-50 shadow-suave hover:bg-bosque-800 hover:shadow-realce'
      }`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-full transition-colors ${
          completada ? 'bg-bosque-600 text-crema-50' : 'border-2 border-crema-50/50'
        }`}
      >
        {completada && (
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5L20 7" />
          </svg>
        )}
      </span>
      {completada ? 'Lección completada' : 'Marcar como completada'}
    </button>
  );
}
