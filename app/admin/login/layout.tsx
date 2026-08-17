import type { Metadata } from 'next';

// Layout servidor solo para exportar metadata (la página es un Client Component)
export const metadata: Metadata = {
  title: 'Acceso administración',
  description: 'Ingreso al panel de administración de Rizoma del Sur.',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
