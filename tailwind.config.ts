import type { Config } from 'tailwindcss';

/**
 * Paleta híbrida: los cinco colores especificados para el curso son los anclas
 * semánticas (bosque-700, salvia-400, crema-100, tierra-400, tinta-900); el
 * resto de cada escala se deriva de ellos manteniendo el tono, para tener
 * suficientes pasos con los que construir superficies, bordes y estados.
 *
 * El acento metálico de los filetes editoriales lo da `tierra`, no un dorado
 * aparte, para no salirnos de los cinco colores acordados.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Verde bosque — color primario. #2F5233 es el 700.
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
        // Verde salvia — acentos suaves, estados apagados. #8BA888 es el 400.
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
        // Tierra — acento cálido, filetes, badges. #B08968 es el 400.
        tierra: {
          50: '#faf6f2',
          100: '#f3ebe1',
          200: '#e6d5c2',
          300: '#d3b79b',
          400: '#B08968',
          500: '#9c7153',
          600: '#825b43',
          700: '#6a4937',
          800: '#573c2f',
          900: '#48332a',
        },
        // Crema hueso — fondo en modo claro. #F5F1E7 es el 100.
        crema: {
          DEFAULT: '#F5F1E7',
          50: '#fbf9f4',
          100: '#F5F1E7',
          200: '#ebe4d3',
          300: '#ddd2b9',
        },
        // Tinta — texto en claro, fondo en oscuro. #1E2A1B es el 900.
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
      },
      fontFamily: {
        serif: ['var(--fuente-display)', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--fuente-cuerpo)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        marca: '0.28em',
      },
      maxWidth: {
        lectura: '72ch',
      },
      boxShadow: {
        suave: '0 1px 2px rgba(30,42,27,0.04), 0 8px 24px -12px rgba(30,42,27,0.18)',
        realce: '0 2px 4px rgba(30,42,27,0.06), 0 24px 48px -20px rgba(30,42,27,0.30)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
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
        'aparecer-arriba': 'aparecer-arriba 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'crecer-linea': 'crecer-linea 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
