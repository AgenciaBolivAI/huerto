'use client';

import { useState } from 'react';

/**
 * Descarga las notas como un único archivo Markdown, y ofrece copiarlas.
 *
 * El texto va ya montado desde el servidor: aquí no se rehace nada, solo se
 * entrega. Son las notas de quien estudia y tiene que poder llevárselas —de eso
 * va un proyecto que promete acceso libre: si el aula desaparece mañana, el
 * cuaderno se queda con su dueño.
 */
export function ExportarNotas({ markdown, nombre }: { markdown: string; nombre: string }) {
  const [copiado, setCopiado] = useState(false);

  const descargar = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* Sin portapapeles disponible queda la descarga, que no depende de permisos. */
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      <button
        type="button"
        onClick={descargar}
        className="rounded-full bg-bosque-700 px-5 py-2.5 text-sm font-semibold text-crema-50 transition-colors hover:bg-bosque-800"
      >
        Descargar en .md
      </button>
      <button
        type="button"
        onClick={copiar}
        className="rounded-full border border-salvia-300 px-5 py-2.5 text-sm font-medium text-tinta-600 transition-colors hover:border-bosque-600 hover:text-bosque-800 dark:border-crema-100/15 dark:text-crema-100/60"
      >
        {copiado ? 'Copiado' : 'Copiar todo'}
      </button>
    </div>
  );
}
