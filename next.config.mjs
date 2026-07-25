/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    /**
     * `sharp` solo lo usa `scripts/optimizar-imagenes.mjs`, que se ejecuta a
     * mano y nunca desde la aplicación. Son ~29 MB de binarios nativos que, si
     * no se excluyen, Next recorre en el paso de trazado de dependencias y
     * dejan el build inservible de lento (peor todavía con el proyecto dentro
     * de una carpeta sincronizada por OneDrive).
     */
    outputFileTracingExcludes: {
      '*': ['node_modules/sharp/**', 'node_modules/@img/**'],
    },
  },
};

export default nextConfig;
