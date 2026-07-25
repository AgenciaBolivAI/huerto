'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { accionGuardarNota } from '@/lib/acciones';

type EstadoGuardado = 'inactivo' | 'escribiendo' | 'guardando' | 'guardado';

const RETARDO_AUTOGUARDADO_MS = 800;

/**
 * Cuaderno de la lección. Markdown plano, autoguardado con retardo.
 *
 * Lo escrito va a SQLite, no al navegador: son las observaciones del terreno
 * y deben sobrevivir a cualquier limpieza de datos del navegador.
 */
export function EditorNotas({
  leccionId,
  notaInicial,
}: {
  leccionId: string;
  notaInicial: string;
}) {
  const [texto, setTexto] = useState(notaInicial);
  const [estado, setEstado] = useState<EstadoGuardado>('inactivo');
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const sinGuardar = useRef(false);

  const guardar = useCallback(
    async (contenido: string) => {
      setEstado('guardando');
      await accionGuardarNota(leccionId, contenido);
      sinGuardar.current = false;
      setEstado('guardado');
    },
    [leccionId],
  );

  function alEscribir(valor: string) {
    setTexto(valor);
    setEstado('escribiendo');
    sinGuardar.current = true;
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => void guardar(valor), RETARDO_AUTOGUARDADO_MS);
  }

  // Red de seguridad: si se cierra la pestaña con el retardo aún corriendo, se
  // fuerza el guardado antes de que la página desaparezca.
  useEffect(() => {
    function alSalir() {
      if (!sinGuardar.current) return;
      if (temporizador.current) clearTimeout(temporizador.current);
      void accionGuardarNota(leccionId, areaRef.current?.value ?? '');
    }
    window.addEventListener('pagehide', alSalir);
    return () => {
      window.removeEventListener('pagehide', alSalir);
      alSalir();
    };
  }, [leccionId]);

  // Ctrl/Cmd+S guarda de inmediato, por costumbre de teclado.
  function alPulsarTecla(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (temporizador.current) clearTimeout(temporizador.current);
      void guardar(texto);
    }
  }

  const palabras = texto.trim() ? texto.trim().split(/\s+/).length : 0;

  return (
    <section className="rounded-2xl bg-white/70 p-5 ring-1 ring-tinta-900/5 dark:bg-tinta-900/50 dark:ring-crema-100/10 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-tierra-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <h2 className="font-serif text-lg font-semibold text-bosque-800 dark:text-crema-50">
            Mi cuaderno
          </h2>
        </div>

        <span
          className={`text-xs transition-colors ${
            estado === 'guardado'
              ? 'text-bosque-600 dark:text-salvia-400'
              : 'text-tinta-400 dark:text-crema-100/35'
          }`}
          aria-live="polite"
        >
          {estado === 'guardando' && 'Guardando…'}
          {estado === 'guardado' && '✓ Guardado en SQLite'}
          {estado === 'escribiendo' && 'Sin guardar…'}
          {estado === 'inactivo' && palabras > 0 && `${palabras} palabras`}
          {estado === 'inactivo' && palabras === 0 && 'Markdown · autoguardado'}
        </span>
      </div>

      <textarea
        ref={areaRef}
        value={texto}
        onChange={(e) => alEscribir(e.target.value)}
        onKeyDown={alPulsarTecla}
        rows={8}
        spellCheck
        placeholder={
          'Lo que observes en el terreno, dudas, mediciones, decisiones…\n\n' +
          'Acepta markdown:  ## Título   **negrita**   - lista   `código`'
        }
        className="mt-4 w-full resize-y rounded-xl border-0 bg-crema-50 p-4 font-mono text-[0.9rem] leading-relaxed text-tinta-800 ring-1 ring-inset ring-salvia-200 placeholder:text-tinta-400/70 focus:ring-2 focus:ring-inset focus:ring-bosque-500 dark:bg-tinta-950/60 dark:text-crema-100/85 dark:ring-crema-100/10 dark:placeholder:text-crema-100/25"
      />

      <p className="mt-2.5 text-xs text-tinta-400 dark:text-crema-100/30">
        Se guarda solo. Todas las notas se podrán exportar juntas a un único .md.
      </p>
    </section>
  );
}
