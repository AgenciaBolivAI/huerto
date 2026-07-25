'use client';

import { useEffect, useRef } from 'react';

import {
  accionAcumularTiempo,
  accionGuardarScroll,
  accionRegistrarVisita,
} from '@/lib/acciones';

const INTERVALO_VOLCADO_MS = 30_000;
/** Por encima de esto se asume que la pestaña quedó abierta sin nadie leyendo. */
const MAX_SEGUNDOS_POR_TRAMO = 90;

/**
 * Registra la actividad del estudiante en la lección: la visita, el tiempo
 * realmente dedicado y hasta dónde llegó leyendo.
 *
 * El tiempo solo corre con la pestaña visible y se acota por tramo, para que
 * dejar el navegador abierto toda la noche no invente cinco horas de estudio.
 */
export function RegistradorLeccion({
  leccionId,
  moduloId,
  scrollInicial,
}: {
  leccionId: string;
  moduloId: string;
  scrollInicial: number;
}) {
  const ultimoLatido = useRef<number>(Date.now());
  const acumulado = useRef(0);
  const scrollMaximo = useRef(scrollInicial);

  useEffect(() => {
    void accionRegistrarVisita(leccionId, moduloId);
  }, [leccionId, moduloId]);

  // Restaura el punto de lectura anterior. Se espera un instante a que el MDX
  // termine de pintar para que la altura de la página ya sea la definitiva.
  useEffect(() => {
    if (scrollInicial < 5) return;
    const t = setTimeout(() => {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto > 0) window.scrollTo({ top: (alto * scrollInicial) / 100, behavior: 'smooth' });
    }, 350);
    return () => clearTimeout(t);
  }, [scrollInicial]);

  useEffect(() => {
    function acumularTramo() {
      const ahora = Date.now();
      const transcurrido = Math.min((ahora - ultimoLatido.current) / 1000, MAX_SEGUNDOS_POR_TRAMO);
      ultimoLatido.current = ahora;
      if (document.visibilityState === 'visible') acumulado.current += transcurrido;
    }

    function volcar() {
      acumularTramo();
      const segundos = Math.round(acumulado.current);
      if (segundos >= 5) {
        acumulado.current = 0;
        void accionAcumularTiempo(leccionId, segundos);
      }
      if (scrollMaximo.current > scrollInicial) {
        void accionGuardarScroll(leccionId, scrollMaximo.current);
      }
    }

    function alCambiarVisibilidad() {
      if (document.visibilityState === 'hidden') volcar();
      else ultimoLatido.current = Date.now();
    }

    function alDesplazar() {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto <= 0) return;
      const pct = Math.round((window.scrollY / alto) * 100);
      if (pct > scrollMaximo.current) scrollMaximo.current = pct;
    }

    const intervalo = setInterval(volcar, INTERVALO_VOLCADO_MS);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    window.addEventListener('scroll', alDesplazar, { passive: true });
    // pagehide cubre el cierre de pestaña y la navegación hacia atrás, casos en
    // los que 'beforeunload' no siempre llega a dispararse.
    window.addEventListener('pagehide', volcar);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('scroll', alDesplazar);
      window.removeEventListener('pagehide', volcar);
      volcar();
    };
  }, [leccionId, scrollInicial]);

  return null;
}
