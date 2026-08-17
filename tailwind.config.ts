import type { Config } from 'tailwindcss';

const config: Config = {
  // El aula (`/aula`) tiene modo oscuro; la tienda es solo clara. Con la
  // estrategia `class`, `dark:` se resuelve contra cualquier ancestro, así que
  // basta con marcar el envoltorio del aula y el resto del sitio no se entera.
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Paleta del aula ────────────────────────────────────────────────
        // El curso llegó con sus propias anclas semánticas. Se conservan tal
        // cual para no repintar 130 lecciones: `bosque` es su verde primario,
        // `salvia` el acento suave y `tinta` el texto y el fondo oscuro.
        // `tierra` y `crema` no se duplican: el curso usa las del sitio, que
        // son el mismo concepto y prácticamente el mismo valor.
        bosque: {
          50: '#f1f7f2',
          100: '#dfeee2',
          200: '#c0ddc6',
          300: '#94c29f',
          400: '#63a173',
          500: '#3f8153',
          600: '#2f6741',
          700: '#2F5233',
          800: '#26412a',
          900: '#1d3221',
          950: '#0f1c11',
        },
        salvia: {
          50: '#f4f7f3',
          100: '#e7ede6',
          200: '#d0dccf',
          300: '#b1c4af',
          400: '#8BA888',
          500: '#6f8f6d',
          600: '#587356',
          700: '#475c46',
          800: '#3b4b3a',
          900: '#313e31',
        },
        tinta: {
          50: '#f2f4f1',
          100: '#e3e8e1',
          200: '#c7d1c4',
          300: '#a0b09c',
          400: '#748a70',
          500: '#546a50',
          600: '#42553f',
          700: '#354434',
          800: '#2a382a',
          900: '#1E2A1B',
          950: '#131a11',
        },
        // Verde pino de la marca (letrero de entrada). CTA en 600/700, secciones
        // oscuras en 800/900. Reemplaza la paleta plana anterior conservando las
        // mismas claves (brand-*) para no romper clases existentes.
        brand: {
          50: '#f0f5ef',
          100: '#dbe8dc',
          200: '#b8d0bd',
          300: '#8db397',
          400: '#5f9070',
          500: '#3d7150',
          600: '#2c5a3c',
          700: '#21492f',
          800: '#1f3d2b',
          900: '#152a1d',
          950: '#0c1a11',
        },
        // Terracota / tierra caribeña — acento cálido para detalles y sellos.
        // Terracota / tierra caribeña. Los pasos 50, 800 y 900 los añadió el
        // aula, que necesita el extremo claro para fondos y el oscuro para
        // texto sobre crema.
        tierra: {
          50: '#faf6f2',
          100: '#f2e6d8',
          200: '#e6d0b8',
          300: '#d9a878',
          400: '#cb8551',
          500: '#c06b3d',
          600: '#a5542c',
          700: '#834320',
          800: '#6a371c',
          900: '#552d18',
        },
        // Oro apagado — filetes y marcos finos (lenguaje de señalética).
        oro: {
          200: '#ece0bf',
          300: '#ddc484',
          400: '#cba14f',
          500: '#b5872f',
        },
        crema: {
          DEFAULT: '#f7f2e7',
          50: '#faf6ec',
          100: '#f4efe1',
          200: '#eae0cb',
        },
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Fraunces', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
        brand: '0.32em',
        // Versalitas del aula (algo más cerradas que las del sitio).
        marca: '0.28em',
      },
      maxWidth: {
        prose: '68ch',
        // Ancho de lectura de una lección.
        lectura: '72ch',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,42,29,0.04), 0 8px 24px -12px rgba(20,42,29,0.18)',
        lift: '0 2px 4px rgba(20,42,29,0.06), 0 24px 48px -20px rgba(20,42,29,0.30)',
        // Equivalentes del aula, sobre su propio verde de sombra.
        suave: '0 1px 2px rgba(30,42,27,0.04), 0 8px 24px -12px rgba(30,42,27,0.18)',
        realce: '0 2px 4px rgba(30,42,27,0.06), 0 24px 48px -20px rgba(30,42,27,0.30)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'grow-line': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        // Las mismas dos del aula, con sus nombres en español.
        'aparecer-arriba': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'crecer-linea': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'grow-line': 'grow-line 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'aparecer-arriba': 'aparecer-arriba 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'crecer-linea': 'crecer-linea 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
