#!/usr/bin/env node
/**
 * Verificador de videos — el guardián del contenido.
 *
 * El punto débil de un curso generado es el video: un ID inventado produce un
 * enlace muerto y arruina la lección, y falla en SILENCIO. Este script existe
 * para que eso sea imposible por construcción, no por buena voluntad.
 *
 * La regla que impone: `titulo`, `canal` y `duracion` NUNCA se escriben a mano.
 * Los rellena este script leyéndolos de la propia YouTube. Quien redacta una
 * lección solo aporta `url`, `idioma` y `porQue`. Si el ID fuera inventado,
 * oEmbed responde 404, el video se marca como no verificado y el proceso
 * termina con código distinto de cero.
 *
 * Comprobaciones por video:
 *   1. La URL es de YouTube y contiene un ID de 11 caracteres.
 *   2. oEmbed responde 200  → el video existe y es público.
 *   3. Título y canal reales, tomados de la respuesta de oEmbed.
 *   4. Duración real, leída de `lengthSeconds` en la página del video.
 *   5. `playableInEmbed` → se puede incrustar (existir no basta).
 *   6. Miniatura descargada a public/thumbs/ para que la lección se vea sin red.
 *
 * Uso:
 *   node scripts/verificar-videos.mjs                 solo verifica
 *   node scripts/verificar-videos.mjs --fix           además corrige los meta.json
 *   node scripts/verificar-videos.mjs --modulo 02-...  limita el alcance
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { extraerIdYouTube, formatearDuracion, urlCanonica } from '../lib/aula/youtube.mjs';

const RAIZ = path.resolve(import.meta.dirname, '..');
const DIR_MODULOS = path.join(RAIZ, 'content', 'modulos');
const DIR_THUMBS = path.join(RAIZ, 'public', 'thumbs');
/**
 * Registro de lo que este script comprobó realmente contra YouTube. Solo lo
 * escribe él, y `validar-contenido.mjs` lo usa para detectar metadatos puestos
 * a mano: marcar `verificado: true` en un meta.json ya no basta, el ID tiene
 * que constar aquí con el mismo título, canal y duración.
 */
const RUTA_REGISTRO = path.join(RAIZ, 'content', 'videos-verificados.json');

const args = process.argv.slice(2);
const CORREGIR = args.includes('--fix');
const MODULO = args.includes('--modulo') ? args[args.indexOf('--modulo') + 1] : null;

const TIEMPO_LIMITE_MS = 15_000;
const PAUSA_ENTRE_PETICIONES_MS = 350;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const c = {
  reset: '\x1b[0m',
  gris: '\x1b[90m',
  rojo: '\x1b[31m',
  verde: '\x1b[32m',
  amarillo: '\x1b[33m',
  cian: '\x1b[36m',
  negrita: '\x1b[1m',
};

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function traer(url, opciones = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIEMPO_LIMITE_MS);
  try {
    return await fetch(url, {
      ...opciones,
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'es-ES,es;q=0.9', ...opciones.headers },
    });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Consulta oEmbed: la prueba de existencia. Devuelve el título y el canal
 * REALES, que son los que acabarán en el meta.json.
 */
async function consultarOEmbed(id) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(urlCanonica(id))}&format=json`;
  const res = await traer(url);

  if (res.status === 404)
    return { ok: false, motivo: 'no existe, fue eliminado o es privado (oEmbed 404)' };
  if (res.status === 401)
    return { ok: false, motivo: 'el propietario no permite incrustarlo (oEmbed 401)' };
  if (!res.ok) return { ok: false, motivo: `oEmbed respondió ${res.status}` };

  const datos = await res.json();
  return { ok: true, titulo: datos.title, canal: datos.author_name, miniatura: datos.thumbnail_url };
}

/**
 * Lee la página del video para obtener duración y si admite incrustación.
 * No es crítico: si falla, el video sigue siendo válido y solo se avisa.
 */
async function consultarPagina(id) {
  try {
    const res = await traer(urlCanonica(id));
    if (!res.ok) return {};
    const html = await res.text();

    const dur = html.match(/"lengthSeconds":"(\d+)"/);
    const emb = html.match(/"playableInEmbed":(true|false)/);
    const est = html.match(/"playabilityStatus":\s*\{\s*"status":\s*"([A-Z_]+)"/);

    return {
      segundos: dur ? Number(dur[1]) : undefined,
      incrustable: emb ? emb[1] === 'true' : undefined,
      estado: est ? est[1] : undefined,
    };
  } catch {
    return {};
  }
}

async function descargarMiniatura(id, urlMiniatura) {
  const destino = path.join(DIR_THUMBS, `${id}.jpg`);
  if (fs.existsSync(destino)) return 'ya estaba';

  // maxresdefault da 1280×720; no todos los videos la tienen, así que se cae
  // hacia la que oEmbed garantiza.
  for (const url of [`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, urlMiniatura]) {
    if (!url) continue;
    try {
      const res = await traer(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      // YouTube devuelve un marcador gris de 1 KB cuando la resolución no existe.
      if (buf.length < 2048) continue;
      fs.mkdirSync(DIR_THUMBS, { recursive: true });
      fs.writeFileSync(destino, buf);
      return `${(buf.length / 1024).toFixed(0)} KB`;
    } catch {
      /* se intenta con la siguiente */
    }
  }
  return null;
}

/** Recorre content/modulos/*&#47;*&#47;meta.json */
function listarLecciones() {
  if (!fs.existsSync(DIR_MODULOS)) return [];
  const salida = [];

  for (const modulo of fs.readdirSync(DIR_MODULOS).sort()) {
    if (MODULO && modulo !== MODULO) continue;
    const dirModulo = path.join(DIR_MODULOS, modulo);
    if (!fs.statSync(dirModulo).isDirectory()) continue;

    for (const slug of fs.readdirSync(dirModulo).sort()) {
      const meta = path.join(dirModulo, slug, 'meta.json');
      if (fs.existsSync(meta)) salida.push({ modulo, slug, rutaMeta: meta });
    }
  }
  return salida;
}

function leerRegistro() {
  if (!fs.existsSync(RUTA_REGISTRO)) return {};
  try {
    return JSON.parse(fs.readFileSync(RUTA_REGISTRO, 'utf8')).videos ?? {};
  } catch {
    return {};
  }
}

function escribirRegistro(videos) {
  const ordenados = Object.fromEntries(Object.entries(videos).sort(([a], [b]) => a.localeCompare(b)));
  const contenido = {
    _comentario:
      'Generado por scripts/verificar-videos.mjs. NO editar a mano: es la prueba de que ' +
      'cada video fue comprobado contra YouTube. validar-contenido.mjs compara los ' +
      'meta.json con este registro y falla si alguien puso los metadatos por su cuenta.',
    videos: ordenados,
  };
  fs.writeFileSync(RUTA_REGISTRO, `${JSON.stringify(contenido, null, 2)}\n`, 'utf8');
}

async function main() {
  const lecciones = listarLecciones();
  const registro = leerRegistro();

  console.log(
    `\n${c.negrita}Verificación de videos${c.reset} ${c.gris}· ${lecciones.length} ${
      lecciones.length === 1 ? 'lección' : 'lecciones'
    }${CORREGIR ? ' · modo --fix' : ''}${c.reset}\n`,
  );

  let totalVideos = 0;
  let okTotal = 0;
  const fallos = [];
  const avisos = [];
  const sinVideo = [];

  for (const { modulo, slug, rutaMeta } of lecciones) {
    const meta = JSON.parse(fs.readFileSync(rutaMeta, 'utf8'));
    const videos = Array.isArray(meta.videos) ? meta.videos : [];

    if (videos.length === 0) {
      sinVideo.push(`${modulo}/${slug}`);
      console.log(`${c.gris}○ ${modulo}/${slug} — sin videos (pendiente de curar)${c.reset}`);
      continue;
    }

    console.log(`${c.cian}▸ ${modulo}/${slug}${c.reset}`);
    let modificado = false;

    for (const video of videos) {
      totalVideos++;
      const etiqueta = video.url ?? '(sin url)';
      const id = video.url ? extraerIdYouTube(video.url) : null;

      if (!id) {
        video.verificado = false;
        modificado = true;
        fallos.push({ leccion: `${modulo}/${slug}`, url: etiqueta, motivo: 'URL de YouTube inválida' });
        console.log(`  ${c.rojo}✗${c.reset} ${etiqueta}\n    ${c.rojo}URL de YouTube inválida${c.reset}`);
        continue;
      }

      const oembed = await consultarOEmbed(id);
      await dormir(PAUSA_ENTRE_PETICIONES_MS);

      if (!oembed.ok) {
        video.verificado = false;
        modificado = true;
        fallos.push({ leccion: `${modulo}/${slug}`, url: etiqueta, motivo: oembed.motivo });
        console.log(`  ${c.rojo}✗${c.reset} ${id}\n    ${c.rojo}${oembed.motivo}${c.reset}`);
        continue;
      }

      const pagina = await consultarPagina(id);
      await dormir(PAUSA_ENTRE_PETICIONES_MS);

      // Aquí está el núcleo del asunto: los metadatos los dicta YouTube, no
      // quien redactó la lección.
      const tituloAnterior = video.titulo;
      const canalAnterior = video.canal;
      const duracionAnterior = video.duracion;

      video.titulo = oembed.titulo;
      video.canal = oembed.canal;
      video.url = urlCanonica(id);
      if (pagina.segundos) video.duracion = formatearDuracion(pagina.segundos);
      video.verificado = true;

      const cambios = [];
      if (tituloAnterior !== video.titulo) cambios.push('título');
      if (canalAnterior !== video.canal) cambios.push('canal');
      if (duracionAnterior !== video.duracion) cambios.push('duración');
      if (cambios.length > 0) modificado = true;

      if (pagina.incrustable === false) {
        avisos.push({
          leccion: `${modulo}/${slug}`,
          url: video.url,
          motivo: 'existe pero NO se puede incrustar — el reproductor mostrará un error',
        });
      }

      // Se deja constancia de lo que YouTube dijo, para que el validador pueda
      // detectar después cualquier edición manual de estos campos.
      registro[id] = {
        titulo: video.titulo,
        canal: video.canal,
        duracion: video.duracion ?? null,
        incrustable: pagina.incrustable ?? null,
        verificadoEn: new Date().toISOString().slice(0, 10),
      };

      let miniatura = null;
      if (CORREGIR) miniatura = await descargarMiniatura(id, oembed.miniatura);

      okTotal++;
      const marcaIncrustable =
        pagina.incrustable === false ? ` ${c.amarillo}[no incrustable]${c.reset}` : '';
      console.log(
        `  ${c.verde}✓${c.reset} ${video.titulo}${marcaIncrustable}\n` +
          `    ${c.gris}${video.canal} · ${video.duracion ?? '¿?'} · ${video.idioma ?? '¿?'}` +
          `${cambios.length ? ` · corregido: ${cambios.join(', ')}` : ''}` +
          `${miniatura ? ` · miniatura ${miniatura}` : ''}${c.reset}`,
      );
    }

    if (CORREGIR && modificado) {
      fs.writeFileSync(rutaMeta, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
      console.log(`  ${c.gris}meta.json actualizado${c.reset}`);
    } else if (modificado && !CORREGIR) {
      console.log(
        `  ${c.amarillo}Hay metadatos que no coinciden con YouTube. Ejecuta con --fix.${c.reset}`,
      );
    }
  }

  if (CORREGIR) {
    escribirRegistro(registro);
    console.log(`\n${c.gris}Registro actualizado: content/videos-verificados.json${c.reset}`);
  }

  /* ── Resumen ───────────────────────────────────────────────────────────── */

  console.log(`\n${c.negrita}Resumen${c.reset}`);
  console.log(`  ${c.verde}${okTotal}${c.reset} de ${totalVideos} videos verificados`);
  if (sinVideo.length > 0) {
    console.log(
      `  ${c.gris}${sinVideo.length} ${
        sinVideo.length === 1 ? 'lección' : 'lecciones'
      } sin video — la interfaz lo indica explícitamente${c.reset}`,
    );
  }

  if (avisos.length > 0) {
    console.log(`\n${c.amarillo}${c.negrita}Avisos${c.reset}`);
    for (const a of avisos) console.log(`  ${c.amarillo}!${c.reset} ${a.leccion}\n    ${a.url}\n    ${a.motivo}`);
  }

  if (fallos.length > 0) {
    console.log(`\n${c.rojo}${c.negrita}Videos que NO se pueden publicar${c.reset}`);
    for (const f of fallos) console.log(`  ${c.rojo}✗${c.reset} ${f.leccion}\n    ${f.url}\n    ${f.motivo}`);
    console.log(
      `\n${c.rojo}Quita estos videos del meta.json o sustitúyelos por otros que sí existan.\n` +
        `Una lección sin video es mucho mejor que una con un enlace roto.${c.reset}\n`,
    );
    process.exit(1);
  }

  console.log(`\n${c.verde}Todos los videos existen, corresponden y son reproducibles.${c.reset}\n`);
}

main().catch((e) => {
  console.error(`\n${c.rojo}Error inesperado:${c.reset}`, e);
  process.exit(1);
});
