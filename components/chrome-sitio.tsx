'use client';

import { usePathname } from 'next/navigation';

/**
 * Decide si se muestra el marco del sitio —cabecera, pie y cualquier elemento flotante de
 * WhatsApp— alrededor del contenido.
 *
 * El aula (`/aula`) trae su propia cabecera y su propio pie, y además tiene modo
 * oscuro, así que apilar encima el marco de la tienda dejaría dos cabeceras y
 * dos pies en la misma página. Aquí se apaga.
 *
 * La cabecera, el pie y el botón llegan como props en vez de importarse dentro:
 * así siguen renderizándose en el servidor —el pie y el botón no son
 * componentes de cliente— y este envoltorio solo decide si pintarlos.
 */
export function ChromeSitio({
  cabecera,
  pie,
  flotante,
  children,
}: {
  cabecera: React.ReactNode;
  pie: React.ReactNode;
  /** Opcional: hoy no hay ninguno desde que se quitó el botón de WhatsApp. */
  flotante?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ruta = usePathname();
  const enAula = ruta === '/aula' || ruta.startsWith('/aula/');

  if (enAula) return <>{children}</>;

  return (
    <>
      {cabecera}
      <main className="flex-1">{children}</main>
      {pie}
      {flotante}
    </>
  );
}
