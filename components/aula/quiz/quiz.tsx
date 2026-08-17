'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { accionAutoevaluar, accionRegistrarIntento } from '@/lib/aula/acciones';
import type { RespuestaRegistrada } from '@/lib/aula/progreso';
import type { Pregunta } from '@/lib/aula/tipos';

type Autoevaluacion = 'logrado' | 'parcial' | 'no_logrado';

interface IntentoPrevio {
  id: number;
  iniciadoEn: string;
  totalPreguntas: number;
  correctas: number | null;
  puntaje: number | null;
}

/** Respuesta en curso: índices marcados, booleano V/F, o texto libre. */
type Respuesta = number[] | boolean | string;

const ETIQUETA_AUTOEVAL: Record<Autoevaluacion, string> = {
  logrado: 'Lo tenía',
  parcial: 'A medias',
  no_logrado: 'No lo tenía',
};

export function Quiz({
  leccionId,
  preguntas,
  intentosPrevios,
}: {
  leccionId: string;
  preguntas: Pregunta[];
  intentosPrevios: IntentoPrevio[];
}) {
  const [respuestas, setRespuestas] = useState<Record<string, Respuesta>>({});
  const [enviado, setEnviado] = useState(false);
  const [intentoId, setIntentoId] = useState<number | null>(null);
  const [autoevaluaciones, setAutoevaluaciones] = useState<Record<string, Autoevaluacion>>({});
  const [pendiente, iniciarTransicion] = useTransition();
  const router = useRouter();

  const autocalificables = preguntas.filter((p) => p.tipo !== 'abierta');

  function esCorrecta(pregunta: Pregunta): boolean | null {
    const r = respuestas[pregunta.id];

    if (pregunta.tipo === 'verdadero_falso') {
      return typeof r === 'boolean' ? r === pregunta.respuesta : false;
    }
    if (pregunta.tipo === 'opcion_multiple') {
      const marcadas = Array.isArray(r) ? [...r].sort() : [];
      const esperadas = [...pregunta.correctas].sort();
      return (
        marcadas.length === esperadas.length && marcadas.every((v, i) => v === esperadas[i])
      );
    }
    return null; // las abiertas las califica el propio estudiante
  }

  const aciertos = enviado ? autocalificables.filter((p) => esCorrecta(p)).length : 0;

  function enviar() {
    const cargas: RespuestaRegistrada[] = preguntas.map((p) => {
      const r = respuestas[p.id];
      return {
        preguntaId: p.id,
        tipo: p.tipo,
        respuesta:
          p.tipo === 'abierta'
            ? typeof r === 'string'
              ? r
              : ''
            : JSON.stringify(r ?? null),
        correcta: esCorrecta(p),
        autoevaluacion: null,
      };
    });

    setEnviado(true);
    iniciarTransicion(async () => {
      // Sin base de datos configurada devuelve null: el quiz se corrige igual
      // en pantalla, solo que el intento no queda registrado.
      const id = await accionRegistrarIntento(leccionId, cargas);
      setIntentoId(id ?? null);
      router.refresh();
    });
  }

  function autoevaluar(preguntaId: string, valor: Autoevaluacion) {
    setAutoevaluaciones((prev) => ({ ...prev, [preguntaId]: valor }));
    if (intentoId !== null) {
      iniciarTransicion(async () => {
        await accionAutoevaluar(intentoId, preguntaId, valor);
      });
    }
  }

  function reiniciar() {
    setRespuestas({});
    setEnviado(false);
    setIntentoId(null);
    setAutoevaluaciones({});
  }

  const sinResponder = preguntas.filter((p) => respuestas[p.id] === undefined).length;

  return (
    <section id="quiz" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Comprobación</p>
          <span className="regla-crece mt-2" />
          <h2 className="mt-3.5 font-serif text-2xl font-semibold text-bosque-800 dark:text-crema-50">
            Quiz de la lección
          </h2>
        </div>
        {intentosPrevios.length > 0 && !enviado && (
          <p className="text-sm text-tinta-500 dark:text-crema-100/45">
            {intentosPrevios.length}{' '}
            {intentosPrevios.length === 1 ? 'intento previo' : 'intentos previos'} · mejor{' '}
            {Math.round(
              Math.max(...intentosPrevios.map((i) => i.puntaje ?? 0)) * 100,
            )}
            %
          </p>
        )}
      </div>

      {/* Resultado */}
      {enviado && (
        <div className="mt-6 rounded-2xl bg-bosque-700 p-6 text-crema-50 shadow-realce dark:bg-bosque-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-marca text-salvia-300">Resultado</p>
              <p className="mt-1.5 font-serif text-3xl font-semibold">
                {aciertos}
                <span className="text-xl text-crema-100/60"> / {autocalificables.length}</span>
              </p>
              <p className="mt-1 text-sm text-crema-100/70">
                preguntas de calificación automática
                {preguntas.length > autocalificables.length &&
                  ` · ${preguntas.length - autocalificables.length} abierta${
                    preguntas.length - autocalificables.length === 1 ? '' : 's'
                  } que autoevalúas tú`}
              </p>
            </div>
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-full bg-crema-50/15 px-5 py-2.5 text-sm font-semibold text-crema-50 transition-colors hover:bg-crema-50/25"
            >
              Repetir quiz
            </button>
          </div>
        </div>
      )}

      <ol className="mt-7 space-y-5">
        {preguntas.map((pregunta, i) => {
          const correcta = enviado ? esCorrecta(pregunta) : null;

          return (
            <li
              key={pregunta.id}
              className={`rounded-2xl bg-white/70 p-5 ring-1 transition-colors dark:bg-tinta-900/50 sm:p-6 ${
                enviado && correcta === true
                  ? 'ring-bosque-400 dark:ring-bosque-500/60'
                  : enviado && correcta === false
                    ? 'ring-red-300 dark:ring-red-500/40'
                    : 'ring-tinta-900/5 dark:ring-crema-100/10'
              }`}
            >
              <div className="flex gap-3.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-salvia-100 font-mono text-xs font-semibold text-bosque-700 dark:bg-white/5 dark:text-salvia-300">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-relaxed text-tinta-900 dark:text-crema-50">
                    {pregunta.enunciado}
                  </p>

                  {/* Opción múltiple */}
                  {pregunta.tipo === 'opcion_multiple' && (
                    <>
                      <p className="mt-1.5 text-xs text-tinta-400 dark:text-crema-100/35">
                        Marca todas las que correspondan — puede haber más de una.
                      </p>
                      <div className="mt-3.5 space-y-2">
                        {pregunta.opciones.map((opcion, idx) => {
                          const marcadas = (respuestas[pregunta.id] as number[]) ?? [];
                          const marcada = marcadas.includes(idx);
                          const esClave = pregunta.correctas.includes(idx);

                          return (
                            <label
                              key={idx}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl px-3.5 py-2.5 text-[0.94rem] transition-colors ${
                                enviado
                                  ? esClave
                                    ? 'bg-bosque-100 text-bosque-900 dark:bg-bosque-500/20 dark:text-salvia-200'
                                    : marcada
                                      ? 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
                                      : 'text-tinta-600 dark:text-crema-100/55'
                                  : marcada
                                    ? 'bg-salvia-100 text-tinta-900 dark:bg-white/10 dark:text-crema-50'
                                    : 'text-tinta-700 hover:bg-salvia-50 dark:text-crema-100/70 dark:hover:bg-white/5'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={marcada}
                                disabled={enviado}
                                onChange={() =>
                                  setRespuestas((prev) => {
                                    const actuales = (prev[pregunta.id] as number[]) ?? [];
                                    return {
                                      ...prev,
                                      [pregunta.id]: actuales.includes(idx)
                                        ? actuales.filter((v) => v !== idx)
                                        : [...actuales, idx],
                                    };
                                  })
                                }
                                className="mt-1 h-4 w-4 shrink-0 rounded border-salvia-400 text-bosque-600 focus:ring-bosque-500"
                              />
                              <span>{opcion}</span>
                              {enviado && esClave && (
                                <span className="ml-auto shrink-0 text-xs font-semibold">✓</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Verdadero / falso */}
                  {pregunta.tipo === 'verdadero_falso' && (
                    <div className="mt-3.5 flex gap-2.5">
                      {[true, false].map((valor) => {
                        const elegida = respuestas[pregunta.id] === valor;
                        const esClave = pregunta.respuesta === valor;
                        return (
                          <button
                            key={String(valor)}
                            type="button"
                            disabled={enviado}
                            onClick={() =>
                              setRespuestas((prev) => ({ ...prev, [pregunta.id]: valor }))
                            }
                            className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                              enviado
                                ? esClave
                                  ? 'bg-bosque-600 text-crema-50'
                                  : elegida
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                    : 'bg-salvia-50 text-tinta-400 dark:bg-white/5 dark:text-crema-100/30'
                                : elegida
                                  ? 'bg-bosque-700 text-crema-50'
                                  : 'bg-salvia-100 text-tinta-700 hover:bg-salvia-200 dark:bg-white/5 dark:text-crema-100/70 dark:hover:bg-white/10'
                            }`}
                          >
                            {valor ? 'Verdadero' : 'Falso'}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Abierta */}
                  {pregunta.tipo === 'abierta' && (
                    <>
                      <textarea
                        value={(respuestas[pregunta.id] as string) ?? ''}
                        disabled={enviado}
                        onChange={(e) =>
                          setRespuestas((prev) => ({ ...prev, [pregunta.id]: e.target.value }))
                        }
                        rows={5}
                        placeholder="Responde con tus palabras. Después compararás con la respuesta modelo."
                        className="mt-3.5 w-full resize-y rounded-xl border-0 bg-crema-50 p-3.5 text-[0.94rem] leading-relaxed text-tinta-800 ring-1 ring-inset ring-salvia-200 placeholder:text-tinta-400/70 focus:ring-2 focus:ring-inset focus:ring-bosque-500 disabled:opacity-80 dark:bg-tinta-950/60 dark:text-crema-100/85 dark:ring-crema-100/10"
                      />

                      {enviado && (
                        <div className="mt-4 rounded-xl bg-salvia-50 p-4 dark:bg-salvia-900/20">
                          <p className="text-[0.7rem] font-bold uppercase tracking-marca text-salvia-700 dark:text-salvia-300">
                            Respuesta modelo
                          </p>
                          <p className="mt-2 whitespace-pre-line text-[0.94rem] leading-relaxed text-tinta-700 dark:text-crema-100/75">
                            {pregunta.respuestaModelo}
                          </p>

                          <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-marca text-salvia-700 dark:text-salvia-300">
                            Debía tocar estos puntos
                          </p>
                          <ul className="mt-2 space-y-1.5">
                            {pregunta.criterios.map((c, k) => (
                              <li
                                key={k}
                                className="flex gap-2 text-[0.9rem] text-tinta-600 dark:text-crema-100/65"
                              >
                                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-salvia-500" />
                                {c}
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 border-t border-salvia-300/60 pt-3.5 dark:border-crema-100/10">
                            <p className="text-sm font-medium text-tinta-700 dark:text-crema-100/70">
                              ¿Cómo lo hiciste?
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {(Object.keys(ETIQUETA_AUTOEVAL) as Autoevaluacion[]).map((valor) => (
                                <button
                                  key={valor}
                                  type="button"
                                  onClick={() => autoevaluar(pregunta.id, valor)}
                                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                    autoevaluaciones[pregunta.id] === valor
                                      ? 'bg-bosque-700 text-crema-50'
                                      : 'bg-white text-tinta-600 ring-1 ring-salvia-300 hover:bg-salvia-100 dark:bg-white/5 dark:text-crema-100/65 dark:ring-crema-100/10'
                                  }`}
                                >
                                  {ETIQUETA_AUTOEVAL[valor]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Explicación, tras enviar */}
                  {enviado && pregunta.tipo !== 'abierta' && (
                    <div
                      className={`mt-4 rounded-xl px-4 py-3 text-[0.9rem] leading-relaxed ${
                        correcta
                          ? 'bg-bosque-50 text-bosque-900 dark:bg-bosque-900/30 dark:text-salvia-200'
                          : 'bg-amber-50 text-amber-900 dark:bg-amber-950/25 dark:text-amber-200'
                      }`}
                    >
                      <strong className="font-semibold">
                        {correcta ? 'Correcto. ' : 'No exactamente. '}
                      </strong>
                      {pregunta.explicacion}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {!enviado && (
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={enviar}
            disabled={pendiente}
            className="rounded-full bg-bosque-700 px-7 py-3 text-sm font-semibold text-crema-50 shadow-suave transition-colors hover:bg-bosque-800 disabled:opacity-70"
          >
            Enviar respuestas
          </button>
          {sinResponder > 0 && (
            <p className="text-sm text-tierra-600 dark:text-tierra-300">
              Te {sinResponder === 1 ? 'queda' : 'quedan'} {sinResponder} sin responder — puedes
              enviar igualmente.
            </p>
          )}
        </div>
      )}

      {/* Histórico */}
      {intentosPrevios.length > 0 && (
        <details className="mt-8 rounded-xl bg-white/60 px-5 py-4 ring-1 ring-tinta-900/5 dark:bg-tinta-900/40 dark:ring-crema-100/10">
          <summary className="cursor-pointer text-sm font-medium text-tinta-700 dark:text-crema-100/70">
            Histórico de intentos ({intentosPrevios.length})
          </summary>
          <ul className="mt-3.5 space-y-2">
            {intentosPrevios.map((intento) => (
              <li
                key={intento.id}
                className="flex items-center justify-between gap-4 border-t border-salvia-200/70 pt-2.5 text-sm dark:border-crema-100/10"
              >
                <span className="text-tinta-500 dark:text-crema-100/50">
                  {new Date(intento.iniciadoEn).toLocaleString('es-BO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="font-mono font-semibold text-bosque-700 dark:text-salvia-300">
                  {intento.puntaje === null ? '—' : `${Math.round(intento.puntaje * 100)}%`}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
