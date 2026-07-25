/**
 * Reglas de YouTube compartidas por la aplicación (TypeScript) y por los
 * scripts de verificación (Node puro).
 *
 * Se mantiene en un único archivo a propósito: si el verificador aceptara una
 * URL que la aplicación luego rechaza —o al revés— podría publicarse un video
 * roto pese a haber pasado el control. Una sola definición, un solo criterio.
 */

/**
 * Extrae el ID de 11 caracteres de una URL de YouTube. Acepta las formas
 * watch?v=, youtu.be/, /embed/, /shorts/ y /live/.
 *
 * @param {string} url
 * @returns {string | null} el ID, o null si no es una URL de YouTube válida
 */
export function extraerIdYouTube(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  const esYouTube =
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com' ||
    host === 'youtu.be';
  if (!esYouTube) return null;

  const valido = (id) => (id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null);

  if (host === 'youtu.be') return valido(u.pathname.slice(1).split('/')[0]);
  if (u.pathname === '/watch') return valido(u.searchParams.get('v'));

  const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
  if (m) return valido(m[2]);

  return null;
}

/**
 * Segundos → "mm:ss" o "h:mm:ss".
 * @param {number} segundos
 * @returns {string}
 */
export function formatearDuracion(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  const dd = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${dd(m)}:${dd(s)}` : `${m}:${dd(s)}`;
}

/** URL canónica de un video, la que se guarda en meta.json. @param {string} id */
export function urlCanonica(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}
