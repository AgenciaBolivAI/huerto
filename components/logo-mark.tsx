// Isotipo vectorial de Rizoma del Sur: raíces descendentes entrelazadas con un
// anillo de nodos (red rizomática). Dibujado a mano para uso en UI — hereda el
// color vía currentColor (pino sobre marfil, o crema sobre pino).
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Anillo de nodos */}
      <circle cx="15" cy="17" r="2.6" />
      <circle cx="49" cy="17" r="2.6" />
      <circle cx="8" cy="31" r="2.6" />
      <circle cx="56" cy="31" r="2.6" />
      <circle cx="13" cy="45" r="2.6" />
      <circle cx="51" cy="45" r="2.6" />
      <circle cx="24" cy="55" r="2.6" />
      <circle cx="40" cy="55" r="2.6" />
      <circle cx="32" cy="60" r="2.6" />
      {/* Conexiones del anillo (abierto arriba, donde entra el tronco) */}
      <path d="M14 19.4 9 28.7" />
      <path d="M50 19.4 55 28.7" />
      <path d="M8.9 33.5 12.2 42.6" />
      <path d="M55.1 33.5 51.8 42.6" />
      <path d="M14.9 47 22 53.3" />
      <path d="M49.1 47 42 53.3" />
      <path d="M26.3 56.7 29.8 59" />
      <path d="M37.7 56.7 34.2 59" />
      {/* Ligas de los nodos superiores hacia el tronco */}
      <path d="M16.8 15.4 25 10.5" />
      <path d="M47.2 15.4 39 10.5" />
      {/* Tronco y raíz principal */}
      <path d="M32 5.5 C31.2 12 33 18 32 25 C31 34 32.2 43 32 51.5" />
      {/* Brazos laterales */}
      <path d="M30.5 11.5 C25.5 15.5 22.5 20.5 19.5 26.5 C17.5 31 16.3 36 15.4 40.5" />
      <path d="M33.5 11.5 C38.5 15.5 41.5 20.5 44.5 26.5 C46.5 31 47.7 36 48.6 40.5" />
      {/* Raíces medias */}
      <path d="M31 21 C28 26 25.8 30.5 24 36 C22.6 40 21.6 44.5 21 48" />
      <path d="M33 21 C36 26 38.2 30.5 40 36 C41.4 40 42.4 44.5 43 48" />
      {/* Raíces internas */}
      <path d="M31.4 31 C29.4 36 28.3 40 27.5 44.5 C27 47 26.8 49.5 26.7 51.5" />
      <path d="M32.6 31 C34.6 36 35.7 40 36.5 44.5 C37 47 37.2 49.5 37.3 51.5" />
      {/* Radículas laterales */}
      <path d="M20.5 23.5 C17.5 24.5 14.8 25 12 25" />
      <path d="M43.5 23.5 C46.5 24.5 49.2 25 52 25" />
    </svg>
  );
}
