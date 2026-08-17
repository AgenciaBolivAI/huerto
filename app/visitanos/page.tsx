import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Visítanos',
  description:
    'Cómo llegar a Rizoma del Sur: junto al Club House, dentro de Prados del Sur, Ruta 9 sur, Santa Cruz de la Sierra. Abierto de lunes a sábado 8:00–18:00 y domingos 9:00–13:00.',
  alternates: { canonical: '/visitanos' },
};

const comoLlegar = [
  'Ingresa por el acceso principal de Prados del Sur, sobre la Ruta 9 al sur de Santa Cruz de la Sierra.',
  'Sigue la avenida central de la urbanización hasta llegar al Club House.',
  'El vivero está justo al costado del Club House: busca el letrero de entrada de Rizoma del Sur.',
];

const horarios = [
  ['Lunes a sábado', '8:00 – 18:00'],
  ['Domingos y feriados', '9:00 – 13:00'],
];

const modalidades = [
  {
    titulo: 'Retiro en el vivero',
    texto:
      'Ven, recorre las hileras y elige tus plantines en persona. Coordinamos por WhatsApp para tenerlos listos cuando llegues, sin filas ni esperas.',
  },
  {
    titulo: 'Entrega en tu lote',
    texto:
      'Si estás construyendo dentro de Prados del Sur, llevamos tus plantas directamente a tu lote y te asesoramos sobre dónde y cómo sembrarlas.',
  },
];

export default function VisitanosPage() {
  return (
    <div>
      {/* ————————————————— Encabezado ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20">
        <div className="max-w-3xl animate-fade-up">
          <p className="eyebrow text-tierra-600">Prados del Sur · Ruta 9 sur · Santa Cruz</p>
          <span className="rule-grow mt-4" />
          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] text-brand-900 text-balance sm:text-6xl">
            Visítanos
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-800/80 text-pretty">
            Estamos junto al Club House, dentro de la urbanización Prados del Sur, sobre la Ruta 9
            al sur de Santa Cruz de la Sierra. Ven a conocer el vivero, el huerto caribeño y el
            Laboratorio Vivo — a pasos de tu nuevo hogar.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-700 px-7 py-3.5 font-semibold text-crema-50 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-brand-800"
            >
              Abrir en Google Maps
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-200 px-7 py-3.5 font-semibold text-brand-800 transition-colors hover:bg-brand-50"
            >
              Coordinar por Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ————————————————— Ubicación + mapa ————————————————— */}
      <section className="bg-crema-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-tierra-600">Cómo llegar</p>
              <span className="rule-grow mt-4" />
              <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
                Junto al Club House
              </h2>
              <div className="mt-6 space-y-1 text-lg leading-relaxed text-brand-800/80">
                <p className="font-semibold text-brand-900">{SITE.addressLine}</p>
                <p>{SITE.locality}</p>
              </div>

              <ol className="mt-8 space-y-5">
                {comoLlegar.map((paso, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-700 font-serif text-sm font-semibold text-crema-50">
                      {i + 1}
                    </span>
                    <p className="pt-1 leading-relaxed text-brand-800/80">{paso}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-9">
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-brand-700 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-brand-800"
                >
                  Abrir en Google Maps
                </a>
              </div>
            </div>

            {/* Tarjeta de mapa */}
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hairline-frame group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-brand-900 shadow-lift"
            >
              <Image
                src="/images/mapa-estrellas-del-sur.svg"
                alt="Mapa esquemático: Rizoma del Sur junto al Club House, dentro de Prados del Sur, Ruta 9 sur"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 scrim-bottom" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                <div>
                  <p className="eyebrow text-oro-300">Ubicación exacta</p>
                  <p className="mt-1.5 font-serif text-xl font-semibold text-crema-50">
                    Prados del Sur · Ruta 9 sur
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-oro-300">
                  Abrir mapa
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ————————————————— Horarios + modalidades ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Horarios */}
          <div>
            <p className="eyebrow text-tierra-600">Horarios</p>
            <span className="rule-grow mt-4" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
              Cuándo venir
            </h2>
            <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
              {horarios.map(([dias, horas], i) => (
                <div
                  key={dias}
                  className={`flex items-center justify-between px-6 py-5 ${
                    i > 0 ? 'border-t border-brand-50' : ''
                  }`}
                >
                  <span className="text-brand-800/80">{dias}</span>
                  <span className="font-serif text-lg font-semibold text-brand-900">{horas}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-brand-800/70">
              Publicamos horarios especiales, talleres y cosechas de la semana en nuestras redes como{' '}
              <span className="font-semibold text-brand-900">{SITE.handle}</span>. Escríbenos antes
              de venir y coordinamos tu visita.
            </p>
          </div>

          {/* Retiro vs entrega */}
          <div>
            <p className="eyebrow text-tierra-600">Retiro o entrega</p>
            <span className="rule-grow mt-4" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
              Dos formas de llevarte tus plantas
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {modalidades.map((m) => (
                <div
                  key={m.titulo}
                  className="rounded-2xl border border-brand-100 bg-white p-7 shadow-soft"
                >
                  <h3 className="font-serif text-2xl font-semibold text-brand-900">{m.titulo}</h3>
                  <p className="mt-3 leading-relaxed text-brand-800/80">{m.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ————————————————— CTA WhatsApp (oscuro) ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="hairline-frame relative overflow-hidden rounded-4xl bg-brand-800 px-8 py-16 text-center text-crema-50 shadow-lift sm:px-16">
          <div className="pattern-roots pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow text-oro-300">Antes de venir</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
              Coordina tu visita por WhatsApp
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-crema-100/85">
              Cuéntanos qué buscas y te esperamos con todo listo. Muy pronto sumaremos una cafetería
              familiar junto al huerto: café de especialidad, postres caseros y mesas a la sombra de
              los árboles del vivero.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-crema-50 px-7 py-3.5 font-semibold text-brand-800 transition-transform hover:-translate-y-0.5 hover:bg-white"
              >
                Escribirnos por Instagram
              </a>
              <a
                href={SITE.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-crema-100/40 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-crema-50/10"
              >
                Abrir en Google Maps
              </a>
              <Link
                href="/tienda"
                className="rounded-full border border-crema-100/40 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-crema-50/10"
              >
                Explorar la tienda
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
