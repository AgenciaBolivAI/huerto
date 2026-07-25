import 'server-only';

import { hoyLocal, obtenerSupabase, restarDias } from './supabase';
import type {
  EstadoLeccion,
  ProgresoLeccion,
  Racha,
  ResumenProgresoModulo,
} from './tipos';

/* ────────────────────────────────────────────────────────────────────────────
 * Consultas y escrituras de progreso. Todo lo que la interfaz necesita saber
 * sobre "qué ha hecho el estudiante" pasa por aquí.
 *
 * Las operaciones que requieren incrementos sobre el valor actual, un CASE
 * dentro del upsert o atomicidad entre varias tablas están implementadas como
 * funciones en Postgres y se invocan con .rpc(); el resto son consultas
 * directas. Ver la migración `curso_huerto_class_funciones`.
 *
 * Sin credenciales, las lecturas devuelven valores vacíos y las escrituras no
 * hacen nada: el curso se sigue leyendo entero desde los MDX en disco.
 * ──────────────────────────────────────────────────────────────────────────── */

interface FilaProgreso {
  leccion_id: string;
  modulo_id: string;
  estado: EstadoLeccion;
  primera_visita: string | null;
  ultima_visita: string | null;
  completada_en: string | null;
  segundos_estudio: number;
  scroll_pct: number;
}

function aProgreso(f: FilaProgreso): ProgresoLeccion {
  return {
    leccionId: f.leccion_id,
    moduloId: f.modulo_id,
    estado: f.estado,
    primeraVisita: f.primera_visita,
    ultimaVisita: f.ultima_visita,
    completadaEn: f.completada_en,
    segundosEstudio: f.segundos_estudio,
    scrollPct: f.scroll_pct,
  };
}

/**
 * Un fallo de red no debe tumbar la lección: se registra y se sigue con el
 * valor por defecto. Leer el curso importa más que mostrar el progreso.
 */
function alFallar(operacion: string, error: unknown): void {
  console.error(`[huerto-class] Falló ${operacion}:`, error);
}

/* ── Lecturas ─────────────────────────────────────────────────────────────── */

export async function obtenerTodoElProgreso(): Promise<Map<string, ProgresoLeccion>> {
  const db = obtenerSupabase();
  if (!db) return new Map();

  const { data, error } = await db.from('curso_progreso_leccion').select('*');
  if (error) {
    alFallar('obtenerTodoElProgreso', error);
    return new Map();
  }
  return new Map((data as FilaProgreso[]).map((f) => [f.leccion_id, aProgreso(f)]));
}

export async function obtenerProgresoLeccion(leccionId: string): Promise<ProgresoLeccion | null> {
  const db = obtenerSupabase();
  if (!db) return null;

  const { data, error } = await db
    .from('curso_progreso_leccion')
    .select('*')
    .eq('leccion_id', leccionId)
    .maybeSingle();

  if (error) {
    alFallar('obtenerProgresoLeccion', error);
    return null;
  }
  return data ? aProgreso(data as FilaProgreso) : null;
}

export function resumirModulo(
  moduloId: string,
  leccionIds: string[],
  progreso: Map<string, ProgresoLeccion>,
): ResumenProgresoModulo {
  let completadas = 0;
  let enCurso = 0;

  for (const id of leccionIds) {
    const estado = progreso.get(id)?.estado ?? 'no_iniciada';
    if (estado === 'completada') completadas++;
    else if (estado === 'en_curso') enCurso++;
  }

  const total = leccionIds.length;
  return {
    moduloId,
    total,
    completadas,
    enCurso,
    porcentaje: total === 0 ? 0 : Math.round((completadas / total) * 100),
  };
}

/* ── Escrituras de progreso ───────────────────────────────────────────────── */

export async function registrarVisita(leccionId: string, moduloId: string): Promise<void> {
  const db = obtenerSupabase();
  if (!db) return;

  const { error } = await db.rpc('curso_registrar_visita', {
    p_leccion: leccionId,
    p_modulo: moduloId,
  });
  if (error) alFallar('registrarVisita', error);
}

/** Marca o desmarca una lección. Devuelve el estado resultante. */
export async function alternarCompletada(
  leccionId: string,
  moduloId: string,
): Promise<EstadoLeccion> {
  const db = obtenerSupabase();
  if (!db) return 'no_iniciada';

  const { data, error } = await db.rpc('curso_alternar_completada', {
    p_leccion: leccionId,
    p_modulo: moduloId,
  });
  if (error) {
    alFallar('alternarCompletada', error);
    return 'no_iniciada';
  }
  return data as EstadoLeccion;
}

export async function guardarScroll(leccionId: string, pct: number): Promise<void> {
  const db = obtenerSupabase();
  if (!db) return;

  const acotado = Math.max(0, Math.min(100, Math.round(pct)));
  const { error } = await db
    .from('curso_progreso_leccion')
    .update({ scroll_pct: acotado })
    .eq('leccion_id', leccionId);
  if (error) alFallar('guardarScroll', error);
}

export async function acumularTiempo(leccionId: string, segundos: number): Promise<void> {
  if (segundos <= 0) return;
  const db = obtenerSupabase();
  if (!db) return;

  const { error } = await db.rpc('curso_acumular_tiempo', {
    p_leccion: leccionId,
    p_segundos: Math.round(segundos),
  });
  if (error) alFallar('acumularTiempo', error);
}

/* ── Racha de estudio ─────────────────────────────────────────────────────── */

/**
 * La racha se calcula, no se almacena como contador: así no puede
 * desincronizarse. Cuenta días consecutivos con actividad terminando en hoy
 * (o en ayer, para no romper la racha de quien todavía no ha estudiado hoy).
 */
export async function obtenerRacha(): Promise<Racha> {
  const vacia: Racha = { actual: 0, maxima: 0, diasActivos: [], estudiadoHoy: false };

  const db = obtenerSupabase();
  if (!db) return vacia;

  const { data, error } = await db
    .from('curso_dia_estudio')
    .select('fecha, minutos, lecciones_completadas')
    .order('fecha', { ascending: false });

  if (error) {
    alFallar('obtenerRacha', error);
    return vacia;
  }

  const filas = data as { fecha: string; minutos: number; lecciones_completadas: number }[];
  const diasActivos = filas
    .filter((f) => f.minutos > 0 || f.lecciones_completadas > 0)
    .map((f) => f.fecha);

  const activos = new Set(diasActivos);
  const hoy = hoyLocal();
  const ayer = restarDias(hoy, 1);

  let actual = 0;
  let cursor: string | null = activos.has(hoy) ? hoy : activos.has(ayer) ? ayer : null;
  while (cursor && activos.has(cursor)) {
    actual++;
    cursor = restarDias(cursor, 1);
  }

  let maxima = 0;
  let corrida = 0;
  let anterior: string | null = null;
  for (const fecha of [...diasActivos].sort()) {
    corrida = anterior && restarDias(fecha, 1) === anterior ? corrida + 1 : 1;
    anterior = fecha;
    if (corrida > maxima) maxima = corrida;
  }

  return { actual, maxima: Math.max(maxima, actual), diasActivos, estudiadoHoy: activos.has(hoy) };
}

/* ── Ajustes (clave-valor) ────────────────────────────────────────────────── */

export async function obtenerAjuste(clave: string): Promise<string | null> {
  const db = obtenerSupabase();
  if (!db) return null;

  const { data, error } = await db
    .from('curso_ajuste')
    .select('valor')
    .eq('clave', clave)
    .maybeSingle();

  if (error) {
    alFallar('obtenerAjuste', error);
    return null;
  }
  return (data as { valor: string } | null)?.valor ?? null;
}

export async function establecerAjuste(clave: string, valor: string): Promise<void> {
  const db = obtenerSupabase();
  if (!db) return;

  const { error } = await db.from('curso_ajuste').upsert({ clave, valor }, { onConflict: 'clave' });
  if (error) alFallar('establecerAjuste', error);
}

/* ── Notas ────────────────────────────────────────────────────────────────── */

export async function obtenerNota(leccionId: string): Promise<string> {
  const db = obtenerSupabase();
  if (!db) return '';

  const { data, error } = await db
    .from('curso_nota')
    .select('contenido')
    .eq('leccion_id', leccionId)
    .maybeSingle();

  if (error) {
    alFallar('obtenerNota', error);
    return '';
  }
  return (data as { contenido: string } | null)?.contenido ?? '';
}

export async function guardarNota(leccionId: string, contenido: string): Promise<void> {
  const db = obtenerSupabase();
  if (!db) return;

  const { error } = await db.from('curso_nota').upsert(
    { leccion_id: leccionId, contenido, actualizada_en: new Date().toISOString() },
    { onConflict: 'leccion_id' },
  );
  if (error) alFallar('guardarNota', error);
}

export async function obtenerTodasLasNotas(): Promise<
  { leccionId: string; contenido: string; actualizadaEn: string }[]
> {
  const db = obtenerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('curso_nota')
    .select('leccion_id, contenido, actualizada_en')
    .order('leccion_id');

  if (error) {
    alFallar('obtenerTodasLasNotas', error);
    return [];
  }
  return (data as { leccion_id: string; contenido: string; actualizada_en: string }[])
    .filter((f) => f.contenido.trim() !== '')
    .map((f) => ({
      leccionId: f.leccion_id,
      contenido: f.contenido,
      actualizadaEn: f.actualizada_en,
    }));
}

/* ── Quiz ─────────────────────────────────────────────────────────────────── */

export interface RespuestaRegistrada {
  preguntaId: string;
  tipo: 'opcion_multiple' | 'verdadero_falso' | 'abierta';
  respuesta: string;
  correcta: boolean | null;
  autoevaluacion: string | null;
}

export interface IntentoResumen {
  id: number;
  leccionId: string;
  iniciadoEn: string;
  totalPreguntas: number;
  correctas: number | null;
  puntaje: number | null;
}

/**
 * Guarda un intento completo en una sola transacción. Nunca sobrescribe
 * intentos anteriores: el histórico es lo que permite ver si se progresa entre
 * repasos. El puntaje solo considera las preguntas auto-calificables.
 */
export async function registrarIntento(
  leccionId: string,
  respuestas: RespuestaRegistrada[],
): Promise<number | null> {
  const db = obtenerSupabase();
  if (!db) return null;

  const { data, error } = await db.rpc('curso_registrar_intento', {
    p_leccion: leccionId,
    p_respuestas: respuestas,
  });
  if (error) {
    alFallar('registrarIntento', error);
    return null;
  }
  return Number(data);
}

export async function autoevaluar(
  intentoId: number,
  preguntaId: string,
  valor: 'logrado' | 'parcial' | 'no_logrado',
): Promise<void> {
  const db = obtenerSupabase();
  if (!db) return;

  const { error } = await db
    .from('curso_respuesta_quiz')
    .update({ autoevaluacion: valor })
    .eq('intento_id', intentoId)
    .eq('pregunta_id', preguntaId);
  if (error) alFallar('autoevaluar', error);
}

export async function obtenerIntentos(leccionId: string): Promise<IntentoResumen[]> {
  const db = obtenerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('curso_intento_quiz')
    .select('id, leccion_id, iniciado_en, total_preguntas, correctas, puntaje')
    .eq('leccion_id', leccionId)
    .order('iniciado_en', { ascending: false })
    .order('id', { ascending: false });

  if (error) {
    alFallar('obtenerIntentos', error);
    return [];
  }
  return (
    data as {
      id: number;
      leccion_id: string;
      iniciado_en: string;
      total_preguntas: number;
      correctas: number | null;
      puntaje: number | null;
    }[]
  ).map((f) => ({
    id: f.id,
    leccionId: f.leccion_id,
    iniciadoEn: f.iniciado_en,
    totalPreguntas: f.total_preguntas,
    correctas: f.correctas,
    puntaje: f.puntaje,
  }));
}
