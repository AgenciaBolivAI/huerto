import type { Metadata } from 'next';

import { Proximamente } from '@/components/curso/piezas';

export const metadata: Metadata = { title: 'Todas mis notas' };

export default function PaginaNotas() {
  return (
    <Proximamente
      fase="Fase 3"
      titulo="Todas mis notas"
      descripcion="La vista agregada de las notas de todas las lecciones, con exportación a un único archivo .md. El cuaderno por lección ya funciona y guarda en SQLite: lo que escribas ahora aparecerá aquí cuando esta vista esté construida."
    />
  );
}
