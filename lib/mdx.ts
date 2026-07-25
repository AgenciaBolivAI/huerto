import 'server-only';

import GithubSlugger from 'github-slugger';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { createElement, type ReactNode } from 'react';

import {
  Advertencia,
  Analogia,
  AplicarRizoma,
  ContextoBolivia,
  Dato,
  Figura,
  Formula,
  Tabla,
} from '@/components/mdx/bloques';
import { Diagrama, Ilustracion } from '@/components/mdx/imagen';
import { AvisoVideoPendiente, ReproductorVideo, VideoNoEncontrado } from '@/components/mdx/video';
import { Termino } from '@/components/mdx/termino';
import { buscarLeccionPorId, obtenerIndiceGlosario } from './contenido';
import { extraerIdYouTube, type Video } from './tipos';

/**
 * Compila el MDX de una lección con los componentes del curso.
 *
 * Los videos NO se escriben en el MDX: allí solo se referencia el id de
 * YouTube, y los metadatos (título, canal, duración) salen del `meta.json`
 * que ya pasó por el verificador. Así el cuerpo de la lección nunca contiene
 * un título ni un canal tecleados a mano, que es justo donde se colaría un
 * dato inventado.
 */
export async function renderizarLeccion(
  fuente: string,
  videos: Video[],
  leccionId: string,
): Promise<ReactNode> {
  // Las imágenes se referencian en el MDX solo por nombre de archivo; la ruta
  // completa se construye aquí a partir de la lección, para que mover o
  // renombrar una lección no obligue a tocar el cuerpo del texto.
  const rutaImagen = (src: string) =>
    src.startsWith('/') ? src : `/imagenes/${leccionId}/${src}`;

  const porId = new Map<string, Video>();
  for (const v of videos) {
    const id = extraerIdYouTube(v.url);
    if (id) porId.set(id, v);
  }

  const glosario = obtenerIndiceGlosario();

  const componentes = {
    // Bloques destacados
    AplicarRizoma,
    ContextoBolivia,
    Analogia,
    Dato,
    Advertencia,
    Figura,
    Formula,
    Tabla,
    AvisoVideoPendiente,

    /** `<Diagrama src="zonas-raiz.png" alt="…" pie="…" />` */
    Diagrama: ({ src, alt, pie }: { src: string; alt: string; pie?: string }) =>
      createElement(Diagrama, { src: rutaImagen(src), alt, pie }),

    /** `<Ilustracion src="…" alt="…" pie="…" ancho="amplio" />` */
    Ilustracion: ({
      src,
      alt,
      pie,
      ancho,
    }: {
      src: string;
      alt: string;
      pie?: string;
      ancho?: 'normal' | 'amplio';
    }) => createElement(Ilustracion, { src: rutaImagen(src), alt, pie, ancho }),

    /** `<Video id="gNS9Im61baQ" />` — se resuelve contra meta.json. */
    Video: ({ id }: { id: string }) => {
      const video = porId.get(id);
      if (!video) return createElement(VideoNoEncontrado, { id });
      return createElement(ReproductorVideo, { video });
    },

    /** `<Termino slug="rizoma">rizoma</Termino>` — resuelve contra el glosario. */
    Termino: ({ slug, children }: { slug: string; children: ReactNode }) => {
      const entrada = glosario.get(slug);
      const leccion = entrada?.leccion ? buscarLeccionPorId(entrada.leccion) : null;
      return createElement(Termino, {
        definicion: entrada?.definicion ?? null,
        leccion: entrada?.leccion,
        tituloLeccion: leccion?.meta.titulo,
        children,
      });
    },

    // Las tablas de markdown (GFM) necesitan su envoltura con desbordamiento
    // propio; envolver <table> aquí evita tener que escribir <Tabla> a mano
    // alrededor de cada una en el MDX.
    table: ({ children }: { children?: ReactNode }) =>
      createElement('div', { className: 'tabla-envoltura' }, createElement('table', null, children)),
  };

  const { content } = await compileMDX({
    source: fuente,
    components: componentes,
    options: {
      parseFrontmatter: false, // los metadatos viven en meta.json, no en el MDX
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // Da un id a cada encabezado para que el índice lateral pueda saltar a él.
        rehypePlugins: [rehypeSlug],
      },
    },
  });

  return content;
}

/**
 * Extrae los encabezados de nivel 2 para construir el índice lateral.
 *
 * Se hace con una pasada sobre la fuente en vez de sobre el árbol MDX: basta
 * para un índice y evita compilar dos veces. Los ids se generan con el mismo
 * GithubSlugger que usa rehype-slug, incluida su forma de desambiguar
 * títulos repetidos (`-1`, `-2`), de modo que los saltos siempre aciertan.
 */
export function extraerSecciones(fuente: string): { id: string; titulo: string }[] {
  const slugger = new GithubSlugger();
  const secciones: { id: string; titulo: string }[] = [];
  let dentroDeBloqueCodigo = false;

  for (const linea of fuente.split('\n')) {
    if (/^\s*```/.test(linea)) {
      dentroDeBloqueCodigo = !dentroDeBloqueCodigo;
      continue;
    }
    if (dentroDeBloqueCodigo) continue;

    const m = linea.match(/^##\s+(.+?)\s*$/);
    if (m) {
      // Se limpia el énfasis y el código en línea para que el texto del índice
      // coincida con lo que rehype-slug ve tras renderizar el encabezado.
      const titulo = m[1]
        .replace(/\*\*/g, '')
        .replace(/`/g, '')
        .trim();
      secciones.push({ id: slugger.slug(titulo), titulo });
    }
  }
  return secciones;
}
