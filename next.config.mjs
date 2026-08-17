/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Los placeholders del catálogo son SVG locales en /public/images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
