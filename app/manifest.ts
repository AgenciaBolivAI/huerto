import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rizoma del Sur — Vivero y huerto biologico',
    short_name: 'Rizoma del Sur',
    description:
      'Vivero y huerto biologico del sur: plantas de especialidad, cercos vivos, palmeras de sombra y frutales cultivados con manos que conocen la tierra.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f2e7',
    theme_color: '#1f3d2b',
    lang: 'es',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
