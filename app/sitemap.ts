import type { MetadataRoute } from 'next';

import { obtenerCurso } from '@/lib/aula/contenido';
import { SITE } from '@/lib/site';

// Sitemap de rutas públicas. Rutas privadas (/admin, /cuenta, /pedido, /carrito,
// /pedido/confirmacion) se excluyen a propósito.
//
// El aula entra entera —cada módulo y cada lección— y no solo su portada. Son
// más de trescientas páginas de material gratuito, y el proyecto existe para que
// la gente lo encuentre: dejarlas fuera del sitemap era regalar el trabajo y
// esconderlo a la vez. Una lección suelta es además la puerta de entrada más
// probable desde un buscador, porque quien busca no busca «aula»: busca «por qué
// se me pudre el plantín» o «cómo se calcula la caída de tensión».
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const fijas: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/tienda', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/aula', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/aula/modulos', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/aula/glosario', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/aula/herramientas', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/visitanos', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/laboratorio-vivo', priority: 0.6, changeFrequency: 'monthly' },
  ];

  const curso = obtenerCurso();

  // Los primeros módulos son la puerta de entrada al recorrido, así que pesan
  // algo más; las lecciones van todas igual, porque cuál es la más buscada lo
  // decide el lector y no nosotros.
  const modulos = curso.map((m) => ({
    url: `${SITE.url}/aula/modulos/${m.id}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: m.datos.numero <= 10 ? 0.7 : 0.6,
  }));

  const lecciones = curso.flatMap((m) =>
    m.lecciones.map((l) => ({
      url: `${SITE.url}/aula/modulos/${l.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  );

  return [
    ...fijas.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE.url}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    ...modulos,
    ...lecciones,
  ];
}
