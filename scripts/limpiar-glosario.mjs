#!/usr/bin/env node
/**
 * Quita del glosario los sinónimos que dejan un enlace ambiguo.
 *
 * Cada `<Termino slug="X">` del MDX se resuelve contra los slugs del glosario
 * **y también contra los sinónimos**. Si un sinónimo coincide con el slug de
 * otro término, o si dos términos reclaman el mismo sinónimo, la resolución
 * deja de ser única y el lector no sabe qué definición le van a mostrar.
 *
 * Hace falta cada vez que se integran términos en lote: los agentes escriben
 * cada lección sin ver el glosario de las demás, así que dos lecciones nombran
 * lo mismo de dos maneras y una acaba declarando sinónimo lo que la otra ya
 * tenía como término propio. La última integración de 400 términos dejó 71
 * choques de este tipo.
 *
 *   node scripts/limpiar-glosario.mjs [--simulacro]
 *
 * `--simulacro` informa sin escribir.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const RUTA = path.join(process.cwd(), 'content/glosario.json');
const simulacro = process.argv.includes('--simulacro');

const c = {
  gris: (s) => `\x1b[90m${s}\x1b[0m`,
  verde: (s) => `\x1b[32m${s}\x1b[0m`,
  ambar: (s) => `\x1b[33m${s}\x1b[0m`,
  fuerte: (s) => `\x1b[1m${s}\x1b[0m`,
};

/** Sin tildes, sin mayúsculas y con cualquier separador vuelto guion. */
const norm = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

if (!fs.existsSync(RUTA)) {
  console.error(`No existe ${RUTA}`);
  process.exit(1);
}

const glosario = JSON.parse(fs.readFileSync(RUTA, 'utf8'));
const terminos = glosario.terminos ?? [];

/* Lo que un sinónimo no puede pisar: ningún slug ni nombre de término propio. */
const propios = new Map(); // normalizado -> slug del dueño
for (const t of terminos) {
  propios.set(norm(t.slug), t.slug);
  if (t.termino) propios.set(norm(t.termino), t.slug);
}

const reclamado = new Map(); // sinónimo normalizado -> primer término que lo reclama
const quitados = [];

for (const t of [...terminos].sort((a, b) => a.slug.localeCompare(b.slug))) {
  if (!Array.isArray(t.sinonimos) || t.sinonimos.length === 0) continue;

  t.sinonimos = t.sinonimos.filter((s) => {
    const n = norm(s);

    if (!n) {
      quitados.push([t.slug, s, 'vacío']);
      return false;
    }
    /* Repetirse a sí mismo no aporta nada y ensucia la resolución. */
    if (n === norm(t.slug) || n === norm(t.termino ?? '')) {
      quitados.push([t.slug, s, 'es su propio nombre o slug']);
      return false;
    }
    /* El caso que el validador marca como error. */
    const dueno = propios.get(n);
    if (dueno) {
      quitados.push([t.slug, s, `ya es término propio (${dueno})`]);
      return false;
    }
    /* Dos términos no pueden compartir sinónimo: el enlace sería ambiguo. */
    const previo = reclamado.get(n);
    if (previo) {
      quitados.push([t.slug, s, `ya lo reclama ${previo}`]);
      return false;
    }
    reclamado.set(n, t.slug);
    return true;
  });
}

console.log(`\n${c.fuerte('Limpieza del glosario')} ${c.gris(`· ${terminos.length} términos`)}`);

if (quitados.length === 0) {
  console.log(`${c.verde('✓')} Ningún sinónimo ambiguo.\n`);
  process.exit(0);
}

const porCausa = new Map();
for (const [, , causa] of quitados) {
  const clave = causa.replace(/\s*\([^)]*\)$/, '').replace(/^ya lo reclama .*/, 'ya lo reclama otro término');
  porCausa.set(clave, (porCausa.get(clave) ?? 0) + 1);
}

console.log(`  ${c.ambar(quitados.length)} sinónimos ambiguos:`);
for (const [causa, n] of [...porCausa].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(n).padStart(4)}  ${causa}`);
}
console.log('');
for (const [slug, s, causa] of quitados.slice(0, 12)) {
  console.log(`    ${c.gris(`${slug} · «${s}» — ${causa}`)}`);
}
if (quitados.length > 12) console.log(`    ${c.gris(`… y ${quitados.length - 12} más`)}`);

if (simulacro) {
  console.log(`\n${c.ambar('◦')} Simulacro: no se ha escrito nada.\n`);
} else {
  terminos.sort((a, b) => a.slug.localeCompare(b.slug));
  fs.writeFileSync(RUTA, `${JSON.stringify(glosario, null, 2)}\n`, 'utf8');
  console.log(`\n${c.verde('✓')} Glosario limpio y ordenado por slug.\n`);
}
