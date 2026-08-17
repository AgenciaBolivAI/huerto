import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Laboratorio Vivo',
  description:
    'Riego inteligente y cultivo biológico en Santa Cruz: sensores de humedad, riego automatizado, compost propio y un huerto experimental caribeño, funcionando a la vista de todos.',
  alternates: { canonical: '/laboratorio-vivo' },
};

const capacidades = [
  {
    titulo: 'Riego inteligente',
    texto:
      'Sensores enterrados junto a las raíces miden la humedad las 24 horas y abren el riego por goteo solo cuando la tierra lo pide. Desde el celular vemos cada zona en tiempo real y regamos a distancia, aunque estemos en la feria.',
    icono: 'M12 3c-3 4-6 6.6-6 10a6 6 0 0012 0c0-3.4-3-6-6-10z',
  },
  {
    titulo: 'Compost propio, sin agroquímicos',
    texto:
      'Nutrimos la tierra con compost hecho en casa a partir de restos del vivero y del huerto. Nada de fertilizantes ni pesticidas de síntesis: raíces fuertes y suelo vivo que sostiene cada plantín que sale de aquí.',
    icono: 'M12 21a8 8 0 008-8c0-4-8-11-8-11S4 9 4 13a8 8 0 008 8z',
  },
  {
    titulo: 'Huerto experimental caribeño',
    texto:
      'Probamos cultivos poco comunes en Bolivia — yautía, culantro, ají dulce y gandul — para saber cómo prosperan en el clima cruceño. Lo que aprende el huerto guía lo que cultivamos y ofrecemos en la tienda.',
    icono: 'M12 2v6m0 0a4 4 0 014 4v6a4 4 0 01-8 0v-6a4 4 0 014-4z',
  },
];

export default function LaboratorioVivoPage() {
  return (
    <div>
      {/* ————————————————— Hero ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24">
        <div className="max-w-2xl animate-fade-up">
          <p className="eyebrow text-tierra-600">Ciencia del vivero</p>
          <span className="rule-grow mt-4" />
          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] text-brand-900 text-balance sm:text-6xl">
            Laboratorio
            <span className="block italic text-tierra-600">Vivo</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-800/80 text-pretty">
            Nuestro vivero es también un laboratorio a cielo abierto: riego inteligente, compost
            propio y un huerto experimental donde probamos cómo cultivar mejor con menos agua, en el
            clima de Santa Cruz.
          </p>
        </div>

        <div className="hairline-frame relative mt-12 aspect-[16/9] overflow-hidden rounded-4xl bg-brand-900 shadow-lift">
          <Image
            src="/images/editorial/laboratorio-vivo.jpg"
            alt="Sistema de riego inteligente entre los plantines del vivero Rizoma del Sur"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 scrim-bottom" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="max-w-xl text-sm leading-snug text-crema-100/85 sm:text-base">
              El agua llega gota a gota a cada raíz, según lo que miden los sensores de cada cama de
              cultivo.
            </p>
          </div>
        </div>
      </section>

      {/* ————————————————— Intro: riego inteligente ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-tierra-600">Riego inteligente</p>
            <span className="rule-grow mt-4" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
              El vivero que se riega solo
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-brand-800/80">
              <p>
                Pequeños <strong className="font-semibold text-brand-900">sensores de humedad</strong>{' '}
                enterrados junto a las raíces “escuchan” la tierra las veinticuatro horas. Cuando la
                humedad baja del nivel ideal para cada cultivo, el sistema lo detecta al instante.
              </p>
              <p>
                Ahí entra el <strong className="font-semibold text-brand-900">riego automatizado</strong>:
                las válvulas se abren y cierran solas y el agua llega gota a gota a cada planta, sin
                mojar las hojas ni desperdiciar ni una gota en los caminos.
              </p>
              <p>
                Y todo se maneja con <strong className="font-semibold text-brand-900">control remoto</strong>{' '}
                desde el celular: vemos la humedad de cada zona en tiempo real, encendemos o apagamos
                el riego a distancia y recibimos alertas si algo se sale de lo normal.
              </p>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-oro-300/50 bg-oro-300/40 shadow-soft">
            {[
              ['Hasta 50%', 'menos agua que el riego tradicional por horario'],
              ['24 h', 'de lectura continua de la humedad del suelo'],
              ['1 app', 'para ver y controlar cada zona a distancia'],
            ].map(([n, t]) => (
              <div key={n} className="bg-crema-50 p-8">
                <p className="font-serif text-5xl font-semibold text-brand-700">{n}</p>
                <p className="mt-2 text-sm text-brand-800/80">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ————————————————— Grid de capacidades ————————————————— */}
      <section className="bg-brand-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-tierra-600">Cómo trabajamos</p>
            <span className="rule-grow mt-4" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
              Tres pilares de un cultivo biológico
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-brand-800/80">
              Lo que probamos en el laboratorio se convierte en plantas más sanas y en prácticas que
              cualquier familia puede llevar a su propio lote.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capacidades.map((c) => (
              <article
                key={c.titulo}
                className="hairline-frame relative overflow-hidden rounded-2xl bg-crema-50 p-8 shadow-soft transition-shadow duration-500 hover:shadow-lift"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-brand-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={c.icono} />
                  </svg>
                </div>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-brand-900">{c.titulo}</h3>
                <p className="mt-3 text-base leading-relaxed text-brand-800/80">{c.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ————————————————— Laboratorio abierto ————————————————— */}
      <section className="relative overflow-hidden bg-brand-900 py-24 text-crema-50">
        <div
          className="pattern-roots pointer-events-none absolute inset-0 opacity-[0.05]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-oro-300">Un laboratorio abierto</p>
            <span className="rule-grow mt-4 bg-oro-400" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Ven a verlo “respirar”
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-crema-100/85">
              El Laboratorio Vivo no es una vitrina cerrada: puedes visitarlo, tocar los sensores y
              ver en pantalla cómo el huerto pide y recibe su agua. Queremos que las familias de
              Prados del Sur aprendan con nosotros y se animen a automatizar sus propios jardines.
            </p>
          </div>
        </div>
      </section>

      {/* ————————————————— CTA de cierre ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="hairline-frame relative overflow-hidden rounded-4xl bg-brand-800 px-8 py-16 text-center text-crema-50 shadow-lift sm:px-16">
          <div
            className="pattern-roots pointer-events-none absolute inset-0 opacity-[0.05]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow text-oro-300">Del laboratorio a tu lote</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
              Plantas criadas con esta ciencia
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-crema-100/85">
              Cada plantín de la tienda crece con riego inteligente y compost propio. Llévate lo que
              probamos aquí, o ven al vivero y te mostramos el sistema funcionando.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/tienda"
                className="rounded-full bg-crema-50 px-7 py-3.5 font-semibold text-brand-800 transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                Explorar la tienda
              </Link>
              <Link
                href="/visitanos"
                className="rounded-full border border-crema-100/40 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-crema-50/10"
              >
                Planifica tu visita
              </Link>
            </div>
            <p className="mt-6 text-sm text-crema-100/70">
              {SITE.addressLine} · {SITE.locality}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
