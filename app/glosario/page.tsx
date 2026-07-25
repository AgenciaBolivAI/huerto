import type { Metadata } from 'next';

import { Proximamente } from '@/components/curso/piezas';

export const metadata: Metadata = { title: 'Glosario' };

export default function PaginaGlosario() {
  return (
    <Proximamente
      fase="Fase 3"
      titulo="Glosario"
      descripcion="El glosario global con búsqueda, donde cada término enlaza a la lección que lo explica. Las lecciones ya marcan sus términos con el componente Termino, así que el glosario se irá llenando solo a medida que se escriba el contenido."
    />
  );
}
