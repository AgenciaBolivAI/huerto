#!/usr/bin/env node
/**
 * Quita el prefijo numérico del nombre de los directorios de módulo.
 *
 *   content/modulos/26-seguridad-y-salud  →  content/modulos/seguridad-y-salud
 *
 * Por qué: el orden de los módulos lo fija `datos.numero`, pero el nombre del
 * directorio llevaba además un número propio. Mientras existan los dos, cada
 * reordenado los deja en desacuerdo —tras el último, `26-seguridad-y-salud`
 * pasó a ser el módulo 2— y el nombre miente. Renumerar los directorios no
 * arregla nada: los volvería a acoplar y el siguiente reordenado repetiría el
 * problema, esta vez arrastrando identificadores de lección, rutas de imagen y
 * el progreso guardado.
 *
 * Quitarlo de raíz convierte el directorio en un identificador estable. A
 * partir de aquí, reordenar el curso cuesta exactamente un campo.
 *
 *   node scripts/quitar-prefijos.mjs [--simulacro]
 *
 * Toca, además de los directorios:
 *   · `prerrequisitos` de cada meta.json          (módulo/lección)
 *   · claves de content/imagenes.json             (módulo/lección/archivo)
 *   · `leccion` de cada término del glosario
 *   · `portada` de cada modulo.json
 *   · public/imagenes/<módulo>
 *
 * Lo que NO toca y hay que hacer aparte: las filas de Supabase que guardan
 * `leccion_id`. Se avisa al final con las que habría que migrar.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const RAIZ = process.cwd();
const DIR_MODULOS = path.join(RAIZ, 'content/modulos');
const DIR_IMAGENES = path.join(RAIZ, 'public/imagenes');

const simulacro = process.argv.includes('--simulacro');

const c = {
  gris: (s) => `\x1b[90m${s}\x1b[0m`,
  verde: (s) => `\x1b[32m${s}\x1b[0m`,
  ambar: (s) => `\x1b[33m${s}\x1b[0m`,
  rojo: (s) => `\x1b[31m${s}\x1b[0m`,
  fuerte: (s) => `\x1b[1m${s}\x1b[0m`,
};
const abortar = (m) => {
  console.error(`\n${c.rojo('✗')} ${m}\n`);
  process.exit(1);
};

/* ── Qué se renombra ────────────────────────────────────────────────────── */

const modulos = fs
  .readdirSync(DIR_MODULOS)
  .filter((d) => fs.existsSync(path.join(DIR_MODULOS, d, 'modulo.json')));

const renombra = new Map(); // viejo -> nuevo
for (const d of modulos) {
  const limpio = d.replace(/^\d+[-_]/, '');
  if (limpio !== d) renombra.set(d, limpio);
}

if (renombra.size === 0) {
  console.log(`\n${c.verde('✓')} Ningún directorio de módulo lleva prefijo numérico.\n`);
  process.exit(0);
}

/* Dos módulos distintos no pueden acabar llamándose igual. */
const destinos = new Map();
for (const [viejo, nuevo] of renombra) {
  if (destinos.has(nuevo)) abortar(`"${viejo}" y "${destinos.get(nuevo)}" quedarían ambos como "${nuevo}".`);
  destinos.set(nuevo, viejo);
  if (!renombra.has(nuevo) && modulos.includes(nuevo))
    abortar(`"${viejo}" quedaría como "${nuevo}", que ya existe.`);
}

console.log(`\n${c.fuerte('Quitar el prefijo numérico de los módulos')}`);
console.log(`  ${renombra.size} de ${modulos.length} directorios`);
if (simulacro) console.log(`  ${c.ambar('simulacro: no se escribe nada')}`);

/** Cambia el módulo al principio de una ruta "modulo/…". */
function reescribirRuta(ruta) {
  if (typeof ruta !== 'string') return ruta;
  const i = ruta.indexOf('/');
  if (i < 0) return renombra.get(ruta) ?? ruta;
  const cabeza = ruta.slice(0, i);
  const nuevo = renombra.get(cabeza);
  return nuevo ? nuevo + ruta.slice(i) : ruta;
}

const cambios = { prerrequisitos: 0, imagenes: 0, glosario: 0, portadas: 0 };

/* ── JSON que guardan rutas ─────────────────────────────────────────────── */

const escribir = (p, obj) => {
  if (!simulacro) fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
};

for (const d of modulos) {
  const dirMod = path.join(DIR_MODULOS, d);

  const pMod = path.join(dirMod, 'modulo.json');
  const mod = JSON.parse(fs.readFileSync(pMod, 'utf8'));
  if (mod.portada && reescribirRuta(mod.portada) !== mod.portada) {
    mod.portada = reescribirRuta(mod.portada);
    cambios.portadas += 1;
    escribir(pMod, mod);
  }

  for (const lec of fs.readdirSync(dirMod)) {
    const pMeta = path.join(dirMod, lec, 'meta.json');
    if (!fs.existsSync(pMeta)) continue;
    const meta = JSON.parse(fs.readFileSync(pMeta, 'utf8'));
    const antes = JSON.stringify(meta.prerrequisitos ?? []);
    meta.prerrequisitos = (meta.prerrequisitos ?? []).map(reescribirRuta);
    if (JSON.stringify(meta.prerrequisitos) !== antes) {
      cambios.prerrequisitos += 1;
      escribir(pMeta, meta);
    }
  }
}

const pImgs = path.join(RAIZ, 'content/imagenes.json');
if (fs.existsSync(pImgs)) {
  const reg = JSON.parse(fs.readFileSync(pImgs, 'utf8'));
  const mapear = (obj) => {
    const salida = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === '_descartadas') continue;
      const nk = reescribirRuta(k);
      if (nk !== k) cambios.imagenes += 1;
      salida[nk] = v;
    }
    return salida;
  };
  const descartadas = reg.imagenes._descartadas;
  reg.imagenes = mapear(reg.imagenes);
  // El apéndice va siempre al final y con las claves también reescritas.
  if (descartadas) reg.imagenes._descartadas = mapear(descartadas);
  escribir(pImgs, reg);
}

const pGlo = path.join(RAIZ, 'content/glosario.json');
if (fs.existsSync(pGlo)) {
  const glo = JSON.parse(fs.readFileSync(pGlo, 'utf8'));
  for (const t of glo.terminos ?? []) {
    if (!t.leccion) continue;
    const nueva = reescribirRuta(t.leccion);
    if (nueva !== t.leccion) {
      t.leccion = nueva;
      cambios.glosario += 1;
    }
  }
  escribir(pGlo, glo);
}

/* ── Los directorios ────────────────────────────────────────────────────── */

let dirsMovidos = 0;
for (const [viejo, nuevo] of renombra) {
  for (const base of [DIR_MODULOS, DIR_IMAGENES]) {
    const origen = path.join(base, viejo);
    if (!fs.existsSync(origen)) continue;
    if (!simulacro) fs.renameSync(origen, path.join(base, nuevo));
    dirsMovidos += 1;
  }
}

/* ── Informe ────────────────────────────────────────────────────────────── */

console.log('');
console.log(`  directorios renombrados      ${dirsMovidos} ${c.gris('(content/modulos y public/imagenes)')}`);
console.log(`  prerrequisitos actualizados  ${cambios.prerrequisitos} lecciones`);
console.log(`  imágenes reindexadas         ${cambios.imagenes}`);
console.log(`  términos del glosario        ${cambios.glosario}`);
console.log(`  portadas de módulo           ${cambios.portadas}`);

/* ── Supabase ───────────────────────────────────────────────────────────────
 * El progreso de quien estudia guarda el identificador de lección, que lleva
 * dentro el nombre del módulo. Si no se migra aquí queda huérfano, y el mapa
 * viejo→nuevo solo existe en esta ejecución: después del renombrado ya no hay
 * forma de reconstruirlo. Por eso va en el mismo script y no en otro.
 */

async function migrarSupabase() {
  const envPath = path.join(RAIZ, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log(`\n  ${c.ambar('⚠')} Sin .env.local: no se migró Supabase.`);
    return;
  }
  const env = Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  );
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log(`\n  ${c.ambar('⚠')} Faltan credenciales en .env.local: no se migró Supabase.`);
    return;
  }

  const cab = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const TABLAS = [
    { t: 'curso_progreso_leccion', cols: ['leccion_id', 'modulo_id'], pk: 'leccion_id' },
    { t: 'curso_nota', cols: ['leccion_id'], pk: 'leccion_id' },
    { t: 'curso_intento_quiz', cols: ['leccion_id'], pk: 'id' },
    { t: 'curso_respuesta_quiz', cols: ['leccion_id'], pk: 'id' },
  ];

  let migradas = 0;
  for (const { t, cols, pk } of TABLAS) {
    const r = await fetch(`${url}/rest/v1/${t}?select=*`, { headers: cab });
    if (!r.ok) {
      console.log(`  ${c.ambar('·')} ${t}: no se pudo leer (${r.status})`);
      continue;
    }
    for (const fila of await r.json()) {
      const parche = {};
      for (const col of cols) {
        if (typeof fila[col] !== 'string') continue;
        const nuevo = reescribirRuta(fila[col]);
        if (nuevo !== fila[col]) parche[col] = nuevo;
      }
      if (Object.keys(parche).length === 0) continue;
      const u = await fetch(`${url}/rest/v1/${t}?${pk}=eq.${encodeURIComponent(fila[pk])}`, {
        method: 'PATCH',
        headers: cab,
        body: JSON.stringify(parche),
      });
      if (u.ok) migradas += 1;
      else console.log(`  ${c.rojo('·')} ${t}/${fila[pk]}: ${u.status}`);
    }
  }

  // La última lección abierta se guarda como ajuste suelto, con el mismo formato.
  const ra = await fetch(`${url}/rest/v1/curso_ajuste?select=*`, { headers: cab });
  if (ra.ok) {
    for (const fila of await ra.json()) {
      if (typeof fila.valor !== 'string' || !fila.valor.includes('/')) continue;
      const nuevo = reescribirRuta(fila.valor);
      if (nuevo === fila.valor) continue;
      const u = await fetch(`${url}/rest/v1/curso_ajuste?clave=eq.${encodeURIComponent(fila.clave)}`, {
        method: 'PATCH',
        headers: cab,
        body: JSON.stringify({ valor: nuevo }),
      });
      if (u.ok) migradas += 1;
    }
  }

  console.log(`\n  ${c.verde('✓')} Supabase: ${migradas} filas migradas.`);
}

if (simulacro) {
  console.log(`\n  ${c.gris('Supabase se migraría al ejecutar sin --simulacro.')}`);
  console.log(`\n${c.ambar('◦')} Simulacro: no se ha escrito nada.\n`);
} else {
  await migrarSupabase();
  console.log(`\n${c.verde('✓')} Hecho. Pasa \`npm run validar\`.\n`);
}
