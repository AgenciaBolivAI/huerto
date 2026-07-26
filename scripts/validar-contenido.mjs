#!/usr/bin/env node
/**
 * Validador de contenido — se ejecuta antes de cada build (`npm run build`).
 *
 * Comprueba, sin tocar la red, todo lo que puede romperse al editar lecciones
 * a mano:
 *
 *   · modulo.json / meta.json / quiz.json cumplen su esquema
 *   · cada lección tiene su .mdx con el nombre correcto
 *   · los prerrequisitos apuntan a lecciones que existen
 *   · cada <Video id="…"> del MDX está en el meta.json de esa lección
 *   · cada <Termino slug="…"> existe en el glosario
 *   · cada imagen en disco se usa en su lección, y cada imagen usada existe
 *   · toda lección práctica lleva APLICAR A RIZOMA DEL SUR y CONTEXTO BOLIVIA
 *   · ningún video quedó marcado como no verificado
 *
 * El último punto es el que cierra el círculo con verificar-videos.mjs: aunque
 * alguien añada un video a mano y se salte la verificación, el build lo caza.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { extraerIdYouTube } from '../lib/youtube.mjs';

const RAIZ = path.resolve(import.meta.dirname, '..');
const DIR_CONTENIDO = path.join(RAIZ, 'content');
const DIR_MODULOS = path.join(DIR_CONTENIDO, 'modulos');

const c = {
  reset: '\x1b[0m',
  gris: '\x1b[90m',
  rojo: '\x1b[31m',
  verde: '\x1b[32m',
  amarillo: '\x1b[33m',
  cian: '\x1b[36m',
  negrita: '\x1b[1m',
};

const errores = [];
const avisos = [];

const error = (donde, mensaje) => errores.push({ donde, mensaje });
const aviso = (donde, mensaje) => avisos.push({ donde, mensaje });

function leerJson(ruta, donde) {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch (e) {
    error(donde, `JSON inválido: ${e.message}`);
    return null;
  }
}

function esTexto(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/* ── Registro de videos verificados ───────────────────────────────────────── */

/**
 * Lo escribe únicamente `verificar-videos.mjs` tras consultar a YouTube. Sirve
 * para que este validador —que trabaja sin red— pueda distinguir un video
 * realmente comprobado de uno al que alguien le puso `verificado: true` a mano.
 */
const rutaRegistro = path.join(DIR_CONTENIDO, 'videos-verificados.json');
let registroVideos = {};

if (fs.existsSync(rutaRegistro)) {
  const registro = leerJson(rutaRegistro, 'content/videos-verificados.json');
  registroVideos = registro?.videos ?? {};
}

/* ── Glosario ─────────────────────────────────────────────────────────────── */

const rutaGlosario = path.join(DIR_CONTENIDO, 'glosario.json');
const slugsGlosario = new Set();

if (fs.existsSync(rutaGlosario)) {
  const glosario = leerJson(rutaGlosario, 'content/glosario.json');
  if (glosario) {
    if (!Array.isArray(glosario.terminos)) {
      error('content/glosario.json', 'falta el array `terminos`');
    } else {
      for (const t of glosario.terminos) {
        if (!esTexto(t.slug)) error('content/glosario.json', 'un término no tiene `slug`');
        else {
          if (slugsGlosario.has(t.slug))
            error('content/glosario.json', `slug duplicado: "${t.slug}"`);
          slugsGlosario.add(t.slug);
        }
        if (!esTexto(t.definicion))
          error('content/glosario.json', `"${t.slug}" no tiene definición`);
        for (const s of t.sinonimos ?? []) slugsGlosario.add(s);
      }
    }
  }
}

/* ── Recorrido de módulos y lecciones ─────────────────────────────────────── */

const idsLecciones = new Set();
const porRevisarPrerrequisitos = [];
let totalLecciones = 0;
let totalVideos = 0;

const modulos = fs.existsSync(DIR_MODULOS)
  ? fs.readdirSync(DIR_MODULOS).filter((d) => fs.statSync(path.join(DIR_MODULOS, d)).isDirectory())
  : [];

if (modulos.length === 0) error('content/modulos', 'no hay ningún módulo');

const numerosVistos = new Map();

for (const modulo of modulos.sort()) {
  const dirModulo = path.join(DIR_MODULOS, modulo);
  const rutaModuloJson = path.join(dirModulo, 'modulo.json');
  const donde = `content/modulos/${modulo}/modulo.json`;

  if (!fs.existsSync(rutaModuloJson)) {
    error(`content/modulos/${modulo}`, 'falta modulo.json');
    continue;
  }

  const datosModulo = leerJson(rutaModuloJson, donde);
  if (!datosModulo) continue;

  if (!Number.isInteger(datosModulo.numero)) error(donde, '`numero` debe ser un entero');
  else if (numerosVistos.has(datosModulo.numero))
    error(donde, `el número ${datosModulo.numero} ya lo usa ${numerosVistos.get(datosModulo.numero)}`);
  else numerosVistos.set(datosModulo.numero, modulo);

  if (!esTexto(datosModulo.titulo)) error(donde, 'falta `titulo`');
  if (!esTexto(datosModulo.resumen)) error(donde, 'falta `resumen`');

  const slugsEnDisco = fs
    .readdirSync(dirModulo)
    .filter((d) => fs.statSync(path.join(dirModulo, d)).isDirectory());

  for (const declarada of datosModulo.lecciones ?? []) {
    if (!slugsEnDisco.includes(declarada))
      error(donde, `\`lecciones\` menciona "${declarada}", que no existe en disco`);
  }
  for (const enDisco of slugsEnDisco) {
    if (!(datosModulo.lecciones ?? []).includes(enDisco))
      aviso(donde, `la lección "${enDisco}" existe pero no está en \`lecciones\` — irá al final`);
  }

  /* ── Cada lección ── */
  for (const slug of slugsEnDisco.sort()) {
    const dirLeccion = path.join(dirModulo, slug);
    const leccionId = `${modulo}/${slug}`;
    const rutaMeta = path.join(dirLeccion, 'meta.json');
    const rutaMdx = path.join(dirLeccion, `${slug}.mdx`);
    const dondeL = `content/modulos/${leccionId}`;

    if (!fs.existsSync(rutaMeta)) {
      error(dondeL, 'falta meta.json');
      continue;
    }
    if (!fs.existsSync(rutaMdx)) {
      error(dondeL, `falta ${slug}.mdx (debe llamarse igual que su carpeta)`);
      continue;
    }

    totalLecciones++;
    idsLecciones.add(leccionId);

    const meta = leerJson(rutaMeta, `${dondeL}/meta.json`);
    if (!meta) continue;

    if (!esTexto(meta.titulo)) error(`${dondeL}/meta.json`, 'falta `titulo`');
    if (!Number.isInteger(meta.duracionMin) || meta.duracionMin <= 0)
      error(`${dondeL}/meta.json`, '`duracionMin` debe ser un entero positivo');
    if (!Array.isArray(meta.objetivos) || meta.objetivos.length === 0)
      error(`${dondeL}/meta.json`, 'debe declarar al menos un objetivo de aprendizaje');

    porRevisarPrerrequisitos.push({ donde: `${dondeL}/meta.json`, lista: meta.prerrequisitos ?? [] });

    /* Videos declarados */
    const idsDeclarados = new Set();
    for (const v of meta.videos ?? []) {
      totalVideos++;
      const id = esTexto(v.url) ? extraerIdYouTube(v.url) : null;

      if (!id) {
        error(`${dondeL}/meta.json`, `video con URL inválida: ${v.url ?? '(vacía)'}`);
        continue;
      }
      idsDeclarados.add(id);

      // Este es el cierre del círculo: nada llega al build sin haber pasado por
      // el verificador que consulta a YouTube.
      if (v.verificado !== true) {
        error(
          `${dondeL}/meta.json`,
          `el video ${id} no está verificado — ejecuta \`npm run verificar-videos:fix\``,
        );
      } else {
        // `verificado: true` no se cree por sí solo: tiene que constar en el
        // registro que escribe el verificador, y con los mismos metadatos.
        const comprobado = registroVideos[id];
        if (!comprobado) {
          error(
            `${dondeL}/meta.json`,
            `el video ${id} se declara verificado pero NO consta en content/videos-verificados.json. ` +
              `Marcar \`verificado: true\` a mano no basta: ejecuta \`npm run verificar-videos:fix\` ` +
              `para comprobarlo realmente contra YouTube.`,
          );
        } else {
          for (const campo of ['titulo', 'canal', 'duracion']) {
            if (comprobado[campo] && v[campo] !== comprobado[campo]) {
              error(
                `${dondeL}/meta.json`,
                `el \`${campo}\` del video ${id} no coincide con lo que devolvió YouTube.\n` +
                  `      meta.json: "${v[campo]}"\n` +
                  `      YouTube:   "${comprobado[campo]}"\n` +
                  `      Estos campos los rellena el verificador; no se escriben a mano.`,
              );
            }
          }
          if (comprobado.incrustable === false)
            aviso(dondeL, `el video ${id} existe pero no permite incrustación — se verá un error en el reproductor`);
        }
      }

      if (!esTexto(v.porQue))
        error(`${dondeL}/meta.json`, `el video ${id} no explica \`porQue\` está en esta lección`);
      if (!['es', 'en', 'pt'].includes(v.idioma))
        error(`${dondeL}/meta.json`, `el video ${id} tiene un \`idioma\` no válido`);

      const miniatura = path.join(RAIZ, 'public', 'thumbs', `${id}.jpg`);
      if (!fs.existsSync(miniatura))
        aviso(
          dondeL,
          `falta la miniatura local de ${id} — la carátula no se verá sin conexión ` +
            `(\`npm run verificar-videos:fix\`)`,
        );
    }

    /* ── Cuerpo MDX ── */
    const mdx = fs.readFileSync(rutaMdx, 'utf8');

    const idsUsados = new Set();
    for (const m of mdx.matchAll(/<Video\s+id=["']([^"']+)["']/g)) {
      idsUsados.add(m[1]);
      if (!idsDeclarados.has(m[1]))
        error(
          `${dondeL}/${slug}.mdx`,
          `<Video id="${m[1]}"> no está en el array \`videos\` de meta.json`,
        );
    }

    // Y al revés: un video declarado pero nunca insertado en el texto queda
    // invisible. El curso exige que los videos vayan en el punto exacto donde
    // son relevantes, no amontonados al final ni olvidados en el meta.json.
    for (const id of idsDeclarados) {
      if (!idsUsados.has(id))
        error(
          `${dondeL}/meta.json`,
          `el video ${id} está declarado pero nunca se inserta en el MDX. ` +
            `Añade <Video id="${id}" /> en el punto del texto donde es relevante.`,
        );
    }

    for (const m of mdx.matchAll(/<Termino\s+slug=["']([^"']+)["']/g)) {
      if (!slugsGlosario.has(m[1]))
        aviso(`${dondeL}/${slug}.mdx`, `<Termino slug="${m[1]}"> no está en el glosario`);
    }

    // Toda imagen referenciada tiene que estar en disco: si falta, el lector ve
    // un hueco roto en mitad de la explicación.
    const dirImagenes = path.join(RAIZ, 'public', 'imagenes', modulo, slug);
    const imagenesUsadas = new Set();
    const comprobarImagen = (archivo, donde) => {
      if (archivo.startsWith('/')) return; // ruta absoluta, se gestiona aparte
      imagenesUsadas.add(archivo);
      if (!fs.existsSync(path.join(dirImagenes, archivo)))
        error(donde, `falta la imagen public/imagenes/${leccionId}/${archivo}`);
    };

    for (const m of mdx.matchAll(/<(?:Diagrama|Ilustracion)\s[^>]*?src=["']([^"']+)["']/gs)) {
      comprobarImagen(m[1], `${dondeL}/${slug}.mdx`);
    }
    // Un diagrama sin `alt` deja fuera a quien use lector de pantalla y, si la
    // imagen no carga, borra la información sin dejar rastro.
    for (const m of mdx.matchAll(/<(Diagrama|Ilustracion)\s([^>]*?)\/>/gs)) {
      if (!/\balt=["']/.test(m[2]))
        error(`${dondeL}/${slug}.mdx`, `un <${m[1]}> no tiene texto alternativo (\`alt\`)`);
    }

    if (meta.portada) {
      comprobarImagen(meta.portada, `${dondeL}/meta.json`);
      if (!esTexto(meta.portadaAlt))
        aviso(`${dondeL}/meta.json`, 'la portada no tiene `portadaAlt`');
    }

    // Y la comprobación inversa: una imagen generada pero nunca insertada es
    // trabajo invisible. Pasó de verdad con lavado-cic.webp, que se quedó en
    // disco sin que ninguna lección la mostrara. Es el mismo agujero que el de
    // los videos declarados y no incrustados, así que se cierra igual.
    if (fs.existsSync(dirImagenes)) {
      for (const archivo of fs.readdirSync(dirImagenes)) {
        if (!/\.(webp|png|jpe?g|svg)$/i.test(archivo)) continue;
        if (!imagenesUsadas.has(archivo))
          error(
            `${dondeL}/${slug}.mdx`,
            `la imagen ${archivo} está en disco pero no se usa en la lección. ` +
              `Insértala con <Diagrama src="${archivo}" …/> donde corresponda, o bórrala.`,
          );
      }
    }

    // Los bloques que dan al curso su carácter: obligatorios en lección práctica.
    if (meta.practica !== false) {
      if (!mdx.includes('<AplicarRizoma'))
        error(`${dondeL}/${slug}.mdx`, 'falta el bloque <AplicarRizoma> (obligatorio si es práctica)');
      if (!mdx.includes('<ContextoBolivia'))
        error(`${dondeL}/${slug}.mdx`, 'falta el bloque <ContextoBolivia> (obligatorio si es práctica)');
    }

    /* ── Quiz ── */
    const rutaQuiz = path.join(dirLeccion, 'quiz.json');
    if (fs.existsSync(rutaQuiz)) {
      const quiz = leerJson(rutaQuiz, `${dondeL}/quiz.json`);
      if (quiz) {
        const preguntas = quiz.preguntas ?? [];
        if (preguntas.length < 4 || preguntas.length > 8)
          error(`${dondeL}/quiz.json`, `debe tener entre 4 y 8 preguntas (tiene ${preguntas.length})`);
        if (!preguntas.some((p) => p.tipo === 'abierta'))
          error(`${dondeL}/quiz.json`, 'debe incluir al menos una pregunta abierta');

        const ids = new Set();
        for (const p of preguntas) {
          if (!esTexto(p.id)) error(`${dondeL}/quiz.json`, 'hay una pregunta sin `id`');
          else if (ids.has(p.id)) error(`${dondeL}/quiz.json`, `id de pregunta duplicado: "${p.id}"`);
          else ids.add(p.id);

          if (!esTexto(p.enunciado)) error(`${dondeL}/quiz.json`, `"${p.id}" no tiene enunciado`);
          if (!esTexto(p.explicacion)) error(`${dondeL}/quiz.json`, `"${p.id}" no tiene explicación`);

          if (p.tipo === 'opcion_multiple') {
            if (!Array.isArray(p.opciones) || p.opciones.length < 2)
              error(`${dondeL}/quiz.json`, `"${p.id}" necesita al menos dos opciones`);
            if (!Array.isArray(p.correctas) || p.correctas.length === 0)
              error(`${dondeL}/quiz.json`, `"${p.id}" no declara respuestas correctas`);
            for (const idx of p.correctas ?? []) {
              if (!Number.isInteger(idx) || idx < 0 || idx >= (p.opciones?.length ?? 0))
                error(`${dondeL}/quiz.json`, `"${p.id}" apunta a la opción ${idx}, que no existe`);
            }
          } else if (p.tipo === 'verdadero_falso') {
            if (typeof p.respuesta !== 'boolean')
              error(`${dondeL}/quiz.json`, `"${p.id}" necesita \`respuesta\` booleana`);
          } else if (p.tipo === 'abierta') {
            if (!esTexto(p.respuestaModelo))
              error(`${dondeL}/quiz.json`, `"${p.id}" no tiene respuesta modelo`);
            if (!Array.isArray(p.criterios) || p.criterios.length === 0)
              error(`${dondeL}/quiz.json`, `"${p.id}" no declara criterios de autoevaluación`);
          } else {
            error(`${dondeL}/quiz.json`, `"${p.id}" tiene un tipo desconocido: ${p.tipo}`);
          }
        }
      }
    } else {
      aviso(dondeL, 'no tiene quiz.json');
    }
  }
}

/* Los prerrequisitos se comprueban al final, cuando ya se conocen todas las lecciones. */
for (const { donde, lista } of porRevisarPrerrequisitos) {
  for (const p of lista) {
    if (!idsLecciones.has(p)) error(donde, `el prerrequisito "${p}" no corresponde a ninguna lección`);
  }
}

/* ── Informe ──────────────────────────────────────────────────────────────── */

console.log(
  `\n${c.negrita}Validación de contenido${c.reset} ${c.gris}· ${modulos.length} módulos · ` +
    `${totalLecciones} ${totalLecciones === 1 ? 'lección' : 'lecciones'} · ${totalVideos} videos${c.reset}`,
);

if (avisos.length > 0) {
  console.log(`\n${c.amarillo}${c.negrita}Avisos${c.reset}`);
  for (const a of avisos) console.log(`  ${c.amarillo}!${c.reset} ${c.cian}${a.donde}${c.reset}\n    ${a.mensaje}`);
}

if (errores.length > 0) {
  console.log(`\n${c.rojo}${c.negrita}Errores${c.reset}`);
  for (const e of errores) console.log(`  ${c.rojo}✗${c.reset} ${c.cian}${e.donde}${c.reset}\n    ${e.mensaje}`);
  console.log(`\n${c.rojo}${errores.length} ${errores.length === 1 ? 'error' : 'errores'}. El build no debe continuar.${c.reset}\n`);
  process.exit(1);
}

console.log(`\n${c.verde}Contenido válido.${c.reset}\n`);
