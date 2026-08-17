'use client';

import { useState, type ReactNode } from 'react';

/* ────────────────────────────────────────────────────────────────────────────
 * Las calculadoras del curso.
 *
 * Cada una enseña además de calcular: dice qué fórmula usa y por qué, para que
 * el lector pueda hacer la cuenta en un papel el día que no tenga el teléfono.
 * Una calculadora que solo escupe el número deja al usuario dependiendo de
 * ella, y este curso va de lo contrario.
 *
 * Ninguna inventa precios, normas ni valores locales: todo dato que dependa del
 * mercado o de la obra lo pone quien la usa.
 * ──────────────────────────────────────────────────────────────────────────── */

function Campo({
  etiqueta,
  valor,
  onChange,
  sufijo,
  paso = 'any',
  ayuda,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  sufijo?: string;
  paso?: string;
  ayuda?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[0.8rem] font-medium text-tinta-600 dark:text-crema-100/60">
        {etiqueta}
      </span>
      <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-salvia-300 bg-white/80 px-3 py-2 focus-within:border-bosque-600 dark:border-crema-100/15 dark:bg-tinta-900/60">
        <input
          type="number"
          inputMode="decimal"
          step={paso}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-[0.95rem] text-tinta-800 outline-none dark:text-crema-100/85"
        />
        {sufijo && (
          <span className="shrink-0 text-xs text-tinta-400 dark:text-crema-100/35">{sufijo}</span>
        )}
      </span>
      {ayuda && (
        <span className="mt-1 block text-[0.72rem] leading-snug text-tinta-400 dark:text-crema-100/35">
          {ayuda}
        </span>
      )}
    </label>
  );
}

function Resultado({ children, nota }: { children: ReactNode; nota?: string }) {
  return (
    <div className="mt-5 rounded-xl bg-bosque-50 px-4 py-3.5 ring-1 ring-bosque-200 dark:bg-bosque-900/30 dark:ring-bosque-700/40">
      <div className="font-mono text-[1.05rem] font-semibold text-bosque-800 dark:text-salvia-200">
        {children}
      </div>
      {nota && (
        <p className="mt-1.5 text-[0.78rem] leading-snug text-tinta-500 dark:text-crema-100/45">
          {nota}
        </p>
      )}
    </div>
  );
}

function Tarjeta({
  titulo,
  para,
  formula,
  children,
}: {
  titulo: string;
  para: string;
  formula: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white/70 p-6 ring-1 ring-tinta-900/5 dark:bg-tinta-900/50 dark:ring-crema-100/10">
      <h2 className="font-serif text-xl font-semibold text-bosque-800 dark:text-crema-50">
        {titulo}
      </h2>
      <p className="mt-1.5 text-[0.88rem] leading-relaxed text-tinta-500 dark:text-crema-100/50">
        {para}
      </p>
      <p className="mt-3 rounded-lg border border-dashed border-salvia-400 px-3 py-2 text-center font-mono text-[0.82rem] text-bosque-700 dark:text-salvia-300">
        {formula}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const num = (s: string) => {
  const n = Number.parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const fmt = (n: number, dec = 2) =>
  n.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: dec });

/* ── 1. Regla de tres ─────────────────────────────────────────────────────── */

export function ReglaDeTres() {
  const [a, setA] = useState('3');
  const [b, setB] = useState('250');
  const [c, setC] = useState('7');
  const [inversa, setInversa] = useState(false);

  const [na, nb, nc] = [num(a), num(b), num(c)];
  const valido = na !== null && nb !== null && nc !== null && na !== 0;
  const r = valido ? (inversa ? (na * nb) / nc : (nb * nc) / na) : null;

  return (
    <Tarjeta
      titulo="Regla de tres"
      para="Si sé cuánto vale una cantidad, cuánto vale otra. Sirve para dosificar, para escalar una receta, para convertir y para saber si un precio por kilo es mejor que otro."
      formula={inversa ? 'x = (a × b) ÷ c' : 'x = (b × c) ÷ a'}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Si esto…" valor={a} onChange={setA} />
        <Campo etiqueta="…vale esto" valor={b} onChange={setB} />
        <Campo etiqueta="Entonces esto…" valor={c} onChange={setC} />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={inversa}
          onChange={(e) => setInversa(e.target.checked)}
          className="mt-1 accent-bosque-700"
        />
        <span className="text-[0.82rem] leading-snug text-tinta-600 dark:text-crema-100/60">
          <strong className="font-semibold">Inversamente proporcional</strong> — cuando al aumentar
          uno el otro baja: más obreros, menos días; más velocidad, menos tiempo.
        </span>
      </label>

      {r !== null ? (
        <Resultado nota="Comprueba siempre que el resultado tenga sentido: si sale más grande cuando esperabas más chico, tienes la proporción al revés.">
          … vale {fmt(r, 4)}
        </Resultado>
      ) : (
        <Resultado>Completa los tres números</Resultado>
      )}
    </Tarjeta>
  );
}

/* ── 2. Área y volumen ────────────────────────────────────────────────────── */

export function AreaVolumen() {
  const [forma, setForma] = useState<'rect' | 'circ'>('rect');
  const [x, setX] = useState('2');
  const [y, setY] = useState('10');
  const [h, setH] = useState('0.3');

  const [nx, ny, nh] = [num(x), num(y), num(h)];
  const area =
    forma === 'rect'
      ? nx !== null && ny !== null
        ? nx * ny
        : null
      : nx !== null
        ? Math.PI * (nx / 2) ** 2
        : null;
  const vol = area !== null && nh !== null ? area * nh : null;

  return (
    <Tarjeta
      titulo="Área y volumen"
      para="Cuánta superficie ocupa una cama o una losa, y cuánto material cabe dentro. El volumen en metros cúbicos por mil son litros: un tanque de 1 m³ guarda 1.000 litros."
      formula={forma === 'rect' ? 'área = largo × ancho · volumen = área × alto' : 'área = π × (diámetro ÷ 2)² · volumen = área × alto'}
    >
      <div className="mb-4 flex gap-2">
        {(
          [
            ['rect', 'Rectángulo'],
            ['circ', 'Círculo'],
          ] as const
        ).map(([k, t]) => (
          <button
            key={k}
            type="button"
            onClick={() => setForma(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              forma === k
                ? 'bg-bosque-700 text-crema-50'
                : 'bg-salvia-100 text-tinta-600 hover:bg-salvia-200 dark:bg-white/5 dark:text-crema-100/60'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {forma === 'rect' ? (
          <>
            <Campo etiqueta="Largo" valor={x} onChange={setX} sufijo="m" />
            <Campo etiqueta="Ancho" valor={y} onChange={setY} sufijo="m" />
          </>
        ) : (
          <Campo etiqueta="Diámetro" valor={x} onChange={setX} sufijo="m" />
        )}
        <Campo etiqueta="Alto o profundidad" valor={h} onChange={setH} sufijo="m" />
      </div>

      {area !== null ? (
        <Resultado nota="Si duplicas el largo y el ancho, el área se multiplica por cuatro y el volumen por ocho. Por eso una cama «un poco más grande» pide mucha más tierra de la que parece.">
          {fmt(area)} m² · {vol !== null ? `${fmt(vol, 3)} m³ = ${fmt(vol * 1000, 0)} litros` : '—'}
        </Resultado>
      ) : (
        <Resultado>Completa las medidas</Resultado>
      )}
    </Tarjeta>
  );
}

/* ── 3. Dosificación de hormigón ──────────────────────────────────────────── */

export function Hormigon() {
  const [vol, setVol] = useState('0.5');
  const [cem, setCem] = useState('1');
  const [are, setAre] = useState('2');
  const [gra, setGra] = useState('3');
  const [bolsa, setBolsa] = useState('50');

  const [nv, nc, na, ng, nb] = [num(vol), num(cem), num(are), num(gra), num(bolsa)];
  const ok = [nv, nc, na, ng, nb].every((v) => v !== null && v > 0);

  // El volumen suelto de los áridos se reduce al mezclarse: los granos finos
  // ocupan los huecos entre los gruesos. El factor de 1,55 es el valor de
  // rendimiento que se usa habitualmente para mezclas manuales.
  const RENDIMIENTO = 1.55;
  const partes = ok ? nc! + na! + ng! : 0;
  const seco = ok ? nv! * RENDIMIENTO : 0;
  const volCem = ok ? (seco * nc!) / partes : 0;
  // Un metro cúbico de cemento suelto pesa del orden de 1.440 kg.
  const kgCem = volCem * 1440;

  return (
    <Tarjeta
      titulo="Dosificación de hormigón"
      para="Cuántas bolsas de cemento, y cuánta arena y grava, para un volumen dado. La proporción la pones tú: la que pide tu obra o tu maestro, no una inventada aquí."
      formula="volumen suelto = volumen final × 1,55 · cada material = suelto × su parte ÷ total de partes"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Volumen a llenar" valor={vol} onChange={setVol} sufijo="m³" ayuda="Sale de la calculadora de arriba." />
        <Campo etiqueta="Peso de la bolsa de cemento" valor={bolsa} onChange={setBolsa} sufijo="kg" />
      </div>
      <p className="mt-4 text-[0.8rem] font-medium text-tinta-600 dark:text-crema-100/60">
        Proporción en volumen (cemento : arena : grava)
      </p>
      <div className="mt-1.5 grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Cemento" valor={cem} onChange={setCem} />
        <Campo etiqueta="Arena" valor={are} onChange={setAre} />
        <Campo etiqueta="Grava" valor={gra} onChange={setGra} />
      </div>

      {ok ? (
        <Resultado nota="Son cantidades de material, no una especificación estructural. Qué proporción y qué resistencia necesita cada elemento de tu obra lo decide quien la calcula.">
          {fmt(kgCem / nb!, 1)} bolsas de cemento
          <span className="block text-[0.9rem] font-normal">
            {fmt((seco * na!) / partes, 3)} m³ de arena · {fmt((seco * ng!) / partes, 3)} m³ de grava
          </span>
        </Resultado>
      ) : (
        <Resultado>Completa los datos</Resultado>
      )}
    </Tarjeta>
  );
}

/* ── 4. Costo, precio y margen ────────────────────────────────────────────── */

export function PrecioMargen() {
  const [costo, setCosto] = useState('12');
  const [margen, setMargen] = useState('35');
  const [fijos, setFijos] = useState('800');

  const [ncosto, nmargen, nfijos] = [num(costo), num(margen), num(fijos)];
  const valido = ncosto !== null && nmargen !== null && nmargen < 100 && nmargen >= 0;

  // Margen sobre el precio de venta, no sobre el costo: es la definición que
  // usa quien compra y vende, y confundirla es el error caro del módulo.
  const precio = valido ? ncosto! / (1 - nmargen! / 100) : null;
  const ganancia = precio !== null ? precio - ncosto! : null;
  const equilibrio = ganancia !== null && ganancia > 0 && nfijos !== null ? nfijos / ganancia : null;

  return (
    <Tarjeta
      titulo="Precio, margen y punto de equilibrio"
      para="A partir de lo que te cuesta producir una unidad, qué precio deja el margen que buscas y cuántas unidades tienes que vender al mes para no perder."
      formula="precio = costo ÷ (1 − margen) · equilibrio = costos fijos ÷ ganancia por unidad"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Costo por unidad" valor={costo} onChange={setCosto} sufijo="Bs" />
        <Campo etiqueta="Margen buscado" valor={margen} onChange={setMargen} sufijo="%" ayuda="Sobre el precio de venta." />
        <Campo etiqueta="Costos fijos al mes" valor={fijos} onChange={setFijos} sufijo="Bs" />
      </div>

      {precio !== null ? (
        <Resultado nota="El margen aquí se calcula sobre el precio, no sobre el costo. Un 35 % sobre el costo y un 35 % sobre el precio dan números muy distintos, y confundirlos es la forma más común de trabajar gratis.">
          Precio: {fmt(precio)} Bs · ganas {fmt(ganancia ?? 0)} Bs por unidad
          {equilibrio !== null && (
            <span className="block text-[0.9rem] font-normal">
              Punto de equilibrio: {fmt(Math.ceil(equilibrio), 0)} unidades al mes
            </span>
          )}
        </Resultado>
      ) : (
        <Resultado>El margen tiene que estar entre 0 y 99</Resultado>
      )}
    </Tarjeta>
  );
}

/* ── 5. Caída de tensión ──────────────────────────────────────────────────── */

export function CaidaTension() {
  const [long, setLong] = useState('15');
  const [corr, setCorr] = useState('10');
  const [secc, setSecc] = useState('2.5');
  const [tension, setTension] = useState('12');

  const [nl, ni, ns, nt] = [num(long), num(corr), num(secc), num(tension)];
  const ok = [nl, ni, ns, nt].every((v) => v !== null && v > 0);

  // Resistividad del cobre, en ohm·mm²/m. El 2 del numerador es porque la
  // corriente recorre el cable de ida y el de vuelta.
  const RHO = 0.0175;
  const caida = ok ? (2 * nl! * ni! * RHO) / ns! : null;
  const pct = caida !== null && nt !== null ? (caida / nt) * 100 : null;

  const juicio =
    pct === null
      ? null
      : pct <= 3
        ? { t: 'Holgado', c: 'text-bosque-700 dark:text-salvia-300' }
        : pct <= 5
          ? { t: 'En el límite', c: 'text-amber-700 dark:text-amber-300' }
          : { t: 'Demasiada: sube la sección o acorta el tramo', c: 'text-red-700 dark:text-red-300' };

  return (
    <Tarjeta
      titulo="Caída de tensión en un cable"
      para="Cuánta tensión se pierde por el camino. En 12 voltios es el cálculo que decide si una bomba arranca o solo zumba; en 220 se nota mucho menos, y por eso se sube la tensión en los tramos largos."
      formula="caída = (2 × largo × corriente × 0,0175) ÷ sección"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Largo del tramo" valor={long} onChange={setLong} sufijo="m" ayuda="Solo de ida: el cálculo ya cuenta la vuelta." />
        <Campo etiqueta="Corriente" valor={corr} onChange={setCorr} sufijo="A" />
        <Campo etiqueta="Sección del conductor" valor={secc} onChange={setSecc} sufijo="mm²" />
        <Campo etiqueta="Tensión del sistema" valor={tension} onChange={setTension} sufijo="V" />
      </div>

      {caida !== null && pct !== null ? (
        <Resultado nota="Vale para cobre. Es un cálculo de caída, no de capacidad: un cable puede cumplir con la caída y aun así ser demasiado fino para la corriente que va a llevar, que es lo que provoca el calentamiento. Las dos comprobaciones son distintas y hay que hacer las dos.">
          {fmt(caida)} V perdidos · {fmt(pct, 1)} %
          <span className={`block text-[0.9rem] font-normal ${juicio?.c ?? ''}`}>{juicio?.t}</span>
        </Resultado>
      ) : (
        <Resultado>Completa los cuatro datos</Resultado>
      )}
    </Tarjeta>
  );
}

/* ── 6. Agua ──────────────────────────────────────────────────────────────── */

export function Agua() {
  const [area, setArea] = useState('20');
  const [lamina, setLamina] = useState('5');
  const [dias, setDias] = useState('7');

  const [na, nl, nd] = [num(area), num(lamina), num(dias)];
  const ok = na !== null && nl !== null && na > 0 && nl > 0;
  // Un milímetro de lámina sobre un metro cuadrado es exactamente un litro.
  const litrosDia = ok ? na! * nl! : null;

  return (
    <Tarjeta
      titulo="Agua: de milímetros a litros"
      para="Los datos de lluvia y de evaporación vienen en milímetros, y los baldes y tanques en litros. Esta es la conversión que traduce una cosa en la otra, y la que dice si tu tanque aguanta la seca."
      formula="litros por día = superficie (m²) × lámina (mm)"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Superficie regada" valor={area} onChange={setArea} sufijo="m²" />
        <Campo etiqueta="Lámina diaria" valor={lamina} onChange={setLamina} sufijo="mm" ayuda="Lo que la planta gasta o lo que llovió." />
        <Campo etiqueta="Días de autonomía" valor={dias} onChange={setDias} sufijo="días" />
      </div>

      {litrosDia !== null ? (
        <Resultado nota="Un milímetro sobre un metro cuadrado es un litro exacto: no es una aproximación, es la definición. La misma cuenta sirve al revés para saber cuánta agua te deja un techo cuando llueve.">
          {fmt(litrosDia, 0)} litros al día
          {nd !== null && nd > 0 && (
            <span className="block text-[0.9rem] font-normal">
              Depósito para {fmt(nd, 0)} días: {fmt(litrosDia * nd, 0)} litros
            </span>
          )}
        </Resultado>
      ) : (
        <Resultado>Completa la superficie y la lámina</Resultado>
      )}
    </Tarjeta>
  );
}
