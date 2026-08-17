import Link from 'next/link';

export const metadata = {
  title: 'Pedido confirmado',
  description:
    'Recibimos tu pedido en Rizoma del Sur. Te contactamos por WhatsApp para coordinar el pago y la entrega o el retiro en el vivero.',
  alternates: { canonical: '/pedido/confirmacion' },
};

export default function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { simulado?: string };
}) {
  const simulado = searchParams.simulado === '1';

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="animate-fade-up">
        <p className="eyebrow text-tierra-600">Pedido recibido</p>
        <span className="rule-grow mx-auto mt-4" />

        <div className="mx-auto mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 shadow-soft ring-1 ring-oro-300/40">
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 text-brand-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-8 font-serif text-4xl font-semibold leading-tight text-brand-900 text-balance sm:text-5xl">
          ¡Pedido recibido!
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-800/80 text-pretty">
          Gracias por tu compra. Te contactaremos por WhatsApp para coordinar el pago y la entrega
          en tu lote o el retiro en el vivero.
        </p>

        {simulado && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-amber-300/70 bg-amber-50 p-6 text-left shadow-soft">
            <p className="eyebrow text-amber-700">Modo demostración</p>
            <p className="mt-3 font-serif text-lg font-semibold text-amber-900">
              Pedido simulado
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-800/90">
              La plataforma todavía no está conectada a Supabase, por lo que este pedido no se
              guardó en una base de datos. Cuando se configuren las variables
              <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-900">
                NEXT_PUBLIC_SUPABASE_URL
              </code>
              y
              <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-900">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
              , los pedidos se registrarán automáticamente.
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/tienda"
            className="rounded-full bg-brand-700 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-brand-800"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="rounded-full border border-brand-200 px-7 py-3.5 font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
