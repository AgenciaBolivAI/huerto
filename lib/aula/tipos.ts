import { z } from 'zod';

// La regla que decide si una URL es un video de YouTube válido vive en un solo
// sitio, compartida con los scripts de verificación. Ver lib/youtube.mjs.
import { extraerIdYouTube, formatearDuracion } from './youtube.mjs';

export { extraerIdYouTube, formatearDuracion };

/* ────────────────────────────────────────────────────────────────────────────
 * Contenido del curso: contratos de los archivos JSON que viven en content/.
 * Todo lo que se lee de disco pasa por aquí antes de llegar a un componente,
 * de forma que un JSON mal escrito falla con un mensaje claro y no con un
 * `undefined` a mitad del renderizado.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Un video de YouTube ya curado.
 *
 * `titulo`, `canal` y `duracion` NO se escriben a mano: los rellena
 * `scripts/verificar-videos.mjs` leyéndolos de la propia YouTube (oEmbed +
 * página del video). Eso es lo que hace imposible publicar un enlace inventado.
 * A mano solo se aportan `url`, `idioma` y `porQue`.
 */
export const VideoSchema = z.object({
  titulo: z.string().min(1),
  canal: z.string().min(1),
  url: z
    .string()
    .url()
    .refine((u) => extraerIdYouTube(u) !== null, {
      message: 'La URL debe ser un video de YouTube del que se pueda extraer un ID de 11 caracteres',
    }),
  idioma: z.enum(['es', 'en', 'pt']),
  duracion: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/, 'Formato esperado mm:ss o h:mm:ss'),
  porQue: z.string().min(10, 'Explica qué aporta este video a esta lección concreta'),
  verificado: z.boolean(),
});
export type Video = z.infer<typeof VideoSchema>;

export const ReferenciaSchema = z.object({
  titulo: z.string().min(1),
  fuente: z.string().min(1),
  url: z.string().url().optional(),
  nota: z.string().optional(),
});
export type Referencia = z.infer<typeof ReferenciaSchema>;

/** `meta.json`: el archivo hermano de cada lección. */
export const MetaLeccionSchema = z.object({
  titulo: z.string().min(1),
  subtitulo: z.string().optional(),
  duracionMin: z.number().int().positive(),
  objetivos: z.array(z.string().min(1)).min(1, 'Toda lección declara sus objetivos de aprendizaje'),
  /**
   * Imagen de portada, relativa a `public/imagenes/{modulo}/{leccion}/`.
   * Es decorativa: si falta, la lección se muestra sin ella.
   */
  portada: z.string().optional(),
  portadaAlt: z.string().optional(),
  /** Slugs completos, p. ej. "01-fundamentos/01-anatomia-funcional". */
  prerrequisitos: z.array(z.string()).default([]),
  videos: z.array(VideoSchema).default([]),
  referencias: z.array(ReferenciaSchema).default([]),
  /** Términos que ESTA lección define por primera vez (alimentan el glosario). */
  terminos: z.array(z.string()).default([]),
  /**
   * Una lección práctica está obligada a llevar los bloques APLICAR A RIZOMA
   * DEL SUR y CONTEXTO BOLIVIA. Las puramente teóricas pueden eximirse
   * marcando esto como false, y el validador deja de exigirlos.
   */
  practica: z.boolean().default(true),
});
export type MetaLeccion = z.infer<typeof MetaLeccionSchema>;

/** `modulo.json`: la portada de cada módulo. */
export const ModuloSchema = z.object({
  numero: z.number().int().positive(),
  titulo: z.string().min(1),
  resumen: z.string().min(1),
  /**
   * Foto de portada del módulo, **relativa a `public/imagenes/`** — no a la
   * carpeta del módulo. Se declara así a propósito para poder reutilizar la
   * portada de una de sus lecciones (`08-albanileria-y-obra/03-replanteo/portada.webp`)
   * sin duplicar el archivo ni volver a registrar su procedencia.
   * Es decorativa: si falta, el módulo se muestra sin ella.
   */
  portada: z.string().optional(),
  portadaAlt: z.string().optional(),
  /**
   * Clave de la categoría a la que pertenece, de `content/categorias.json`.
   * La categoría agrupa el temario en bloques con sentido; el orden dentro de
   * cada bloque lo sigue fijando `numero`.
   */
  categoria: z.string().optional(),
  /** Orden explícito de las lecciones; los directorios que no figuren van al final. */
  lecciones: z.array(z.string()).default([]),
});

/** `content/categorias.json`: los bloques del temario, en orden de recorrido. */
export const CategoriaSchema = z.object({
  clave: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
});
export type Categoria = z.infer<typeof CategoriaSchema>;
export type Modulo = z.infer<typeof ModuloSchema>;

/* ── Quiz ─────────────────────────────────────────────────────────────────── */

const PreguntaBase = {
  id: z.string().min(1),
  enunciado: z.string().min(1),
  explicacion: z.string().min(1, 'Explica por qué la respuesta es la que es'),
};

export const PreguntaOpcionSchema = z.object({
  ...PreguntaBase,
  tipo: z.literal('opcion_multiple'),
  opciones: z.array(z.string().min(1)).min(2),
  /** Índices correctos. Más de uno = pregunta de selección múltiple. */
  correctas: z.array(z.number().int().nonnegative()).min(1),
});

export const PreguntaVFSchema = z.object({
  ...PreguntaBase,
  tipo: z.literal('verdadero_falso'),
  respuesta: z.boolean(),
});

export const PreguntaAbiertaSchema = z.object({
  ...PreguntaBase,
  tipo: z.literal('abierta'),
  respuestaModelo: z.string().min(1),
  /** Puntos que la respuesta debería tocar; guían la autoevaluación. */
  criterios: z.array(z.string().min(1)).min(1),
});

export const PreguntaSchema = z.discriminatedUnion('tipo', [
  PreguntaOpcionSchema,
  PreguntaVFSchema,
  PreguntaAbiertaSchema,
]);
export type Pregunta = z.infer<typeof PreguntaSchema>;
export type PreguntaOpcion = z.infer<typeof PreguntaOpcionSchema>;
export type PreguntaVF = z.infer<typeof PreguntaVFSchema>;
export type PreguntaAbierta = z.infer<typeof PreguntaAbiertaSchema>;

export const QuizSchema = z.object({
  preguntas: z
    .array(PreguntaSchema)
    .min(4, 'Mínimo 4 preguntas')
    .max(8, 'Máximo 8 preguntas')
    .refine((ps) => ps.some((p) => p.tipo === 'abierta'), {
      message: 'Al menos una pregunta debe ser abierta con autoevaluación',
    })
    .refine((ps) => new Set(ps.map((p) => p.id)).size === ps.length, {
      message: 'Los id de pregunta deben ser únicos dentro del quiz',
    }),
});
export type Quiz = z.infer<typeof QuizSchema>;

/** Glosario global: `content/glosario.json`. */
export const TerminoGlosarioSchema = z.object({
  termino: z.string().min(1),
  slug: z.string().min(1),
  definicion: z.string().min(1),
  /** Lección donde se explica a fondo, p. ej. "01-fundamentos/01-anatomia-funcional". */
  leccion: z.string().optional(),
  sinonimos: z.array(z.string()).default([]),
});
export type TerminoGlosario = z.infer<typeof TerminoGlosarioSchema>;

export const GlosarioSchema = z.object({
  terminos: z.array(TerminoGlosarioSchema),
});

/* ── Tipos compuestos que consume la interfaz ─────────────────────────────── */

export type EstadoLeccion = 'no_iniciada' | 'en_curso' | 'completada';

export interface LeccionResumen {
  /** "01-fundamentos/01-anatomia-funcional" */
  id: string;
  moduloId: string;
  slug: string;
  meta: MetaLeccion;
  /** Se rellena solo si existe quiz.json. */
  tieneQuiz: boolean;
}

export interface ModuloCompleto {
  id: string;
  datos: Modulo;
  lecciones: LeccionResumen[];
}

export interface ProgresoLeccion {
  leccionId: string;
  moduloId: string;
  estado: EstadoLeccion;
  primeraVisita: string | null;
  ultimaVisita: string | null;
  completadaEn: string | null;
  segundosEstudio: number;
  scrollPct: number;
}

export interface ResumenProgresoModulo {
  moduloId: string;
  total: number;
  completadas: number;
  enCurso: number;
  porcentaje: number;
}

export interface Racha {
  actual: number;
  maxima: number;
  /** Fechas 'YYYY-MM-DD' con actividad, para pintar el calendario. */
  diasActivos: string[];
  estudiadoHoy: boolean;
}

