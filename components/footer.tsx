import Link from 'next/link';
import { LogoMark } from '@/components/logo-mark';
import { SITE } from '@/lib/site';

const social = [
  {
    nombre: 'Instagram',
    href: SITE.instagram,
    icono: (
      <>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" />
      </>
    ),
  },
  {
    nombre: 'Facebook',
    href: SITE.facebook,
    icono: (
      <path
        fill="currentColor"
        d="M14.5 21v-6h2.6l.9-3.5h-3.5V9.1c0-1 .4-1.7 1.8-1.7h1.8V4.3c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.8H8V15h3.1v6h3.4z"
      />
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-brand-900 text-brand-100">
      {/* Filete superior en oro */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-oro-400/60 to-transparent" />
      {/* Textura de raíces muy tenue */}
      <div className="pattern-roots pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-oro-400/40 text-crema-50">
                <LogoMark className="h-8 w-8" />
              </span>
              <div className="leading-none">
                <p className="font-serif text-xl font-semibold text-crema-50">Rizoma del Sur</p>
                <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-brand text-oro-300">
                  {SITE.handle}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-brand-200">
              Vivero y huerto biológico dentro de la urbanización Prados del Sur, Ruta 9 sur,
              Santa Cruz de la Sierra. {SITE.tagline}.
            </p>
          </div>

          <div>
            <p className="eyebrow text-oro-300">Explora</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ['/tienda', 'Tienda'],
                ['/laboratorio-vivo', 'Laboratorio Vivo'],
                ['/visitanos', 'Visítanos'],
                ['/carrito', 'Carrito'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-brand-200 transition-colors hover:text-crema-50">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-oro-300">Visítanos</p>
            <ul className="mt-4 space-y-2.5 text-sm text-brand-200">
              <li>Lunes a sábado · 8:00–18:00</li>
              <li>Domingos · 9:00–13:00</li>
              <li className="pt-1">Junto al Club House, Prados del Sur</li>
              <li>
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-oro-300 underline underline-offset-4 transition-colors hover:text-crema-50"
                >
                  Cómo llegar
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-oro-300">Síguenos</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {social.map((s) => (
                <li key={s.nombre}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 text-brand-200 transition-colors hover:text-crema-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-700 transition-colors group-hover:border-oro-400/60">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        {s.icono}
                      </svg>
                    </span>
                    {s.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-brand-800 pt-6 text-xs text-brand-300 sm:flex-row">
          <p>© {new Date().getFullYear()} Rizoma del Sur · {SITE.handle}</p>
          <p className="font-serif italic text-oro-300/90">{SITE.tagline}</p>
          <div className="flex items-center gap-4">
            <a
              href="https://bolivai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 transition-colors hover:text-brand-200"
            >
              Made by BolivAI
            </a>
            <Link href="/admin" className="text-brand-400 transition-colors hover:text-brand-200">
              Acceso administración
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
