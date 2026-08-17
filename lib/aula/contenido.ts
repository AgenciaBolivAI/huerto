import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  GlosarioSchema,
  MetaLeccionSchema,
  ModuloSchema,
  QuizSchema,
  type LeccionResumen,
  type MetaLeccion,
  type Modulo,
  type ModuloCompleto,
  type Quiz,
  type TerminoGlosario,
  Categoria,
  CategoriaSchema,
} from './tipos';

/* ────────────────────────────────────────────────────────────────────────────
 * Lectura del contenido del curso desde `content/`.
 *
 * `content/` es la fuente de verdad de QUÉ es el curso; la base de datos solo
 * guarda QUÉ hizo el estudiante. La unión entre ambos es el id estable de la
 * lección, "01-fundamentos/01-anatomia-funcional", así que reescribir una
 * lección jamás corrompe el progreso.
 * ──────────────────────────────────────────────────────────────────────────── */

export const RUTA_CONTENIDO = path.join(process.cwd(), 'content');
const RUTA_MODULOS = path.join(RUTA_CONTENIDO, 'modulos');

/**
 * En producción el contenido no cambia entre peticiones, así que se cachea.
 * En desarrollo se lee siempre de disco: editar un .mdx y refrescar el
 * navegador debe bastar para ver el cambio, sin reiniciar el servidor.
 */
const cachear = process.env.NODE_ENV === 'production';
const cache = new Map<string, unknown>();

function memo<T>(clave: string, calcular: () => T): T {
  if (!cachear) return calcular();
  if (!cache.has(clave)) cache.set(clave, calcular());
  return cache.get(clave) as T;
}

function leerJson(ruta: string): unknown {
  const crudo = fs.readFileSync(ruta, 'utf8');
  try {
    return JSON.parse(crudo);
  } catch (e) {
    throw new Error(`JSON inválido en ${path.relative(process.cwd(), ruta)}: ${(e as Error).message}`);
  }
}

/** Valida con zod añadiendo la ruta del archivo al mensaje de error. */
function validar<T>(esquema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { issues: { path: (string | number)[]; message: string }[] } } }, valor: unknown, ruta: string): T {
  const r = esquema.safeParse(valor);
  if (!r.success) {
    const detalle = r.error!.issues
      .map((i) => `  · ${i.path.join('.') || '(raíz)'}: ${i.message}`)
      .join('\n');
    throw new Error(`${path.relative(process.cwd(), ruta)} no cumple el esquema:\n${detalle}`);
  }
  return r.data as T;
}

function directorios(ruta: string): string[] {
  if (!fs.existsSync(ruta)) return [];
  return fs
    .readdirSync(ruta, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();
}

/* ── Módulos ──────────────────────────────────────────────────────────────── */

export function listarIdsModulos(): string[] {
  return directorios(RUTA_MODULOS);
}

export function obtenerModulo(moduloId: string): Modulo | null {
  return memo(`modulo:${moduloId}`, () => {
    const ruta = path.join(RUTA_MODULOS, moduloId, 'modulo.json');
    if (!fs.existsSync(ruta)) return null;
    return validar<Modulo>(ModuloSchema, leerJson(ruta), ruta);
  });
}

/**
 * Ids de las lecciones de un módulo, en el orden declarado en `modulo.json`.
 * Un directorio que exista pero no figure en la lista se añade al final: así
 * una lección recién creada aparece aunque aún no se haya ordenado a mano.
 */
export function listarSlugsLecciones(moduloId: string): string[] {
  const modulo = obtenerModulo(moduloId);
  const enDisco = directorios(path.join(RUTA_MODULOS, moduloId));
  if (!modulo) return enDisco;

  const declaradas = modulo.lecciones.filter((s) => enDisco.includes(s));
  const restantes = enDisco.filter((s) => !declaradas.includes(s));
  return [...declaradas, ...restantes];
}

/* ── Lecciones ────────────────────────────────────────────────────────────── */

/** Id canónico de una lección: "01-fundamentos/01-anatomia-funcional". */
export function idLeccion(moduloId: string, slug: string): string {
  return `${moduloId}/${slug}`;
}

function rutaLeccion(moduloId: string, slug: string): string {
  return path.join(RUTA_MODULOS, moduloId, slug);
}

export function obtenerMeta(moduloId: string, slug: string): MetaLeccion | null {
  return memo(`meta:${moduloId}/${slug}`, () => {
    const ruta = path.join(rutaLeccion(moduloId, slug), 'meta.json');
    if (!fs.existsSync(ruta)) return null;
    return validar<MetaLeccion>(MetaLeccionSchema, leerJson(ruta), ruta);
  });
}

export function obtenerQuiz(moduloId: string, slug: string): Quiz | null {
  return memo(`quiz:${moduloId}/${slug}`, () => {
    const ruta = path.join(rutaLeccion(moduloId, slug), 'quiz.json');
    if (!fs.existsSync(ruta)) return null;
    return validar<Quiz>(QuizSchema, leerJson(ruta), ruta);
  });
}

/**
 * Cuerpo MDX de la lección. El archivo se llama igual que su directorio, para
 * que abrir varias lecciones en el editor no produzca diez pestañas
 * indistinguibles llamadas "index.mdx".
 */
export function obtenerMdx(moduloId: string, slug: string): string | null {
  const ruta = path.join(rutaLeccion(moduloId, slug), `${slug}.mdx`);
  if (!fs.existsSync(ruta)) return null;
  return fs.readFileSync(ruta, 'utf8');
}

export function obtenerLeccion(moduloId: string, slug: string): LeccionResumen | null {
  const meta = obtenerMeta(moduloId, slug);
  if (!meta) return null;
  return {
    id: idLeccion(moduloId, slug),
    moduloId,
    slug,
    meta,
    tieneQuiz: fs.existsSync(path.join(rutaLeccion(moduloId, slug), 'quiz.json')),
  };
}

export function obtenerModuloCompleto(moduloId: string): ModuloCompleto | null {
  const datos = obtenerModulo(moduloId);
  if (!datos) return null;

  const lecciones = listarSlugsLecciones(moduloId)
    .map((slug) => obtenerLeccion(moduloId, slug))
    .filter((l): l is LeccionResumen => l !== null);

  return { id: moduloId, datos, lecciones };
}

/** Curso completo, ordenado por el número declarado en cada `modulo.json`. */
export function obtenerCurso(): ModuloCompleto[] {
  return memo('curso', () =>
    listarIdsModulos()
      .map(obtenerModuloCompleto)
      .filter((m): m is ModuloCompleto => m !== null)
      .sort((a, b) => a.datos.numero - b.datos.numero),
  );
}

/**
 * Los módulos agrupados por categoría, en el orden en que se recorren.
 *
 * La agrupación se hace por la categoría declarada y no por tramos seguidos de
 * `numero`: así el índice sigue saliendo bien aunque un módulo esté todavía
 * numerado fuera de su bloque. Los que no declaran categoría no se pierden —van
 * juntos al final, que es la única forma de que se note que les falta.
 */
export function obtenerCursoPorCategoria(): {
  categoria: Categoria | null;
  modulos: ModuloCompleto[];
}[] {
  return memo('curso:categorias', () => {
    const curso = obtenerCurso();
    const grupos = obtenerCategorias().map((categoria) => ({
      categoria,
      modulos: curso.filter((m) => m.datos.categoria === categoria.clave),
    }));
    const claves = new Set(obtenerCategorias().map((c) => c.clave));
    const sueltos = curso.filter((m) => !m.datos.categoria || !claves.has(m.datos.categoria));
    return [
      ...grupos.filter((g) => g.modulos.length > 0),
      ...(sueltos.length ? [{ categoria: null, modulos: sueltos }] : []),
    ];
  });
}

/** Los bloques del temario, en su orden de recorrido. */
export function obtenerCategorias(): Categoria[] {
  return memo('categorias', () => {
    const ruta = path.join(RUTA_CONTENIDO, 'categorias.json');
    if (!fs.existsSync(ruta)) return [];
    const bruto = leerJson(ruta) as { categorias?: unknown[] };
    return (bruto.categorias ?? []).map((c) => validar<Categoria>(CategoriaSchema, c, ruta));
  });
}

/** Todas las lecciones del curso en orden de estudio. */
export function obtenerTodasLasLecciones(): LeccionResumen[] {
  return obtenerCurso().flatMap((m) => m.lecciones);
}

/** Lección anterior y siguiente en el recorrido global del curso. */
export function obtenerVecinas(leccionId: string): {
  anterior: LeccionResumen | null;
  siguiente: LeccionResumen | null;
} {
  const todas = obtenerTodasLasLecciones();
  const i = todas.findIndex((l) => l.id === leccionId);
  if (i === -1) return { anterior: null, siguiente: null };
  return {
    anterior: i > 0 ? todas[i - 1] : null,
    siguiente: i < todas.length - 1 ? todas[i + 1] : null,
  };
}

/** Busca una lección por su id completo "modulo/slug". */
export function buscarLeccionPorId(leccionId: string): LeccionResumen | null {
  const [moduloId, slug] = leccionId.split('/');
  if (!moduloId || !slug) return null;
  return obtenerLeccion(moduloId, slug);
}

/* ── Glosario ─────────────────────────────────────────────────────────────── */

export function obtenerGlosario(): TerminoGlosario[] {
  return memo('glosario', () => {
    const ruta = path.join(RUTA_CONTENIDO, 'glosario.json');
    if (!fs.existsSync(ruta)) return [];
    return validar<{ terminos: TerminoGlosario[] }>(GlosarioSchema, leerJson(ruta), ruta).terminos;
  });
}

/** Índice slug → término, para que <Termino> resuelva su definición al vuelo. */
export function obtenerIndiceGlosario(): Map<string, TerminoGlosario> {
  return memo('glosario:indice', () => {
    const indice = new Map<string, TerminoGlosario>();
    for (const t of obtenerGlosario()) {
      indice.set(t.slug, t);
      for (const s of t.sinonimos) indice.set(s, t);
    }
    return indice;
  });
}
