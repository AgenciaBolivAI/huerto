'use server';

import { revalidatePath } from 'next/cache';

import {
  acumularTiempo,
  alternarCompletada,
  autoevaluar,
  establecerAjuste,
  guardarNota,
  guardarScroll,
  registrarIntento,
  registrarVisita,
  type RespuestaRegistrada,
} from './progreso';

/* ────────────────────────────────────────────────────────────────────────────
 * Server Actions: el único camino por el que el navegador escribe en la base
 * de datos. Se prefieren a rutas API porque el curso no tiene autenticación ni
 * clientes externos, y así el contrato no se duplica en dos sitios.
 *
 * Importante: la service_role key solo existe dentro de estas funciones, que
 * corren en el servidor. Nunca viaja al navegador.
 * ──────────────────────────────────────────────────────────────────────────── */

export async function accionRegistrarVisita(leccionId: string, moduloId: string) {
  await registrarVisita(leccionId, moduloId);
}

export async function accionAlternarCompletada(leccionId: string, moduloId: string) {
  const estado = await alternarCompletada(leccionId, moduloId);
  // El estado se muestra en el panel, en el índice del módulo y en la lección;
  // se revalida la raíz para que los tres queden coherentes.
  revalidatePath('/', 'layout');
  return estado;
}

export async function accionGuardarNota(leccionId: string, contenido: string) {
  await guardarNota(leccionId, contenido);
}

export async function accionGuardarScroll(leccionId: string, pct: number) {
  await guardarScroll(leccionId, pct);
}

export async function accionAcumularTiempo(leccionId: string, segundos: number) {
  await acumularTiempo(leccionId, segundos);
}

export async function accionRegistrarIntento(
  leccionId: string,
  respuestas: RespuestaRegistrada[],
) {
  const id = await registrarIntento(leccionId, respuestas);
  revalidatePath('/', 'layout');
  return id;
}

export async function accionAutoevaluar(
  intentoId: number,
  preguntaId: string,
  valor: 'logrado' | 'parcial' | 'no_logrado',
) {
  await autoevaluar(intentoId, preguntaId, valor);
}

export async function accionGuardarTema(tema: 'claro' | 'oscuro') {
  await establecerAjuste('tema', tema);
}
