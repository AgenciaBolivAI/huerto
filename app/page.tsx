import Image from 'next/image';
import Link from 'next/link';
import { obtenerCurso } from '@/lib/aula/contenido';
import { SITE } from '@/lib/site';

export const metadata = {
  description:
    'Vivero y huerto biológico dentro de Prados del Sur, Santa Cruz. Cercos vivos, árboles de sombra, palmeras, frutales injertados y cultivos caribeños, con retiro o entrega en tu lote.',
  alternates: { canonical: '/' },
};

const categorias = [
  {
    slug: 'cercos-vivos',
    name: 'Cercos vivos',
    blurb: 'Privacidad y verdor para tu lote: eugenia, duranta, viburno y más.',
    image: '/images/categorias/cercos-vivos.jpg',
  },
  {
    slug: 'sombra-palmeras',
    name: 'Sombra y palmeras',
    blurb: 'Tipas, jacarandás y palmeras que definen jardines y avenidas.',
    image: '/images/categorias/sombra-palmeras.jpg',
  },
  {
    slug: 'frutales',
    name: 'Frutales injertados',
    blurb: 'Mango, cítricos, palta y guayaba para cosechar en tu patio.',
    image: '/images/categorias/frutales.jpg',
  },
  {
    slug: 'especialidad-caribe',
    name: 'Sabores caribeños',
    blurb: 'Culantro, ají dulce, yautía y gandul, únicos en Bolivia.',
    image: '/images/categorias/especialidad-caribe.jpg',
  },
];

const valores = ['Sin agroquímicos', 'Compost propio', 'Riego inteligente', 'Entrega en tu lote'];

export default function HomePage() {
  // Las cifras del aula se leen del contenido y no se escriben a mano: el curso
  // crece, y un número desactualizado en la portada es lo que hace que nadie se
  // crea el resto.
  const curso = obtenerCurso();
  const lecciones = curso.reduce((n, m) => n + m.lecciones.length, 0);
  const horas = Math.round(
    curso.reduce((n, m) => n + m.lecciones.reduce((s, l) => s + l.meta.duracionMin, 0), 0) / 60,
  );

  return (
    <div>
      {/* ————————————————— Hero ————————————————— */}
      <section className="relative isolate min-h-[86vh] overflow-hidden">
        <Image
          src="/images/editorial/hero.jpg"
          alt="Vivero Rizoma del Sur al amanecer, hileras de plantines en macetas de terracota"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 scrim-green" />
        <div className="absolute inset-0 bg-brand-950/20" />

        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-center px-6 py-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow text-oro-300">Prados del Sur · Ruta 9 sur · Santa Cruz</p>
            <span className="rule-grow mt-4 bg-oro-400" />
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] text-crema-50 text-balance sm:text-6xl lg:text-7xl">
              Raíces que hacen
              <span className="block italic text-oro-200">de tu lote un hogar</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-crema-100/90 text-pretty">
              Vivero y huerto biológico dentro de tu urbanización. Plantines, cercos vivos, árboles
              de sombra, frutales y cultivos caribeños únicos en Bolivia — a pasos de tu nuevo hogar.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/tienda"
                className="rounded-full bg-crema-50 px-7 py-3.5 font-semibold text-brand-800 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                Explorar la tienda
              </Link>
              <Link
                href="/visitanos"
                className="rounded-full border border-crema-100/40 px-7 py-3.5 font-semibold text-crema-50 backdrop-blur-sm transition-colors hover:bg-crema-50/10"
              >
                Cómo llegar
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-crema to-transparent" />
      </section>

      {/* ————————————————— Franja de valores ————————————————— */}
      <section className="border-y border-oro-300/40 bg-crema-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 text-center">
          {valores.map((v, i) => (
            <span key={v} className="flex items-center gap-10 text-sm font-medium text-brand-700">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-oro-400" />
                {v}
              </span>
              {i < valores.length - 1 && <span className="hidden text-oro-300 sm:inline">·</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ————————————————— Historia ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-tierra-600">Nuestra historia</p>
            <span className="rule-grow mt-4" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
              Un vivero de barrio con raíces biológicas
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-brand-800/80">
              <p>
                Rizoma del Sur nace con Prados del Sur: mientras la urbanización crece hacia sus
                2.500 viviendas, nosotros cultivamos las plantas que convertirán cada lote en un
                hogar verde. Sin agroquímicos, con compost propio y riego inteligente.
              </p>
              <p>
                Además del vivero, mantenemos un huerto de cultivos caribeños poco comunes en
                Bolivia — yautía, culantro, ají dulce y gandul — que abastece a los restaurantes del
                Club House y a las ferias agroecológicas de Santa Cruz.
              </p>
            </div>
            <p className="mt-8 font-serif text-xl italic text-brand-600">“{SITE.tagline}.”</p>
          </div>

          <div className="hairline-frame relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-900 shadow-lift">
            <Image
              src="/images/brand/letrero-entrada.jpg"
              alt="Letrero de entrada de Rizoma del Sur"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ————————————————— Categorías ————————————————— */}
      <section className="bg-brand-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-tierra-600">El catálogo</p>
              <span className="rule-grow mt-4" />
              <h2 className="mt-6 max-w-xl font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
                Todo lo que tu jardín necesita
              </h2>
            </div>
            <Link
              href="/tienda"
              className="group inline-flex items-center gap-2 font-semibold text-brand-700 transition-colors hover:text-brand-900"
            >
              Ver la tienda completa
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categorias.map((c) => (
              <Link
                key={c.slug}
                href="/tienda"
                className="group relative overflow-hidden rounded-2xl bg-brand-900 shadow-soft transition-all duration-500 hover:shadow-lift"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 scrim-bottom" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-serif text-2xl font-semibold text-crema-50">{c.name}</h3>
                  <p className="mt-1 text-sm leading-snug text-crema-100/85">{c.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-oro-300">
                    Ver plantines
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ————————————————— Ubicación / Prados del Sur ————————————————— */}
      <section className="relative overflow-hidden bg-brand-900 py-24 text-crema-50">
        <div className="pattern-roots pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-oro-300">Dentro de la urbanización</p>
            <span className="rule-grow mt-4 bg-oro-400" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              A pasos de tu nuevo hogar
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-crema-100/85">
              Estamos junto al Club House, sobre la Ruta 9 al sur de Santa Cruz de la Sierra. Si
              estás construyendo tu casa, retira tus plantas en el vivero o recíbelas directamente
              en tu lote.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-brand-700 bg-brand-700 sm:grid-cols-3">
            {[
              ['2.500', 'viviendas proyectadas en la urbanización'],
              ['1.500', 'lotes vendidos y familias construyendo'],
              ['1 min', 'del Club House, que inaugura muy pronto'],
            ].map(([n, t]) => (
              <div key={n} className="bg-brand-900 p-8">
                <p className="font-serif text-5xl font-semibold text-oro-300">{n}</p>
                <p className="mt-2 text-sm text-crema-100/80">{t}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/tienda"
              className="rounded-full bg-crema-50 px-7 py-3.5 font-semibold text-brand-800 transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              Compra tus plantas
            </Link>
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-crema-100/40 px-7 py-3.5 font-semibold text-crema-50 transition-colors hover:bg-crema-50/10"
            >
              Abrir en Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ————————————————— Laboratorio vivo ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="hairline-frame relative order-2 aspect-[16/10] overflow-hidden rounded-2xl bg-brand-900 shadow-lift lg:order-1">
            <Image
              src="/images/editorial/laboratorio-vivo.jpg"
              alt="Sistema de riego inteligente entre plantines del vivero"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow text-tierra-600">Laboratorio Vivo</p>
            <span className="rule-grow mt-4" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
              Tecnología que cuida cada raíz
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-brand-800/80">
              Sensores de humedad, riego automatizado y control remoto: nuestro vivero es también un
              laboratorio vivo donde probamos cómo cultivar mejor con menos agua, en el clima
              cruceño.
            </p>
            <Link
              href="/laboratorio-vivo"
              className="group mt-8 inline-flex items-center gap-2 font-semibold text-brand-700 transition-colors hover:text-brand-900"
            >
              Conoce el laboratorio
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ————————————————— Misión / Aula —————————————————
          Por qué existe el proyecto, y la puerta a la parte educativa. Va antes
          de Comunidad porque es lo que da sentido a todo lo anterior. */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="eyebrow">Nuestra misión</p>
            <span className="rule-grow mt-2" />
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
              Un proyecto comunitario, gratuito y abierto.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-brand-800/80">
              Rizoma del Sur no es solo un vivero. Es un proyecto comunitario para que la zona pueda
              aprender y desarrollarse. Solo brindamos herramientas que faciliten el progreso de la
              comunidad, y entendemos que ese progreso{' '}
              <strong className="font-semibold text-brand-900">empieza con la educación</strong>.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-brand-800/80">
              Por eso publicamos un curso entero, libre y sin costo:{' '}
              <strong className="font-semibold text-brand-900">
                {curso.length} módulos y {lecciones} lecciones
              </strong>{' '}
              que van del suelo y las plantas a la electrónica, la carpintería, la soldadura, la
              plomería, los motores, el dinero de la casa y la salud de la familia. La ciencia y la
              práctica, no las recetas. <strong className="font-semibold text-brand-900">No hace
              falta tener tierra</strong> para que sirva.
            </p>

            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-x-6 gap-y-4 border-t border-brand-200 pt-6">
              {[
                { n: curso.length, t: 'módulos' },
                { n: lecciones, t: 'lecciones' },
                { n: `${horas} h`, t: 'de lectura' },
              ].map((x) => (
                <div key={x.t}>
                  <dt className="font-serif text-3xl font-semibold text-brand-900">{x.n}</dt>
                  <dd className="mt-1 text-sm text-brand-800/60">{x.t}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/aula"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-crema-50 transition-transform hover:-translate-y-0.5 hover:bg-brand-800"
            >
              Entrar al aula, es gratis
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="hairline-frame overflow-hidden rounded-4xl">
            <img
              src="/images/editorial/laboratorio-vivo.jpg"
              alt="Hileras de plantines jóvenes bajo malla de sombra en el vivero de Rizoma del Sur"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ————————————————— Comunidad ————————————————— */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="hairline-frame relative overflow-hidden rounded-4xl bg-brand-800 px-8 py-16 text-center text-crema-50 shadow-lift sm:px-16">
          <div className="pattern-roots pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow text-oro-300">Comunidad</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
              Súmate a {SITE.handle}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-crema-100/85">
              Seguimos de cerca a cada familia que siembra con nosotros: novedades del vivero,
              cosechas del huerto caribeño, talleres y los avances de la futura cafetería.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-crema-50 px-6 py-3 text-sm font-semibold text-brand-800 transition-transform hover:-translate-y-0.5"
              >
                Instagram
              </a>
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-crema-100/40 px-6 py-3 text-sm font-semibold text-crema-50 transition-colors hover:bg-crema-50/10"
              >
                Facebook
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-crema-100/40 px-6 py-3 text-sm font-semibold text-crema-50 transition-colors hover:bg-crema-50/10"
              >
                Escríbenos por Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
