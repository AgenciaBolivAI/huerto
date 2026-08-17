'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup';

export default function IngresarPage() {
  return (
    <Suspense>
      <IngresarForm />
    </Suspense>
  );
}

function IngresarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/cuenta';

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push(redirectTo);
        router.refresh();
        return;
      }

      // Registro
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (authError) throw authError;

      // Si el correo no requiere confirmación, ya hay sesión: guardamos el nombre
      // en el perfil y continuamos.
      if (data.session && data.user) {
        if (name.trim()) {
          await supabase
            .from('profiles')
            .update({ full_name: name.trim() })
            .eq('id', data.user.id);
        }
        router.push(redirectTo);
        router.refresh();
        return;
      }

      // Confirmación de correo activada: no hay sesión todavía.
      setInfo(
        'Te enviamos un correo para confirmar tu cuenta. Ábrelo y luego inicia sesión aquí.',
      );
      setMode('login');
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      if (mode === 'login') {
        setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else if (message.includes('already') || message.includes('registered')) {
        setError('Ese correo ya tiene una cuenta. Inicia sesión en su lugar.');
      } else if (message.includes('password')) {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('No se pudo completar el registro. Inténtalo de nuevo.');
      }
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-brand-900 transition-colors placeholder:text-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600/30';

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <p className="eyebrow text-tierra-600">Tu cuenta</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-900">
        {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
      </h1>
      <p className="mt-2 text-sm text-brand-800/70">
        {mode === 'login'
          ? 'Accede para autocompletar tus pedidos y ver tu historial.'
          : 'Crea una cuenta para guardar tus datos y seguir tus pedidos.'}
      </p>

      {!isSupabaseConfigured() ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Las cuentas no están disponibles</p>
          <p className="mt-1">
            El inicio de sesión requiere Supabase. Mientras tanto puedes comprar como invitado sin
            crear una cuenta.
          </p>
          <Link
            href="/tienda"
            className="mt-3 inline-block rounded-full bg-brand-700 px-5 py-2.5 font-semibold text-crema-50 transition-colors hover:bg-brand-800"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
          >
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                  Nombre completo
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  autoComplete="name"
                  placeholder="Ej.: María Fernanda Rojas"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
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
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {info && (
              <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">{info}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-700 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-brand-800 disabled:bg-brand-200"
            >
              {loading
                ? 'Procesando…'
                : mode === 'login'
                  ? 'Ingresar'
                  : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-brand-800/70">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setInfo(null);
              }}
              className="font-semibold text-brand-700 underline underline-offset-2"
            >
              {mode === 'login' ? 'Crear una' : 'Ingresar'}
            </button>
          </p>
        </>
      )}
    </div>
  );
}
