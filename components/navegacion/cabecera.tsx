'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

import { accionGuardarTema } from '@/lib/acciones';

const ENLACES = [
  { href: '/', etiqueta: 'Panel', exacto: true },
  { href: '/modulos', etiqueta: 'Módulos' },
  { href: '/notas', etiqueta: 'Notas' },
  { href: '/glosario', etiqueta: 'Glosario' },
  { href: '/herramientas', etiqueta: 'Herramientas' },
];

/** Isotipo: un rizoma con sus nodos, el gesto de marca de Rizoma del Sur. */
function Isotipo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
      <path
        d="M6 20c4 0 5-4 9-4s5 4 9 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="18.6" r="1.9" fill="currentColor" />
      <circle cx="21.5" cy="18.6" r="1.9" fill="currentColor" />
      <path d="M16 16V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function Cabecera({ oscuro }: { oscuro: boolean }) {
  const ruta = usePathname();
  const [esOscuro, setEsOscuro] = useState(oscuro);
  const [, iniciarTransicion] = useTransition();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function alternarTema() {
    const siguiente = !esOscuro;
    setEsOscuro(siguiente);
    // Se aplica al DOM en el acto para que el cambio se sienta instantáneo, y
    // se persiste en SQLite en segundo plano.
    document.documentElement.classList.toggle('dark', siguiente);
    iniciarTransicion(() => {
      void accionGuardarTema(siguiente ? 'oscuro' : 'claro');
    });
  }

  const activo = (href: string, exacto?: boolean) =>
    exacto ? ruta === href : ruta === href || ruta.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-salvia-200/70 bg-crema-100/85 backdrop-blur-md dark:border-crema-100/10 dark:bg-tinta-950/85">
      <div className="seccion flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Isotipo className="h-8 w-8 text-bosque-700 dark:text-salvia-400" />
          <span className="leading-none">
            <span className="block font-serif text-[1.05rem] font-semibold text-bosque-800 dark:text-crema-50">
              Huerto Class
            </span>
            <span className="mt-0.5 block text-[0.62rem] uppercase tracking-marca text-tierra-600 dark:text-tierra-300">
              Rizoma del Sur
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activo(e.href, e.exacto)
                  ? 'bg-bosque-700 text-crema-50'
                  : 'text-tinta-600 hover:bg-salvia-100 hover:text-bosque-800 dark:text-crema-100/65 dark:hover:bg-white/5 dark:hover:text-crema-50'
              }`}
            >
              {e.etiqueta}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={alternarTema}
            aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="grid h-9 w-9 place-items-center rounded-full text-tinta-600 transition-colors hover:bg-salvia-100 hover:text-bosque-800 dark:text-crema-100/70 dark:hover:bg-white/5"
          >
            {esOscuro ? (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-14a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM3 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm16 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM5.6 5.6a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1-1.4 1.4l-.7-.7a1 1 0 0 1 0-1.4Zm10.7 10.7a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1-1.4 1.4l-.7-.7a1 1 0 0 1 0-1.4Zm2.1-10.7a1 1 0 0 1 0 1.4l-.7.7a1 1 0 1 1-1.4-1.4l.7-.7a1 1 0 0 1 1.4 0ZM7.7 16.3a1 1 0 0 1 0 1.4l-.7.7a1 1 0 0 1-1.4-1.4l.7-.7a1 1 0 0 1 1.4 0Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                <path d="M21.5 14.1A9 9 0 0 1 9.9 2.5a1 1 0 0 0-1.3-1.2A10.5 10.5 0 1 0 22.7 15.4a1 1 0 0 0-1.2-1.3Z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            className="grid h-9 w-9 place-items-center rounded-full text-tinta-600 hover:bg-salvia-100 dark:text-crema-100/70 dark:hover:bg-white/5 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuAbierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav className="border-t border-salvia-200/70 px-5 py-3 dark:border-crema-100/10 md:hidden">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              onClick={() => setMenuAbierto(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                activo(e.href, e.exacto)
                  ? 'bg-bosque-700 text-crema-50'
                  : 'text-tinta-600 dark:text-crema-100/70'
              }`}
            >
              {e.etiqueta}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
