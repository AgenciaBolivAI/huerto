/**
 * Puentes entre el vivero y el aula.
 *
 * El sitio tiene dos mitades que hasta ahora no se hablaban: un catálogo que
 * vende plantas y un curso que enseña a cultivarlas. Sin estos enlaces son dos
 * aplicaciones compartiendo dominio; con ellos son un proyecto, que es lo que
 * Rizoma del Sur dice ser: el vivero sostiene el aula y el aula explica lo que
 * el vivero vende.
 *
 * Va aquí y no en el contenido del curso a propósito. Las lecciones tienen que
 * poder leerse en cualquier parte y sin comprar nada; que exista una tienda
 * detrás es una circunstancia de este sitio, no una parte del temario.
 */

/** Slug de categoría de la tienda → lecciones del aula que la explican. */
export const LECCIONES_POR_CATEGORIA: Record<
  string,
  { id: string; titulo: string }[]
> = {
  'cercos-vivos': [
    { id: 'fichas-de-cultivo/08-ornamentales', titulo: 'Ornamentales' },
    { id: 'propagacion-vegetativa/02-esquejes-de-tallo', titulo: 'Esquejes de tallo' },
  ],
  'sombra-palmeras': [
    { id: 'fichas-de-cultivo/09-arboles-de-sombra', titulo: 'Árboles de sombra' },
  ],
  frutales: [
    { id: 'fichas-de-cultivo/10-frutales', titulo: 'Frutales' },
    { id: 'propagacion-vegetativa/06-injerto', titulo: 'Injerto' },
  ],
  'especialidad-caribe': [
    { id: 'fichas-de-cultivo/04-aji-dulce', titulo: 'Ají dulce' },
    { id: 'fichas-de-cultivo/03-culantro', titulo: 'Culantro' },
    { id: 'fichas-de-cultivo/02-yautia', titulo: 'Yautía' },
  ],
};

/** Lo que hay que leer sí o sí antes de plantar cualquier cosa comprada aquí. */
export const PRIMEROS_PASOS = [
  { id: 'semillas-germinacion/06-trasplante-y-endurecimiento', titulo: 'Trasplante y endurecimiento' },
  { id: 'agua-y-riego/02-medir-la-humedad', titulo: 'Cuándo regar de verdad' },
  { id: 'sanidad-vegetal/01-leer-una-planta', titulo: 'Leer una planta enferma' },
];

export const leccionesDe = (slug: string) => LECCIONES_POR_CATEGORIA[slug] ?? [];
