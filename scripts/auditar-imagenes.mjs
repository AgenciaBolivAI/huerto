/**
 * Auditoría del registro de procedencia de imágenes.
 *
 * `validar-contenido.mjs` ya comprueba la relación entre las lecciones y los
 * archivos: que toda imagen citada exista y que toda imagen en disco se use.
 * Esto comprueba una cosa distinta y que aquel no puede ver: que de cada
 * imagen publicada sepamos **de dónde salió** — con qué modelo, con qué prompt
 * y en qué fecha se generó.
 *
 * Importa porque el prompt es la única forma de regenerar una imagen o de
 * corregirle un detalle meses después, y porque una imagen sin procedencia en
 * un curso publicado es una afirmación visual de la que no podemos responder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_IMG = path.join(RAIZ, 'public', 'imagenes');
const REGISTRO = path.join(RAIZ, 'content', 'imagenes.json');

const c = {
  rojo: (s) => `\x1b[31m${s}\x1b[0m`,
  verde: (s) => `\x1b[32m${s}\x1b[0m`,
  gris: (s) => `\x1b[90m${s}\x1b[0m`,
  negrita: (s) => `\x1b[1m${s}\x1b[0m`,
};

/** Todas las .webp bajo public/imagenes, con ruta relativa a esa carpeta. */
function imagenesEnDisco(dir, prefijo = '') {
  const salida = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefijo ? `${prefijo}/${entrada.name}` : entrada.name;
    if (entrada.isDirectory()) {
      salida.push(...imagenesEnDisco(path.join(dir, entrada.name), rel));
    } else if (/\.webp$/i.test(entrada.name)) {
      salida.push(rel);
    }
  }
  return salida;
}

const registro = JSON.parse(fs.readFileSync(REGISTRO, 'utf8'));
// `_descartadas` es un apéndice: imágenes que se generaron y se rechazaron.
// Documentan un intento fallido, no algo publicado, y no cuentan aquí.
const { _descartadas: descartadas, ...registradas } = registro.imagenes;

const enDisco = imagenesEnDisco(DIR_IMG).sort();
const claves = new Set(Object.keys(registradas));

const sinRegistrar = enDisco.filter((f) => !claves.has(f));
const fantasmas = [...claves].filter((k) => !enDisco.includes(k)).sort();

// Un prompt vacío es peor que una ausencia: aparenta procedencia sin darla.
const incompletas = Object.entries(registradas)
  .filter(([, v]) => !v.prompt?.trim() || !v.alt?.trim() || !v.modelo)
  .map(([k]) => k)
  .sort();

console.log(
  `\n${c.negrita('Auditoría de imágenes')} ${c.gris(
    `· ${enDisco.length} en disco · ${claves.size} registradas`,
  )}\n`,
);

for (const f of sinRegistrar)
  console.log(`  ${c.rojo('sin registrar')} ${f} ${c.gris('— falta su entrada en content/imagenes.json')}`);
for (const f of fantasmas)
  console.log(`  ${c.rojo('fantasma')}      ${f} ${c.gris('— registrada pero no está en disco')}`);
for (const f of incompletas)
  console.log(`  ${c.rojo('incompleta')}    ${f} ${c.gris('— le falta prompt, alt o modelo')}`);

const problemas = sinRegistrar.length + fantasmas.length + incompletas.length;

if (problemas === 0) {
  const n = descartadas ? Object.keys(descartadas).length : 0;
  console.log(c.verde('Todas las imágenes publicadas tienen procedencia completa.'));
  if (n) console.log(c.gris(`${n} descartada${n === 1 ? '' : 's'} documentada${n === 1 ? '' : 's'} en el apéndice.`));
  console.log();
} else {
  console.log(`\n${c.rojo(`${problemas} problema${problemas === 1 ? '' : 's'}.`)}\n`);
  process.exit(1);
}
