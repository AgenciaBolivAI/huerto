import type { Metadata } from 'next';

import { Proximamente } from '@/components/curso/piezas';

export const metadata: Metadata = { title: 'Herramientas' };

export default function PaginaHerramientas() {
  return (
    <Proximamente
      fase="Fase 3"
      titulo="Herramientas"
      descripcion="Las calculadoras del proyecto: densidad de siembra, volumen de sustrato por tiesto, necesidad de riego por evapotranspiración, costo/precio/margen por plantín y el planificador de calendario de siembra para el clima de Santa Cruz."
    />
  );
}
