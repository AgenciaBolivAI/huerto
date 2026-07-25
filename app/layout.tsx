import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

import { Cabecera } from '@/components/navegacion/cabecera';
import { obtenerAjuste } from '@/lib/progreso';

import './globals.css';

/**
 * Tipografías servidas desde el propio repositorio, no desde Google Fonts.
 * `next/font/google` las descargaría durante el primer build, lo que rompería
 * la promesa de que `npm run dev` funcione sin conexión.
 */
const display = localFont({
  src: './fuentes/Fraunces-latin.woff2',
  variable: '--fuente-display',
  weight: '300 900',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'serif'],
});

const cuerpo = localFont({
  src: './fuentes/Inter-latin.woff2',
  variable: '--fuente-cuerpo',
  weight: '100 900',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    default: 'Huerto Class — De 0 a Experto en Huertos y Viveros',
    template: '%s · Huerto Class',
  },
  description:
    'Curso interactivo de huertos y viveros aplicado a Rizoma del Sur, Santa Cruz de la Sierra, Bolivia.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F1E7' },
    { media: '(prefers-color-scheme: dark)', color: '#131a11' },
  ],
};

/**
 * Todo en esta aplicación depende del estado del estudiante en SQLite, así que
 * nada tiene sentido prerenderizarlo de forma estática.
 */
export const dynamic = 'force-dynamic';

export default async function LayoutRaiz({ children }: { children: React.ReactNode }) {
  // El tema se lee en el servidor y se aplica directamente al <html>. Es lo que
  // elimina el parpadeo por completo, sin script inline ni localStorage: la
  // preferencia vive en la base de datos como el resto del estado.
  const oscuro = (await obtenerAjuste('tema')) === 'oscuro';

  return (
    <html lang="es" className={`${display.variable} ${cuerpo.variable} ${oscuro ? 'dark' : ''}`}>
      <body className="min-h-screen font-sans">
        <Cabecera oscuro={oscuro} />
        <main>{children}</main>
        <footer className="mt-20 border-t border-salvia-200/70 py-8 dark:border-crema-100/10">
          <div className="seccion flex flex-col gap-1.5 text-sm text-tinta-500 dark:text-crema-100/45 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-serif font-semibold text-tinta-700 dark:text-crema-100/70">
                Huerto Class
              </span>{' '}
              — curso local para Rizoma del Sur
            </p>
            <p>2.474 m² · Estrellas del Sur, Zanja Honda · Santa Cruz de la Sierra</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
