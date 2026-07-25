import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Acceso a la base de datos. Nada más en la aplicación habla con Supabase.
 *
 * Se usa la **service_role key**, nunca la anónima, y solo desde el servidor:
 * ni Server Components ni Server Actions envían esta clave al navegador. Las
 * tablas `curso_*` tienen RLS activo y sin políticas, de modo que aunque la
 * clave anónima del proyecto sea pública —lo es, va en el bundle de
 * rizomadelsur.com—, nadie puede leer ni escribir el progreso del curso
 * atacando directamente la API REST. El único camino es pasar por esta app.
 *
 * El curso no tiene autenticación por decisión explícita: el progreso es único
 * y compartido por cualquiera que abra el enlace del despliegue.
 */

const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_SERVICIO = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cliente: SupabaseClient | null = null;
let yaAvisado = false;

/** ¿Hay credenciales para hablar con la base de datos? */
export function hayBaseDeDatos(): boolean {
  return Boolean(URL_SUPABASE && CLAVE_SERVICIO);
}

/**
 * Si falta la configuración, se avisa una sola vez y la aplicación sigue
 * funcionando en modo lectura: el contenido del curso vive en archivos MDX en
 * disco, así que las lecciones se leen enteras sin conexión. Lo único que se
 * pierde es guardar progreso, notas y quizzes.
 */
function avisarUnaVez(): void {
  if (yaAvisado) return;
  yaAvisado = true;
  console.warn(
    '\n[huerto-class] Sin credenciales de Supabase: el curso se puede leer, pero no se ' +
      'guardará progreso, notas ni quizzes.\n' +
      '               Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local\n',
  );
}

export function obtenerSupabase(): SupabaseClient | null {
  if (!hayBaseDeDatos()) {
    avisarUnaVez();
    return null;
  }
  if (cliente) return cliente;

  cliente = createClient(URL_SUPABASE!, CLAVE_SERVICIO!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'huerto-class' } },
  });
  return cliente;
}

/**
 * Fecha de hoy en Santa Cruz, formato 'YYYY-MM-DD'.
 *
 * Deliberadamente NO se usa la fecha del servidor: en Vercel el proceso corre
 * en UTC y, con Bolivia en UTC−4, todo lo estudiado después de las 20:00
 * contaría como del día siguiente y rompería la racha. El locale 'sv-SE'
 * produce exactamente el formato ISO que necesitamos.
 */
export function hoyLocal(fecha = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/La_Paz' }).format(fecha);
}

/** Resta días a una fecha 'YYYY-MM-DD' sin salir del calendario local. */
export function restarDias(fechaISO: string, dias: number): string {
  const [y, m, d] = fechaISO.split('-').map(Number);
  // Mediodía en vez de medianoche: evita que un cambio de huso desplace el día.
  const f = new Date(Date.UTC(y, m - 1, d, 12));
  f.setUTCDate(f.getUTCDate() - dias);
  return f.toISOString().slice(0, 10);
}
