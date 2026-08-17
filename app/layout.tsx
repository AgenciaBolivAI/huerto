import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/cart-provider';
import { ChromeSitio } from '@/components/chrome-sitio';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SITE } from '@/lib/site';

const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Rizoma del Sur — Vivero y huerto biológico en Santa Cruz',
    template: '%s · Rizoma del Sur',
  },
  description:
    'Vivero y huerto biológico dentro de la urbanización Prados del Sur, Ruta 9 sur, Santa Cruz de la Sierra. Plantines de cercos vivos, árboles de sombra, palmeras, frutales injertados y cultivos caribeños. Retiro o entrega en tu lote. Síguenos como @rizomaDelSur.',
  applicationName: 'Rizoma del Sur',
  keywords: [
    'vivero Santa Cruz',
    'vivero Prados del Sur',
    'plantines Bolivia',
    'cercos vivos',
    'árboles de sombra',
    'palmeras ornamentales',
    'frutales injertados',
    'cultivos caribeños',
    'culantro recao',
    'ají dulce',
    'huerto biológico',
    'Rizoma del Sur',
    'rizomaDelSur',
  ],
  authors: [{ name: 'Rizoma del Sur' }],
  creator: 'Rizoma del Sur',
  publisher: 'Rizoma del Sur',
  category: 'shopping',
  formatDetection: { telephone: true, address: true },
  openGraph: {
    type: 'website',
    siteName: 'Rizoma del Sur',
    locale: 'es_BO',
    url: SITE.url,
    title: 'Rizoma del Sur — Vivero y huerto biológico en Santa Cruz',
    description:
      'Plantines, cercos vivos, árboles de sombra, frutales y cultivos caribeños dentro de Prados del Sur, Ruta 9 sur, Santa Cruz de la Sierra.',
    images: [
      { url: '/images/brand/og.jpg', width: 1200, height: 630, alt: 'Rizoma del Sur — vivero y huerto biológico' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rizoma del Sur — Vivero y huerto biológico',
    description:
      'Vivero biológico dentro de Prados del Sur, Santa Cruz. Cercos vivos, sombra, frutales y sabores caribeños.',
    images: ['/images/brand/og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#1f3d2b',
  colorScheme: 'light',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GardenStore',
  '@id': `${SITE.url}#business`,
  name: 'Rizoma del Sur',
  alternateName: '@rizomaDelSur',
  description:
    'Vivero y huerto biológico dentro de la urbanización Prados del Sur, Santa Cruz de la Sierra, Bolivia.',
  url: SITE.url,
  logo: `${SITE.url}/images/brand/emblema.jpg`,
  image: `${SITE.url}/images/brand/og.jpg`,
  priceRange: 'Bs',
  currenciesAccepted: 'BOB',
  areaServed: 'Santa Cruz de la Sierra, Bolivia',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Urbanización Prados del Sur, Ruta 9 sur',
    addressLocality: 'Santa Cruz de la Sierra',
    addressRegion: 'Santa Cruz',
    addressCountry: 'BO',
  },
  hasMap: SITE.mapUrl,
  sameAs: [SITE.instagram, SITE.facebook],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:00',
    },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '09:00', closes: '13:00' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <ChromeSitio cabecera={<Header />} pie={<Footer />}>
            {children}
          </ChromeSitio>
        </CartProvider>
      </body>
    </html>
  );
}
