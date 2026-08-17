'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogoMark } from '@/components/logo-mark';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 placeholder:text-brand-800/40 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="animate-fade-up rounded-4xl border border-brand-100 bg-white p-8 shadow-lift sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Link
              href="/"
              aria-label="Volver al inicio"
              className="text-brand-700 transition-colors hover:text-brand-800"
            >
              <LogoMark className="h-12 w-12" />
            </Link>
            <p className="eyebrow mt-6 text-tierra-600">Panel privado</p>
            <span className="rule-grow mx-auto mt-4" />
            <h1 className="mt-5 text-3xl font-semibold text-brand-900">Acceso administración</h1>
            <p className="mt-3 text-sm text-brand-800/80">
              Ingresa con tus credenciales para gestionar el vivero.
            </p>
          </div>

          {!isSupabaseConfigured() ? (
            <div className="mt-8 rounded-2xl border border-oro-300 bg-oro-200/30 p-5 text-sm text-brand-900">
              <p className="font-semibold">Supabase no está configurado</p>
              <p className="mt-2 text-brand-800/80">
                El inicio de sesión requiere Supabase Auth. Configura las variables
                <code className="mx-1 rounded bg-crema-100 px-1.5 py-0.5 text-brand-900">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{' '}
                y
                <code className="mx-1 rounded bg-crema-100 px-1.5 py-0.5 text-brand-900">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{' '}
                en <code className="mx-1 rounded bg-crema-100 px-1.5 py-0.5 text-brand-900">.env.local</code>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-brand-900">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-brand-900">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="rounded-xl border border-tierra-200 bg-tierra-100 px-4 py-3 text-sm text-tierra-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-brand-700 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-800/50"
              >
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-brand-800/70">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">
              ←
            </span>
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
