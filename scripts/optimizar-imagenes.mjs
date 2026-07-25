#!/usr/bin/env node
/**
 * Convierte a WebP las imágenes de las lecciones y borra el PNG original.
 *
 * Las imágenes se generan en PNG de 1-2,5 MB. A ~4 imágenes por lección y 80
 * lecciones eso serían cientos de megas en el repositorio, y además cada visita
 * al curso descargaría de más. En WebP el mismo contenido baja en torno a un
 * 85 % sin diferencia visible.
 *
 * Los diagramas van a calidad muy alta y las fotografías algo más comprimidas.
 * Se probó WebP sin pérdida para los diagramas y no compensa: como los genera
 * un modelo de imagen, no son vector plano de verdad y arrastran ruido sutil
 * que dispara el tamaño (~500 KB) sin ninguna ganancia visible frente a q=90.
 *
 * Uso:
 *   node scripts/optimizar-imagenes.mjs            todas las pendientes
 *   node scripts/optimizar-imagenes.mjs --forzar   rehace también las ya hechas
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import sharp from 'sharp';

const RAIZ = path.resolve(import.meta.dirname, '..');
const DIR_IMAGENES = path.join(RAIZ, 'public', 'imagenes');
const FORZAR = process.argv.includes('--forzar');

/** Ancho máximo: por encima de esto nadie nota la diferencia en pantalla. */
const ANCHO_MAXIMO = 1600;

/**
 * Una fotografía se comprime con pérdida; un diagrama, sin ella. Se distinguen
 * por nombre para no tener que mantener una lista aparte.
 */
function esFotografia(nombre) {
  return /portada|foto|paisaje|vivero/i.test(nombre);
}

function recorrer(dir) {
  const salida = [];
  if (!fs.existsSync(dir)) return salida;
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) salida.push(...recorrer(ruta));
    else if (/\.(png|jpg|jpeg)$/i.test(entrada.name)) salida.push(ruta);
  }
  return salida;
}

const originales = recorrer(DIR_IMAGENES);
if (originales.length === 0) {
  console.log('\nNo hay imágenes PNG o JPG que convertir.\n');
  process.exit(0);
}

let antes = 0;
let despues = 0;
let convertidas = 0;

for (const origen of originales) {
  const destino = origen.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const relativa = path.relative(RAIZ, destino).replace(/\\/g, '/');

  if (fs.existsSync(destino) && !FORZAR) {
    fs.unlinkSync(origen);
    console.log(`  ${relativa}  (ya existía; PNG eliminado)`);
    continue;
  }

  const tamOrigen = fs.statSync(origen).size;
  const foto = esFotografia(path.basename(origen));

  await sharp(origen)
    .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
    .webp(foto ? { quality: 82, effort: 6 } : { quality: 90, effort: 6 })
    .toFile(destino);

  const tamDestino = fs.statSync(destino).size;
  fs.unlinkSync(origen);

  antes += tamOrigen;
  despues += tamDestino;
  convertidas++;

  const ahorro = Math.round((1 - tamDestino / tamOrigen) * 100);
  console.log(
    `  ${relativa}\n    ${(tamOrigen / 1024).toFixed(0)} KB → ${(tamDestino / 1024).toFixed(0)} KB ` +
      `(−${ahorro} %, ${foto ? 'foto q82' : 'diagrama q90'})`,
  );
}

if (convertidas > 0) {
  console.log(
    `\n${convertidas} ${convertidas === 1 ? 'imagen convertida' : 'imágenes convertidas'}: ` +
      `${(antes / 1024 / 1024).toFixed(1)} MB → ${(despues / 1024 / 1024).toFixed(1)} MB ` +
      `(−${Math.round((1 - despues / antes) * 100)} %)\n`,
  );
}
