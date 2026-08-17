// Constantes de sitio y marca: fuente única para enlaces, contacto y datos SEO.
// Seguro para cliente y servidor (sin dependencias de next/ ni supabase).

// Sin teléfono ni WhatsApp: los que había eran de relleno («+591 700 00000») y
// se publicaban en el pie, en la página de visitas y en los datos estructurados
// que lee Google. Un número inventado en un sitio real manda a la gente a un
// número que no es de nadie. Cuando haya uno de verdad, vuelve aquí.
export const SITE = {
  name: 'Rizoma del Sur',
  handle: '@rizomaDelSur',
  tagline: 'Cultivamos raíces, cosechamos comunidad',
  url: 'https://rizomadelsur.com',
  locality: 'Santa Cruz de la Sierra',
  addressLine: 'Urbanización Prados del Sur · Ruta 9 sur',
  // Ubicación exacta (Google Maps)
  mapUrl: 'https://maps.app.goo.gl/3eT6W4PtstcAmzFCA',
  instagram: 'https://instagram.com/rizomaDelSur',
  facebook: 'https://facebook.com/rizomaDelSur',
} as const;

