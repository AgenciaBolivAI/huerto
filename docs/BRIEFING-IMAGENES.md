# Briefing: producir las imágenes de un módulo

Trabajas sobre `c:/Users/celie/OneDrive/Desktop/huertoClass`. Se te asigna **un módulo**.
Produces todas las imágenes de sus lecciones, las colocas, las insertas en el MDX y devuelves
los datos de registro. **No tocas `content/imagenes.json`** — de eso se encarga el orquestador.

## 1. Lee antes de escribir prompts

Para cada lección de tu módulo (`content/modulos/<modulo>/<leccion>/`):

- `<leccion>.mdx` — el texto completo. **Léelo entero.** Los prompts buenos salen de aquí.
- `meta.json` — título, subtítulo, objetivos.

Un prompt genérico produce una imagen inútil y gasta créditos. No inventes contenido: la imagen
ilustra lo que la lección **ya dice**.

## 2. Cuántas imágenes y de qué tipo

**5 por lección**: 1 portada + 4 diagramas.

| | Tipo | Ratio | Píxeles | Nombre |
|---|---|---|---|---|
| Portada | fotografía | 21:9 | 1584×672 | `portada.webp` |
| Diagrama | vector plano | 16:9 | 1376×768 | nombre-descriptivo.webp |

Los nombres de archivo van en kebab-case sin acentos y describen el contenido
(`ciclo-del-agua.webp`, `tres-errores.webp`). Elige los 4 conceptos que **más ganan al
dibujarse**: un mecanismo, una comparación, una secuencia de pasos, una escala o un error
frecuente. Si un `<Dato>`, `<Advertencia>` o `<Formula>` explica algo espacial o comparativo,
ése es tu diagrama.

## 3. Modelo y llamadas

Modelo `nano_banana_pro`. Usa `generate_image_batch` (máximo 12 por llamada, ponles
`index` correlativo), luego `jobs_wait` en grupos de 12. Pasa siempre `use_unlim: false`.
Cuesta **2 créditos por imagen**.

## 4. Los tres fallos que hay que esquivar

Comprobados. Cada uno arruinó imágenes reales de este curso.

**a) El andamiaje en inglés se imprime.** Escribir `STAGE ONE:` o `PANEL TWO:` hace que el
modelo los renderice literalmente sobre los rótulos españoles. Describe las viñetas en
minúscula — «the first panel shows…» — y añade siempre
`Do not write any English words anywhere in the image.`
Las MAYÚSCULAS se reservan solo para el texto español que debe aparecer.

**b) Prohibir la duplicación no la evita.** Pedir «cada rótulo una sola vez» falló: repitió
los rótulos arriba y abajo. **Fija la posición**:
`Each caption sits directly beneath its own panel and appears nowhere else in the image.`

**c) Las fotos de campo genéricas salen ambientadas en el sur de Asia.** Devolvió una aldea
india con sari y bindi. En toda foto: fija el entorno (**Bolivian lowlands near Santa Cruz**,
vegetación tropical de hoja ancha, calamina, tierra apisonada) y **recorta las caras**
(«crop above the wrists so no face and no clothing is visible», o sin gente).

## 5. Plantillas

**Diagrama:**

```
Clean educational diagram, flat vector textbook style, warm cream background (#F5F1E7).

[descripción del dibujo en minúscula: "the first panel shows…", "the second panel shows…"]

TEXT RULES: Render the Spanish text character for character exactly as written, including
every accent. Do not write any English words anywhere in the image. Each caption sits directly
beneath its own panel and appears nowhere else in the image; do not repeat any caption. The
heading appears once at the top: [TÍTULO]. The captions, left to right: [UNO], [DOS], [TRES].

Deep forest green (#2F5233) type and linework, terracotta (#B5613C) only for [lo erróneo o
lo que se descarta], muted sage green fills, cream background.
```

**Portada:**

```
WIDE LANDSCAPE composition, subject fills the entire frame edge to edge, no borders, no
letterboxing, full bleed. Editorial documentary photograph of [sujeto] in the Bolivian
lowlands near Santa Cruz. [detalle concreto, materiales, luz]. [Sin caras: "No people and no
hands in the frame" o "crop above the wrists so no face and no clothing is visible".]
[paleta y luz]. No text, no numbers, no logos, no brand marks anywhere.
```

El terracota es **semántico**: marca lo que está mal, lo que se descarta o lo que se pierde.
Nunca decorativo.

## 6. Revisión — obligatoria, una por una

Descarga cada PNG y **míralo con la herramienta Read**. Sin excepción: en la última tanda
fallaron 4 de 15 y ninguna se detectaba sin mirarla. Rechaza si:

- Hay **cualquier palabra en inglés**.
- Hay un **rótulo repetido**.
- Falta o sobra un **acento** (DÓNDE, AÑO, AQUÍ, AJÍ, PLÁTANO, HÍBRIDO…).
- El **dibujo contradice el rótulo** (p. ej. dos grupos que deberían diferir salen idénticos).
- La foto está **ambientada fuera de Bolivia** o se ve una cara.

Regenera la fallida **una vez** con el prompt corregido. Si vuelve a fallar, déjala fuera y
repórtala — no la publiques.

## 7. Colocar

Convierte a webp con `sharp` (`quality: 80`) al tamaño de la tabla, y guarda en
`public/imagenes/<modulo>/<leccion>/`.

Inserta cada diagrama en el MDX **en su sección**, justo después del párrafo que explica el
concepto:

```jsx
<Diagrama
  src="nombre.webp"
  alt="[Descripción larga y literal de lo que se ve, incluidos TODOS los rótulos en mayúsculas tal como aparecen. Quien no ve la imagen debe poder reconstruirla.]"
  pie="[Una frase que añade una idea, no que repite el rótulo. Señala lo que hay que mirar o la consecuencia.]"
/>
```

En `meta.json`, añade después de `duracionMin`:

```json
"portada": "portada.webp",
"portadaAlt": "[descripción de la foto, sin empezar con «Imagen de»]",
```

Cuidado: `<Termino` no puede empezar una línea en MDX.

**Finales de línea, comprobado:** los `.mdx`, los `meta.json` y los `modulo.json` están en
**LF**. El único archivo en CRLF es `content/imagenes.json`, que tú no tocas. Edita en vez de
reescribir el archivo entero y no conviertas nada: escribir CRLF en un `.mdx` ensucia el diff
con retornos sueltos. (Una versión anterior de este briefing decía lo contrario y costó una
lección corrupta.)

## 8. Qué devuelves

**No escribas en `content/imagenes.json`.** Devuelve un JSON con una entrada por imagen
publicada:

```json
{
  "modulo": "<modulo>",
  "publicadas": [
    {
      "ruta": "<modulo>/<leccion>/portada.webp",
      "tipo": "fotografia",
      "modelo": "nano_banana_2",
      "alt": "…",
      "prompt": "…el prompt exacto…"
    }
  ],
  "descartadas": [
    { "ruta": "<modulo>/<leccion>/x.webp (v1)", "motivo": "…", "conclusion": "…" }
  ],
  "creditos_gastados": 0,
  "notas": "…"
}
```

`modelo` es el que devuelve la API en el job (suele ser `nano_banana_2` aunque pidas
`nano_banana_pro`) — informa del real, no del solicitado. `tipo` es `fotografia` o `diagrama`.

Al terminar, comprueba tu módulo:

```
node -e "…"   # o simplemente: npm run validar 2>&1 | tail -12
```

`validar` fallará si otro agente tiene una lección a medias — mira solo los errores de **tu**
módulo. No arregles los de otros.

---

## 9. Entrega: escribe el JSON en un archivo

**No devuelvas el JSON en tu mensaje final.** Escríbelo en
`docs/_entregas/<modulo>.json` y en tu respuesta final di solo: cuántas publicaste, cuántas
descartaste, cuántos créditos gastaste y cualquier aviso. El orquestador lee el archivo.

En el JSON basta con `ruta`, `tipo` y `prompt` por imagen: el `alt` se lee del MDX y del
`meta.json` que ya dejaste escritos, así que no hace falta repetirlo.

```json
{
  "modulo": "<modulo>",
  "publicadas": [
    { "ruta": "<modulo>/<leccion>/x.webp", "tipo": "diagrama", "prompt": "…exacto…" }
  ],
  "descartadas": [
    { "ruta": "<modulo>/<leccion>/x.webp (v1)", "motivo": "…", "conclusion": "…" }
  ],
  "creditos_gastados": 0
}
```

## 10. Catálogo de fallos comprobados

Todos ocurrieron de verdad en este curso y costaron créditos. Están ordenados por frecuencia.

### El texto que no pediste

**El modelo imprime tu propia descripción como rótulos de llamada.** Es el fallo más caro y más
frecuente: salieron párrafos enteros en inglés dentro de los paneles («Layred soill from water
heldd…», «Twenty-litre in hot cement»). Prohibir el inglés NO basta. Hay que **cerrar el
conjunto**:

> These N lines are the ONLY words in the whole image. Draw absolutely no callout labels, no
> leader lines with words, no annotations, no axis labels, no numbers and no units anywhere.

**Cualquier sustantivo concreto de tu descripción puede volverse rótulo.** «blue crystals» salió
impreso como BLUI CRISTAL; «fresh feed» como FRESH FEED. Usa formulaciones neutras: «mineral
powder», «newly added material».

**El modelo se inventa rótulos y ésos sí los duplica.** Puso HUMUS y ALIMENTO FRESCO dos veces
dentro del mismo panel. La regla de posición protege tus rótulos, no los suyos. Añade:
«nothing in the drawing is named».

**Los objetos que en la vida real llevan texto lo llevarán.** Formularios, sellos, etiquetas de
frasco, tapas de cuaderno, pantallas. Salieron impresas OFFICIAL, SEEDS y SCHOOL EXERCISE.
Decláralos en blanco uno por uno.

**Una tira de calendario se rellena sola, y en portugués.** Aparecieron JAN, FEV, MAI, ABRI,
DIZ, DEL. Prohíbe explícitamente nombres de mes, abreviaturas y números en la tira.

**Los ejes se rotulan en inglés.** Salió YIELD dos veces. «The axes carry no labels, no tick
numbers and no units».

**El separador `/` que uses entre dos rótulos se imprime.** Usa «The caption beneath the left
panel: … The caption beneath the right panel: …».

### Los números

**El modelo respeta los rótulos e inventa los valores.** Una barra de poder germinativo puso los
cortes en 15, 37 y 64 en vez de en 50 y 80 — y eso contradecía la lección. Una regla de
profundidad repitió «3 m» y se saltó el 2,5.

- Si el valor importa: escribe la posición exacta sobre la escala y repite el número.
- Si el valor no importa: **quita todos los números**. Una regla de marcas lisas comunica lo
  mismo y no puede equivocarse.

### El dibujo que contradice el rótulo

**Dos paneles que deben diferir salen idénticos.** Pasó con dos antebrazos que debían tener
grosor muy distinto y con dos grupos de plantas que debían diferir. Cuantifica la diferencia
**y di para qué**: «roughly twice as wide as the arm in the first panel… so that nobody could
confuse the first and second panels».

**Decir que algo se detiene no basta: describe el vacío.** Las flechas seguían pasando por
encima de la barrera hasta que se escribió «the space above that bar is completely empty, with
no arrows and nothing else drawn there».

**El terracota semántico se rompe si dos elementos compiten por él.** Pintó de terracota la
corteza fría *y* el núcleo caliente. Cuando haya dos elementos con carga visual parecida, añade
un bloque:

> COLOUR ROLES, follow exactly: [A] is filled solid deep forest green. [B] is the only
> terracotta element. They must never share a colour.

**Las aspas y las cruces se leen como «no».** Una hilera de X que marcaba cosechas repetidas
parecía decir lo contrario. Si quieres una marca neutra, prohíbe la forma: «no crosses, no X
shapes; the marks are plain round filled dots».

**Las posiciones dentro de una tira hay que darlas por ordinal explícito** —«the FOURTH cell,
the last of the dry cells»—, no por descripción.

**Los cardinales van en MAYÚSCULA dentro de la frase**: «exactly ONE horizontal timeline bar and
no second bar». Con minúscula dibujó dos.

### La composición

**Con cinco o más paneles el modelo los envuelve en dos filas y repite uno.** «A single
horizontal strip … do not wrap the panels onto a second row and do not draw any panel twice».

**«Full bleed, no borders» no impide el díptico.** Una portada salió partida en dos fotos con
una barra blanca. Prohíbelo por su nombre: «ONE single uninterrupted photographic frame: not a
diptych, no split panels, no dividing line».

**Los adverbios de orientación se ignoran.** «Upside down» dio botas y macetas del derecho — lo
contrario de lo que enseñaba la lección. Describe la geometría: «its sole points straight up
toward the roof and its open top points down at the ground».

**Los rótulos largos aumentan la probabilidad de una letra de más.** Salió GENERIACIÓN. Acortar
la leyenda ayuda más que pedir buena ortografía.

### El contexto

**La ropa sitúa una escena tanto como la cara.** Una foto sin ningún rostro salió con polares de
clima frío y leía como un taller europeo. Pide manga corta y algodón ligero.

**«Cold wind» invoca copos de nieve.** En el llano cruceño no hiela: dilo y prohíbe los símbolos
de hielo.

**Nombra especies concretas del sitio** —plátano, heliconia, motacú— en vez de «tropical
foliage», que el modelo interpreta con flora templada genérica.

**Nunca uses dominios ni marcas que imiten entidades reales.** Un `mibanco.com` falsificado hizo
fallar el trabajo en el servidor, casi con seguridad por el filtro de suplantación. Usa
`misitio.com`.

### La infraestructura

**La API falla sola en torno a un 15 % de las veces** cuando hay varios agentes generando.
Vuelve `failed` sin imagen y sin razón de contenido: se reenvía y sale. **Comprueba el estado
terminal de cada índice uno por uno**; dar un lote por terminado porque la mayoría acabó deja
huecos silenciosos.

**Escribe tus descargas en `scratchpad/<modulo>/`, nunca en el directorio compartido.** Dos
agentes usaron nombres numéricos y se pisaron los archivos. Un nombre repetido no da error: da
la imagen equivocada bajo el nombre correcto, que es el peor fallo posible.

**El modelo devuelve 2K.** Reescala a 1376×768 y 1584×672 al convertir, o las imágenes pesan el
triple que las del resto del curso.
