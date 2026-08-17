'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart-provider';
import { LogoMark } from '@/components/logo-mark';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';
import { SITE } from '@/lib/site';

const links = [
  { href: '/tienda', label: 'Tienda' },
  { href: '/aula', label: 'Aula' },
  { href: '/laboratorio-vivo', label: 'Laboratorio Vivo' },
  { href: '/visitanos', label: 'Visítanos' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();

  const accountsEnabled = isSupabaseConfigured();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!accountsEnabled) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(Boolean(user)));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(Boolean(session?.user)));
    return () => subscription.unsubscribe();
  }, [accountsEnabled]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const accountLink = loggedIn
    ? { href: '/cuenta', label: 'Mi cuenta' }
    : { href: '/ingresar', label: 'Ingresar' };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50">
      {/* Franja superior */}
      <div className="hidden bg-brand-900 text-brand-100 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-[0.7rem] tracking-wide">
          <p className="opacity-90">Vivero biológico dentro de Prados del Sur · Ruta 9 sur, Santa Cruz</p>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-oro-300 transition-opacity hover:opacity-80"
          >
            {SITE.handle}
          </a>
        </div>
      </div>

      {/* Barra principal */}
      <div
        className={`border-b transition-all duration-300 ${
          scrolled
            ? 'border-oro-300/40 bg-crema-50/90 shadow-soft backdrop-blur-md'
            : 'border-transparent bg-crema-50/70 backdrop-blur'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/"
            className="group flex items-center gap-3"
            onClick={() => setOpen(false)}
            aria-label="Rizoma del Sur — inicio"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-800 text-crema-50 shadow-soft transition-transform duration-300 group-hover:scale-105">
              <LogoMark className="h-7 w-7" />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-xl font-semibold tracking-tight text-brand-900">
                Rizoma <span className="italic font-normal text-brand-600">del Sur</span>
              </span>
              <span className="mt-1 block text-[0.6rem] font-semibold uppercase tracking-brand text-brand-500">
                Vivero · Huerto biológico
              </span>
            </span>
          </Link>

          {/* Navegación escritorio */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative text-sm font-medium tracking-wide transition-colors ${
                  isActive(l.href) ? 'text-brand-700' : 'text-brand-900 hover:text-brand-600'
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-oro-400 transition-all duration-300 ${
                    isActive(l.href) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {accountsEnabled && (
              <Link
                href={accountLink.href}
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-50 md:inline-block"
              >
                {accountLink.label}
              </Link>
            )}
            <Link
              href="/carrito"
              aria-label={`Ver carrito${itemCount > 0 ? `, ${itemCount} artículos` : ''}`}
              className="relative inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-crema-50 shadow-soft transition-colors hover:bg-brand-800"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-12L5 3H2" />
                <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
              </svg>
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tierra-500 px-1 text-xs font-bold text-white ring-2 ring-crema-50">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Botón menú móvil */}
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 text-brand-800 transition-colors hover:bg-brand-50 md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                {open ? (
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <nav className="border-b border-oro-300/40 bg-crema-50 px-6 pb-5 shadow-soft md:hidden">
          {[{ href: '/', label: 'Inicio' }, ...links].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-brand-100 py-3.5 font-serif text-lg text-brand-900"
            >
              {l.label}
            </Link>
          ))}
          {accountsEnabled && (
            <Link
              href={accountLink.href}
              onClick={() => setOpen(false)}
              className="block border-b border-brand-100 py-3.5 font-serif text-lg text-brand-900"
            >
              {accountLink.label}
            </Link>
          )}
          <Link
            href="/carrito"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-full bg-brand-700 py-3 text-center font-semibold text-crema-50"
          >
            Ver carrito{itemCount > 0 ? ` · ${itemCount}` : ''}
          </Link>
        </nav>
      )}
    </header>
  );
}
