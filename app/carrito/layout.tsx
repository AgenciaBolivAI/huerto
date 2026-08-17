import type { Metadata } from 'next';

// Layout servidor solo para exportar metadata (la página es un Client Component)
export const metadata: Metadata = {
  title: 'Carrito',
  description: 'Revisa tu pedido de plantas y productos del vivero Rizoma del Sur.',
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
