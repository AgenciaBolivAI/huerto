import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import type { Category, Product } from '@/lib/types';

// NOTA: este módulo usa el cliente servidor de Supabase (next/headers), por lo
// que solo debe importarse desde Server Components. Los tipos y constantes
// compartidas viven en lib/types.ts, seguro para el navegador.

// ---------------------------------------------------------------------------
// Datos locales de respaldo (mismos datos que supabase/seed.sql).
// Se usan cuando Supabase no está configurado, para que toda la app funcione.
// ---------------------------------------------------------------------------

export const fallbackCategories: Category[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Cercos vivos',
    slug: 'cercos-vivos',
    description:
      'Plantines para cercos naturales: privacidad, sombra y belleza para tu lote en Prados del Sur.',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Sombra y palmeras',
    slug: 'sombra-palmeras',
    description:
      'Árboles de sombra y palmeras ornamentales, ideales para jardines y aceras de la urbanización.',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Frutales',
    slug: 'frutales',
    description:
      'Frutales injertados y criollos adaptados al clima cruceño para cosechar en tu propio patio.',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Hierbas y vegetales de especialidad',
    slug: 'especialidad-caribe',
    description:
      'Cultivos caribeños poco comunes en Bolivia: yautía, culantro, ají dulce y gandul, frescos del huerto.',
  },
];

const C = {
  cercos: '11111111-1111-4111-8111-111111111111',
  sombra: '22222222-2222-4222-8222-222222222222',
  frutales: '33333333-3333-4333-8333-333333333333',
  caribe: '44444444-4444-4444-8444-444444444444',
};

function p(
  id: string,
  categoryId: string,
  name: string,
  slug: string,
  description: string,
  priceRetail: number,
  priceB2b: number,
  stock: number,
  imageUrl: string,
  unit: string,
): Product {
  return {
    id,
    category_id: categoryId,
    name,
    slug,
    description,
    price_retail: priceRetail,
    price_b2b: priceB2b,
    stock,
    image_url: imageUrl,
    unit,
    is_active: true,
  };
}

export const fallbackProducts: Product[] = [
  // Cercos vivos
  p('a0000000-0000-4000-8000-000000000001', C.cercos, 'Eugenia', 'eugenia',
    'Plantín de 40–60 cm. Crecimiento rápido y follaje denso, perfecto para cercos de privacidad.',
    35, 28, 40, '/images/categorias/cercos-vivos.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000002', C.cercos, 'Duranta', 'duranta',
    'Plantín de 40 cm. Hoja verde dorada y floración lila; responde muy bien a la poda.',
    30, 24, 55, '/images/categorias/cercos-vivos.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000003', C.cercos, 'Viburno', 'viburno',
    'Plantín de 50–70 cm. Cerco elegante de hoja brillante, muy resistente al sol cruceño.',
    45, 38, 22, '/images/categorias/cercos-vivos.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000004', C.cercos, 'Ligustro', 'ligustro',
    'Plantín de 50 cm. Clásico para cercos formales, de poda fácil y crecimiento parejo.',
    32, 26, 8, '/images/categorias/cercos-vivos.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000005', C.cercos, 'Jazmín de la India (murraya)', 'jazmin-de-la-india',
    'Plantín de 40 cm. Cerco aromático con flores blancas perfumadas casi todo el año.',
    38, 30, 3, '/images/categorias/cercos-vivos.jpg', 'unidad'),

  // Sombra y palmeras
  p('a0000000-0000-4000-8000-000000000006', C.sombra, 'Tipuana (tipa)', 'tipuana',
    'Árbol de ~2 m en bolsa de 20 L. Sombra amplia y floración amarilla espectacular.',
    180, 150, 15, '/images/categorias/sombra-palmeras.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000007', C.sombra, 'Jacarandá', 'jacaranda',
    'Árbol de ~2 m. Copa amplia y flores lila en primavera; ideal para aceras y jardines.',
    200, 170, 12, '/images/categorias/sombra-palmeras.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000008', C.sombra, 'Palmera real', 'palmera-real',
    'Palmera de 1,5–2 m de estampa. Imponente para entradas y avenidas internas.',
    350, 300, 9, '/images/categorias/sombra-palmeras.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000009', C.sombra, 'Chorisia (palo borracho)', 'chorisia',
    'Árbol de ~1,8 m. Floración rosada vistosa y tronco característico; muy ornamental.',
    220, 190, 7, '/images/categorias/sombra-palmeras.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000010', C.sombra, 'Toborochi', 'toborochi',
    'Árbol nativo de ~1,8 m. Flor rosada emblemática de Santa Cruz, de bajo mantenimiento.',
    240, 200, 4, '/images/categorias/sombra-palmeras.jpg', 'unidad'),

  // Frutales
  p('a0000000-0000-4000-8000-000000000011', C.frutales, 'Mango injertado', 'mango-injertado',
    'Injerto de 80 cm–1 m. Variedades dulces adaptadas; fruta en 2–3 años.',
    90, 75, 20, '/images/categorias/frutales.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000012', C.frutales, 'Limón criollo', 'limon-criollo',
    'Plantín injertado de 70 cm. Producción casi todo el año, ideal para patio familiar.',
    70, 58, 25, '/images/categorias/frutales.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000013', C.frutales, 'Aguacate (palta)', 'aguacate',
    'Injerto de 1 m. Variedad de pulpa cremosa; requiere buen drenaje.',
    110, 95, 14, '/images/categorias/frutales.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000014', C.frutales, 'Guayaba', 'guayaba',
    'Plantín de 70 cm. Fruta aromática y muy productiva, de rápido crecimiento.',
    75, 62, 18, '/images/categorias/frutales.jpg', 'unidad'),
  p('a0000000-0000-4000-8000-000000000015', C.frutales, 'Mandarina', 'mandarina',
    'Injerto de 70 cm. Fruta dulce y fácil de pelar, favorita de los niños.',
    80, 68, 6, '/images/categorias/frutales.jpg', 'unidad'),

  // Hierbas y vegetales de especialidad (caribeños)
  p('a0000000-0000-4000-8000-000000000016', C.caribe, 'Yautía (cormos de siembra)', 'yautia',
    'Cormos seleccionados listos para sembrar. Tubérculo base de la cocina caribeña.',
    25, 15, 30, '/images/categorias/especialidad-caribe.jpg', 'paquete de 5'),
  p('a0000000-0000-4000-8000-000000000017', C.caribe, 'Culantro / recao', 'culantro-recao',
    'Plantín en maceta. Hoja aromática esencial para sofritos y caldos caribeños.',
    15, 9, 60, '/images/categorias/especialidad-caribe.jpg', 'maceta'),
  p('a0000000-0000-4000-8000-000000000018', C.caribe, 'Ají dulce', 'aji-dulce',
    'Plantín en maceta. Ají aromático sin picor, imprescindible en la cocina boricua y dominicana.',
    12, 7, 48, '/images/categorias/especialidad-caribe.jpg', 'maceta'),
  p('a0000000-0000-4000-8000-000000000019', C.caribe, 'Gandul (guandú)', 'gandul',
    'Plantines y semilla certificada. Leguminosa estrella del arroz con gandules.',
    18, 10, 35, '/images/categorias/especialidad-caribe.jpg', 'maceta'),
];

// ---------------------------------------------------------------------------
// Acceso a datos con degradación elegante: Supabase si está configurado,
// datos locales si no (o si la consulta falla).
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return fallbackCategories;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error || !data || data.length === 0) return fallbackCategories;
    return data as Category[];
  } catch {
    return fallbackCategories;
  }
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return fallbackProducts;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error || !data || data.length === 0) return fallbackProducts;
    return data as Product[];
  } catch {
    return fallbackProducts;
  }
}
