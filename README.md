# Aula Rizoma del Sur

Curso interactivo **De 0 a Experto en Huertos y Viveros**, escrito para
**Rizoma del Sur** — 2.474 m² de vivero y huerto biológico en Estrellas del Sur,
Zanja Honda, sur de Santa Cruz de la Sierra, Bolivia.

13 módulos, contenido en MDX, progreso persistente y sin autenticación.

---

## Arranque

```bash
npm install
cp .env.local.example .env.local     # y pega la service_role key
npm run dev                          # http://localhost:3000
```

### Variables de entorno

| Variable | Dónde se usa | Obligatoria |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | servidor | sí, para guardar progreso |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo servidor** | sí, para guardar progreso |

La clave de servicio está en el dashboard de Supabase, en
*Project Settings → API Keys → `service_role`*.

**Sin credenciales la aplicación sigue funcionando en modo lectura**: el
contenido vive en archivos MDX en disco, así que las lecciones y los videos se
ven enteros; lo único que no ocurre es el guardado de progreso, notas y quizzes.

---

## Cómo está montado

```
content/modulos/{n}-{slug}/
  modulo.json                    título, resumen, orden de las lecciones
  {n}-{slug}/
    {n}-{slug}.mdx               el contenido de la lección
    meta.json                    objetivos, prerrequisitos, videos, referencias
    quiz.json                    4–8 preguntas con respuesta modelo
content/glosario.json            término → definición + lección donde se explica
content/videos-verificados.json  GENERADO — no editar a mano
```

`content/` es la fuente de verdad de **qué es el curso**; la base de datos solo
guarda **qué hizo el estudiante**. La unión entre ambos es el id estable de la
lección (`01-fundamentos/01-anatomia-funcional`), de modo que reescribir o
ampliar una lección nunca corrompe el progreso.

### Componentes disponibles en el MDX

| Componente | Para qué |
|---|---|
| `<AplicarRizoma>` | Cómo se traduce el concepto a los 2.474 m² concretos |
| `<ContextoBolivia>` | Suelos, clima, insumos y mercado locales; en qué difiere de las fuentes de EE.UU. o Europa |
| `<Analogia>` | Analogía de ingeniería o de sistemas |
| `<Dato>` / `<Advertencia>` | Dato clave / error frecuente |
| `<Figura pie="…">` | Esquema ASCII con pie |
| `<Formula explicacion="…">` | Ecuación destacada |
| `<Video id="…">` | Video de YouTube, resuelto contra `meta.json` |
| `<Termino slug="…">` | Término del glosario con su definición emergente |

`AplicarRizoma` y `ContextoBolivia` son **obligatorios** en toda lección con
`"practica": true`; el validador falla si faltan.

---

## Los videos: por qué no puede colarse un enlace inventado

Un ID de YouTube inventado produce un enlace muerto y arruina la lección, y
falla **en silencio**. Aquí eso es imposible por construcción, no por buena
voluntad:

> **`titulo`, `canal` y `duracion` no se escriben nunca a mano.** Los rellena
> `scripts/verificar-videos.mjs` leyéndolos de la propia YouTube. Quien redacta
> una lección solo aporta `url`, `idioma` y `porQue`.

```bash
npm run verificar-videos       # solo comprueba
npm run verificar-videos:fix   # además corrige los meta.json y baja miniaturas
```

Por cada video: valida la URL, consulta **oEmbed** (404 ⇒ no existe), toma
título y canal reales, lee la duración y si admite incrustación, y descarga la
miniatura a `public/thumbs/` para que la carátula se vea sin conexión. Si algo
falla, sale con código ≠ 0 y el video **no se publica**.

Además deja constancia en `content/videos-verificados.json`. `npm run validar`
—que no toca la red— compara cada `meta.json` con ese registro, así que **poner
`"verificado": true` a mano no sirve de nada**: si el ID no consta, o si alguien
retocó el título o el canal, el build se detiene.

Cuando ningún video supere la curación, la lección se queda con `videos: []` y
la interfaz lo dice: *"Pendiente de curar video para esta lección"*. Es
preferible a un enlace roto o fuera de tema.

---

## Las imágenes

Se generan con Higgsfield (`nano_banana_pro`), se guardan en
`public/imagenes/{modulo}/{leccion}/` y se sirven desde el propio repositorio.
Ninguna se carga desde una CDN externa: la lección tiene que verse entera sin
conexión, igual que las carátulas de los videos.

| Componente | Para qué | Tratamiento |
|---|---|---|
| `portada` en `meta.json` | Cabecera de la lección, a sangre | WebP q82 |
| `<Diagrama>` | Esquema científico con etiquetas | WebP q90, fondo crema fijo |
| `<Ilustracion>` | Fotografía o imagen atmosférica | WebP q82 |

```bash
node scripts/optimizar-imagenes.mjs   # PNG/JPG → WebP y borra el original
```

Sin este paso una lección pesa ~4,7 MB; con él, ~290 KB. La misma diferencia
multiplicada por 80 lecciones es lo que separa un repositorio de 22 MB de uno
de 380 MB.

**Toda imagen se revisa a ojo antes de entrar.** Un modelo de imagen puede
escribir mal una etiqueta o inventarse la anatomía, y en un curso eso hace el
mismo daño que un enlace de video roto. Ha pasado ya: la primera versión del
diagrama de xilema y floema escribía *«azucares»* sin tilde. `content/imagenes.json`
guarda el modelo, el prompt exacto y las notas de revisión de cada una, para
poder regenerarlas o auditarlas después.

`npm run validar` comprueba que cada `<Diagrama>` y cada `<Ilustracion>`
apunten a un archivo que existe y lleven texto alternativo.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Valida el contenido y luego compila |
| `npm run validar` | Solo valida el contenido, sin red |
| `npm run verificar-videos` | Comprueba los videos contra YouTube |
| `npm run verificar-videos:fix` | Comprueba, corrige y descarga miniaturas |
| `npm run optimizar-imagenes` | Convierte a WebP las imágenes nuevas |

`npm run validar` revisa esquemas, que cada lección tenga su `.mdx`, que los
prerrequisitos existan, que cada `<Video id>` esté en su `meta.json`, que cada
`<Termino slug>` esté en el glosario, que las lecciones prácticas lleven sus dos
bloques obligatorios y que ningún video haya esquivado la verificación.

---

## Base de datos

Postgres en Supabase, proyecto `rizoma-del-sur` (`adfudckqftijdpxpamwk`),
tablas con prefijo `curso_` para convivir sin riesgo con las de la tienda.

```
curso_progreso_leccion   estado por lección, tiempo, punto de lectura
curso_nota               cuaderno markdown por lección
curso_intento_quiz       histórico de intentos (nunca se sobrescribe)
curso_respuesta_quiz     respuesta por pregunta + autoevaluación
curso_dia_estudio        un registro por día con actividad → alimenta la racha
curso_ajuste             clave-valor: última lección, tema
```

Los incrementos, los `CASE` dentro del upsert y las escrituras que deben ser
atómicas están en funciones Postgres (`curso_registrar_visita`,
`curso_alternar_completada`, `curso_acumular_tiempo`, `curso_registrar_intento`).

**La racha se calcula, no se almacena**, así no puede desincronizarse. El día se
resuelve con `curso_hoy()` en zona `America/La_Paz`: en Vercel el proceso corre
en UTC y, sin eso, estudiar después de las 20:00 contaría como del día siguiente.

### Seguridad sin autenticación

El curso no tiene login y el progreso es **único y compartido**: cualquiera con
el enlace del despliegue lee y escribe el mismo registro. Es una decisión
tomada, no un descuido.

Lo que sí está cerrado: las tablas `curso_*` tienen **RLS activo y sin
políticas**, y todo el acceso ocurre en el servidor con la `service_role` key.
La clave anónima del proyecto es pública —viaja en el bundle de
rizomadelsur.com— y aun así **no puede tocar el progreso del curso** atacando
la API REST. El único camino de escritura es a través de esta aplicación.

---

## Despliegue en Vercel

1. Importar el repositorio.
2. En *Settings → Environment Variables* añadir `NEXT_PUBLIC_SUPABASE_URL` y
   `SUPABASE_SERVICE_ROLE_KEY`.
3. Desplegar. La base de datos ya está migrada, no hace falta nada más.

El sitio queda abierto a cualquiera con el enlace, sin registro.

---

## Estado

**Fase 1 completa.** Base, navegación, progreso, quiz, notas, verificación de
videos y una lección íntegra de referencia:
*Módulo 1 · Lección 1 — Anatomía funcional: la planta como sistema de órganos.*

**Fase 2** — contenido módulo a módulo, en este orden acordado:
M2 (ciencia del suelo) → M3 (suelos y clima de Bolivia) → M4 (preparar la
tierra) → M1 (lecciones 2-6) → M5…M13.

**Fase 3** — calculadoras, glosario con búsqueda, buscador global y exportación
de todas las notas a un único `.md`.
