import Link from 'next/link';
import type { Metadata } from 'next';

import { Cabecera } from '@/components/aula/navegacion/cabecera';
import { obtenerAjuste } from '@/lib/aula/progreso';

export const metadata: Metadata = {
  title: {
    default: 'Aula — De cero a experto: la tierra, los oficios y la tecnología',
    template: '%s · Aula Rizoma del Sur',
  },
  description:
    'Proyecto comunitario de Rizoma del Sur: un curso abierto y gratuito que va del suelo y las ' +
    'plantas a la electrónica, la programación, los oficios, el dinero de la casa y la salud de la ' +
    'familia, para que la zona de Zanja Honda tenga las herramientas para crecer e innovar. ' +
    'Santa Cruz de la Sierra, Bolivia.',
};

/**
 * El aula depende del progreso guardado en Supabase, así que nada aquí tiene
 * sentido prerenderizarlo. Se declara en este segmento y no en la raíz para que
 * la tienda y el resto del sitio sigan siendo estáticos.
 */
export const dynamic = 'force-dynamic';

export default async function LayoutAula({ children }: { children: React.ReactNode }) {
  // El tema se lee en el servidor y se aplica al envoltorio del aula, no a
  // <html>: el documento es compartido con la tienda, que es solo clara. Así se
  // elimina el parpadeo sin script inline y sin afectar al resto del sitio.
  const oscuro = (await obtenerAjuste('tema')) === 'oscuro';

  return (
    <div
      id="aula"
      className={`aula min-h-screen bg-crema-100 text-tinta-900 dark:bg-tinta-950 dark:text-crema-100 ${
        oscuro ? 'dark' : ''
      }`}
    >
      <Cabecera oscuro={oscuro} />
      <main>{children}</main>
      <footer className="mt-20 border-t border-salvia-200/70 py-10 dark:border-crema-100/10">
        {/* Quien llega al aula desde un buscador entra por una lección suelta y
            no ha visto nunca la portada. Si el pie no le cuenta que detrás hay
            un vivero real que se puede visitar y del que se puede comprar, el
            aula queda como un sitio aparte — que es justamente lo contrario de
            haberla metido dentro del sitio. */}
        <div className="seccion">
          <p className="max-w-2xl text-sm leading-relaxed text-tinta-600 dark:text-crema-100/55">
            <span className="font-serif font-semibold text-tinta-800 dark:text-crema-100/80">
              Esto lo publica Rizoma del Sur
            </span>
            , un vivero comunitario en Zanja Honda, al sur de Santa Cruz de la Sierra. El aula es
            gratuita y siempre lo será. El vivero es lo que la sostiene: de ahí salen las plantas,
            los ensayos y los casos que están escritos en cada lección.
          </p>

          <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[
              ['/', 'Conocer el proyecto'],
              ['/tienda', 'Comprar plantas'],
              ['/laboratorio-vivo', 'Laboratorio Vivo'],
              ['/visitanos', 'Visitarnos'],
            ].map(([href, texto]) => (
              <Link
                key={href}
                href={href}
                className="font-medium text-bosque-700 underline-offset-4 transition-colors hover:underline dark:text-salvia-300"
              >
                {texto}
              </Link>
            ))}
          </nav>
        </div>

        <div className="seccion mt-8 flex flex-col gap-1.5 border-t border-salvia-200/70 pt-6 text-sm text-tinta-500 dark:border-crema-100/10 dark:text-crema-100/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-serif font-semibold text-tinta-700 dark:text-crema-100/70">
              Aula
            </span>{' '}
            — proyecto comunitario de Rizoma del Sur
          </p>
          <p>Conocimiento libre, para siempre · Zanja Honda, Santa Cruz de la Sierra</p>
        </div>
        <div className="seccion mt-4 text-sm text-tinta-500 dark:text-crema-100/45">
          <p>
            Made by{' '}
            <a
              href="https://bolivai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-bosque-700 underline-offset-2 hover:underline dark:text-salvia-300"
            >
              BolivAI
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
