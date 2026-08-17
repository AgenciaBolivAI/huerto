#!/usr/bin/env node
/**
 * Reordena los módulos del curso y arregla las referencias que quedan colgando.
 *
 * El orden de los módulos lo fija `datos.numero` de cada `modulo.json`, pero el
 * número también está escrito a mano dentro de las lecciones —«como vimos en el
 * Módulo 8»— casi trescientas veces. Renumerar sin tocar esa prosa deja el curso
 * lleno de referencias que apuntan a otro módulo.
 *
 *   node scripts/renumerar-modulos.mjs orden.json [--simulacro]
 *
 * `orden.json` es `{ "orden": ["fundamentos", "matematica-util", ...] }`
 * con los directorios en su orden nuevo. El primero pasa a ser el módulo 1.
 * Los directorios NO se renombran, y ya no hace falta: desde
 * `quitar-prefijos.mjs` no llevan número, así que el nombre no puede quedar en
 * desacuerdo con el orden. El directorio es el identificador estable —de él
 * cuelgan los ids de lección, los prerrequisitos, las rutas de imagen y el
 * progreso guardado en la base de datos— y reordenar solo toca `numero`.
 *
 * Dos cosas que este script NO puede arreglar solo y por eso informa al final:
 *
 *   · Las referencias que pasan a apuntar hacia adelante. Si una lección dice
 *     «como vimos en el módulo 8» y ese módulo ahora va después, el número queda
 *     bien y la frase queda mal. Hay que reescribirla a mano.
 *   · Los prerrequisitos que apuntan a un módulo posterior, que son el mismo
 *     problema declarado en `meta.json`.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const RAIZ = process.cwd();
const DIR_MODULOS = path.join(RAIZ, 'content/modulos');

const args = process.argv.slice(2);
const simulacro = args.includes('--simulacro');
const rutaOrden = args.find((a) => !a.startsWith('--'));

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

if (!rutaOrden) abortar('Falta el archivo de orden.\n  node scripts/renumerar-modulos.mjs orden.json');
if (!fs.existsSync(rutaOrden)) abortar(`No existe ${rutaOrden}`);

const orden = JSON.parse(fs.readFileSync(rutaOrden, 'utf8')).orden;
if (!Array.isArray(orden)) abortar('El archivo debe tener un array `orden`.');

/* ── Validación: el orden tiene que ser una permutación exacta ───────────── */

const enDisco = fs
  .readdirSync(DIR_MODULOS)
  .filter((d) => fs.existsSync(path.join(DIR_MODULOS, d, 'modulo.json')));

const sobran = orden.filter((d) => !enDisco.includes(d));
const faltan = enDisco.filter((d) => !orden.includes(d));
const repes = orden.filter((d, i) => orden.indexOf(d) !== i);

if (sobran.length) abortar(`El orden nombra módulos que no existen: ${sobran.join(', ')}`);
if (faltan.length) abortar(`El orden se deja módulos fuera: ${faltan.join(', ')}`);
if (repes.length) abortar(`El orden repite módulos: ${[...new Set(repes)].join(', ')}`);

/* ── Mapa viejo → nuevo ─────────────────────────────────────────────────── */

const viejoDe = new Map(); // dir -> número actual
for (const d of enDisco) {
  viejoDe.set(d, JSON.parse(fs.readFileSync(path.join(DIR_MODULOS, d, 'modulo.json'), 'utf8')).numero);
}
const nuevoDe = new Map(orden.map((d, i) => [d, i + 1])); // dir -> número nuevo
const remapa = new Map(); // número viejo -> número nuevo
for (const d of enDisco) remapa.set(viejoDe.get(d), nuevoDe.get(d));

const movidos = enDisco.filter((d) => viejoDe.get(d) !== nuevoDe.get(d));

console.log(`\n${c.fuerte('Renumerar los módulos del curso')} ${c.gris(`· ${enDisco.length} módulos`)}`);
if (simulacro) console.log(`  ${c.ambar('simulacro: no se escribe nada')}`);
console.log(`  cambian de número: ${movidos.length}`);

/* ── Reescritura de las referencias en prosa ─────────────────────────────
 * En dos pasadas con marcador intermedio: sustituir de una vez arrastra los
 * números ya cambiados (si 8 pasa a 26 y 26 pasa a 8, la segunda sustitución
 * deshace la primera). El marcador lleva un carácter que no aparece en el
 * contenido, así que no puede colisionar con nada escrito.
 */

// «Módulo 8», «módulos 17 y 28», «módulos 3, 4 y 10».
const REFERENCIA = /([Mm]ódulos?\s+)(\d+(?:\s*(?:,|y|a|-)\s*\d+)*)/g;

function reescribir(texto) {
  let tocados = 0;
  const conMarca = texto.replace(REFERENCIA, (todo, cabeza, numeros) => {
    const sustituidos = numeros.replace(/\d+/g, (n) => {
      const nuevo = remapa.get(Number(n));
      if (nuevo === undefined) return n; // número que no es un módulo: se deja
      // Solo cuenta si de verdad cambia. Si no, reaplicar el mismo orden
      // informaria de cientos de cambios inexistentes y el informe dejaria
      // de servir para saber que paso.
      if (nuevo !== Number(n)) tocados += 1;
      return `${nuevo}`;
    });
    return cabeza + sustituidos;
  });
  return { texto: conMarca.replace(/(\d+)/g, '$1'), tocados };
}

const archivos = [];
const recorrer = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p);
    else if (/\.(mdx|json)$/.test(e.name)) archivos.push(p);
  }
};
recorrer(DIR_MODULOS);

/**
 * Campos que NO se tocan aunque contengan «Módulo N».
 *
 * El `titulo` y el `canal` de un video los rellena `verificar-videos.mjs`
 * leyéndolos de YouTube, y el validador comprueba que coincidan carácter a
 * carácter. Hay un video que se llama «Módulo 5. Simbologías en el dibujo
 * arquitectónico»: es el nombre que le puso su autor y no tiene ninguna
 * relación con la numeración de este curso. La primera versión de este script
 * lo renumeró a «Módulo 8» y rompió la verificación — que es exactamente para
 * lo que sirve tener esa comprobación.
 */
const CAMPOS_INTOCABLES = new Set(['titulo', 'canal']);

/** Reescribe solo los valores de texto que no son de un video. */
function reescribirJson(valor, dentroDeVideo = false) {
  let tocados = 0;
  if (typeof valor === 'string') {
    if (dentroDeVideo) return { valor, tocados: 0 };
    const r = reescribir(valor);
    return { valor: r.texto, tocados: r.tocados };
  }
  if (Array.isArray(valor)) {
    const salida = valor.map((v) => {
      const r = reescribirJson(v, dentroDeVideo);
      tocados += r.tocados;
      return r.valor;
    });
    return { valor: salida, tocados };
  }
  if (valor && typeof valor === 'object') {
    const salida = {};
    for (const [k, v] of Object.entries(valor)) {
      const protegido = dentroDeVideo && CAMPOS_INTOCABLES.has(k);
      const r = reescribirJson(v, protegido || (k === 'videos' ? true : dentroDeVideo));
      tocados += r.tocados;
      salida[k] = r.valor;
    }
    return { valor: salida, tocados };
  }
  return { valor, tocados: 0 };
}

let refsCambiadas = 0;
let archivosTocados = 0;
for (const p of archivos) {
  const antes = fs.readFileSync(p, 'utf8');

  let texto;
  let tocados;
  if (p.endsWith('.json')) {
    // Por el árbol y no por el texto plano, para poder saltarse campos concretos.
    const r = reescribirJson(JSON.parse(antes));
    tocados = r.tocados;
    texto = `${JSON.stringify(r.valor, null, 2)}\n`;
  } else {
    ({ texto, tocados } = reescribir(antes));
  }

  if (!tocados || texto === antes) continue;
  refsCambiadas += tocados;
  archivosTocados += 1;
  if (!simulacro) fs.writeFileSync(p, texto, 'utf8');
}
console.log(`  referencias reescritas: ${refsCambiadas} en ${archivosTocados} archivos`);

/* ── El campo `numero` ──────────────────────────────────────────────────── */

for (const d of enDisco) {
  const p = path.join(DIR_MODULOS, d, 'modulo.json');
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (j.numero === nuevoDe.get(d)) continue;
  j.numero = nuevoDe.get(d);
  if (!simulacro) fs.writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`, 'utf8');
}
console.log(`  campo \`numero\` actualizado en ${movidos.length} módulos`);

/* ── Lo que queda mal y hay que mirar a mano ─────────────────────────────── */

const adelante = [];
for (const d of enDisco) {
  const dirMod = path.join(DIR_MODULOS, d);
  for (const lec of fs.readdirSync(dirMod)) {
    const dirLec = path.join(dirMod, lec);
    if (!fs.statSync(dirLec).isDirectory()) continue;

    const mdx = path.join(dirLec, `${lec}.mdx`);
    if (fs.existsSync(mdx)) {
      // Sobre el texto YA renumerado: cualquier número mayor es un reenvío.
      const texto = simulacro ? reescribir(fs.readFileSync(mdx, 'utf8')).texto : fs.readFileSync(mdx, 'utf8');
      for (const m of texto.matchAll(REFERENCIA)) {
        for (const n of m[2].match(/\d+/g) ?? []) {
          if (Number(n) > nuevoDe.get(d)) {
            adelante.push({ de: `${d}/${lec}`, hacia: Number(n), frase: m[0] });
          }
        }
      }
    }

    const meta = path.join(dirLec, 'meta.json');
    if (fs.existsSync(meta)) {
      const j = JSON.parse(fs.readFileSync(meta, 'utf8'));
      for (const pre of j.prerrequisitos ?? []) {
        const dm = pre.split('/')[0];
        if (nuevoDe.has(dm) && nuevoDe.get(dm) > nuevoDe.get(d)) {
          adelante.push({ de: `${d}/${lec}`, hacia: nuevoDe.get(dm), frase: `prerrequisito ${pre}` });
        }
      }
    }
  }
}

console.log('');
if (!adelante.length) {
  console.log(`${c.verde('✓')} Ninguna referencia apunta hacia adelante.\n`);
} else {
  const porLeccion = new Map();
  for (const a of adelante) porLeccion.set(a.de, (porLeccion.get(a.de) ?? 0) + 1);
  console.log(`  ${c.ambar('⚠')} ${adelante.length} referencias apuntan a un módulo POSTERIOR,`);
  console.log(`    en ${porLeccion.size} lecciones. El número es correcto; la frase puede no serlo`);
  console.log(`    («como vimos en…» hacia algo que aún no se vio). Hay que revisarlas:\n`);
  for (const [lec, n] of [...porLeccion].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`      ${c.gris(`${String(n).padStart(3)}  ${lec}`)}`);
  }
  if (porLeccion.size > 15) console.log(`      ${c.gris(`… y ${porLeccion.size - 15} lecciones más`)}`);
  console.log('');
}

if (simulacro) console.log(`${c.ambar('◦')} Simulacro: no se ha escrito nada.\n`);
else console.log(`${c.verde('✓')} Renumerado. Pasa \`npm run validar\` y revisa lo señalado.\n`);
