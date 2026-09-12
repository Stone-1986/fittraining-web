# Rules — Frontend

Reglas absolutas de `fittraining-web`. Aplican en toda sesión y a todo agente.
Se leen **antes** de cualquier trabajo de implementación.

Este archivo es la versión **normativa y corta**: una línea por regla,
verificable. El _porqué_ de cada una, con ejemplos, está en
[`docs/sistema-de-diseno.md`](../../docs/sistema-de-diseno.md). Si los dos
documentos se contradicen, manda éste y hay que corregir el otro.

## Las tres fuentes del sistema de diseño, y cuál manda

| Fuente                          | Qué es                               | Autoridad                          |
| ------------------------------- | ------------------------------------ | ---------------------------------- |
| `docs/sistema_diseño/*.dc.html` | El canvas. La intención visual       | Manda en **qué debe verse**        |
| `src/app/globals.css`           | Los tokens. La traducción a código   | Manda en **qué se puede escribir** |
| `/estilo`                       | La guía viva. El sistema funcionando | Es la **verificación**             |

El canvas es un HTML suelto con hexadecimales incrustados: es la maqueta, no
el código. **Nadie copia un valor del canvas a un componente** — se copia al
token, y el componente pide el token.

Donde el canvas y `globals.css` difieren, hay tres desviaciones deliberadas y
están todas justificadas en el comentario del token. Ver § Accesibilidad.

## Dónde vive una excepción

Toda excepción a una regla se escribe **dos veces**: en la regla que la
contempla y en un **comentario junto a la línea que la usa**. No es
redundancia, es que las leen personas distintas — quien define y quien
consume— y la segunda es la única que ve quien se encuentra el código.

- Una excepción que solo vive en la regla es invisible desde el código, y quien
  la lea sin contexto la «corregirá» con los papeles en regla
- Una que solo vive en el comentario no es una excepción: es un caso suelto que
  el próximo se saltará
- **NUNCA justificar una excepción citando `outputs/`.** Ese directorio está
  gitignored y se regenera, así que una referencia como `outputs/plan.md:281`
  deja de resolver en cuanto alguien edita el plan. Ya pasó: la excepción del
  `<h3>` en mayúsculas de `/estilo` se apoyaba en una línea de `plan.md` que
  acabó hablando de otra cosa. El contrato vive desde entonces en `specs/`, en
  git — pero ni siquiera ahí se cita por número de línea: se cita por sección

---

## 1. Tokens — ningún archivo escribe un color

- NUNCA escribir un hex, un `rgb()`, un `oklch()` ni un color de la paleta de
  fábrica de Tailwind (`text-neutral-500`, `bg-green-700`) fuera de
  `src/app/globals.css`
- Los componentes nombran **roles**: `bg-primary`, `text-muted-foreground`,
  `border-border`
- **No hay modo claro.** La interfaz vive sobre negro carbón y punto. Por eso
  `dark:` en un componente ya no es una señal de alarma: es directamente un
  error — no hay un segundo tema al que aplicarse
- El canvas llama **«acento»** al cian de marca. En el código ese rol es
  **`primary`**. `--accent` está **reservado** para lo que shadcn/ui entiende
  por acento —el fondo tenue de un `hover`— y NUNCA es el cian
- No existe `warm`. El sistema anterior tenía una terracota de contrapunto; el
  canvas 1.0 decide **un solo acento** y la elimina
- Radios: solo `rounded-none` (el valor por defecto), `rounded-sm` (2px, solo
  el botón rectangular de la barra), `rounded-pill` y `rounded-full`. NUNCA un
  valor suelto, y NUNCA un radio intermedio: el sistema no tiene esquinas
  suaves
- **Sin sombras.** No existe token de sombra y no se añade uno: la profundidad
  la dan el borde de 1px y el degradado (§ 01 del canvas, «bloques a sangre»)
- Espaciado: la escala de 4px de Tailwind. NUNCA inventar una propia. El
  canvas dibuja un paso de 34px que **no** está en la escala; se usa 32px
  (`8`), que es la parada real y una diferencia imperceptible
- Tipografía: se usa la escala del sistema (`text-display`, `text-h2`,
  `text-h3`, `text-h4`, `text-lead`, `text-body`, `text-ui`, `text-action`,
  `text-label`). NUNCA un `text-[21px]` suelto. **Esa enumeración es la escala
  de LECTURA, y no es toda la tipografía del sistema:** hay familias que viven
  fuera de ella porque no participan de la jerarquía del documento —`action`
  (el texto de un botón) y `brand` (el logotipo, que tiene proporciones fijas
  por definición)—. Añadir una familia nueva exige dos cosas: que lo que se
  añade **no sea un escalón de lectura** —si lo es, se usa el escalón existente
  más cercano, como decidió D-4— y que quede **visible en `/estilo`**, porque un
  token que solo vive en el CSS es un token que alguien reutilizará mal
- Tracking: `tracking-brand`, `tracking-eyebrow`, `tracking-label`,
  `tracking-meta`, `tracking-nav`. Ninguno cae en la escala de fábrica, así
  que sin token acabarían como valores sueltos
- Si se cambia un color, **se vuelve a medir el contraste** y se actualiza la
  columna de `/estilo`. Mínimo AA (4.5:1) para texto, 3:1 para límites de
  controles y para texto grande

## 2. Servidor por defecto, cliente en la hoja

- `'use client'` va **lo más abajo posible** del árbol: en el componente que
  necesita interactividad, nunca en un `page.tsx`
- NUNCA marcar un `page.tsx` o un `layout.tsx` como cliente para "que
  funcione" un hijo — se marca el hijo
- Antes de añadir `'use client'`, comprobar que el efecto no se consigue con
  CSS o con HTML nativo (`<details>`, `:focus-visible`, `:hover`,
  `group-open:`). El acordeón del canvas es un `<details>` y no lleva una
  línea de JavaScript
- Las páginas legales y `/estilo` mandan **cero** JavaScript de cliente. Es la
  vara de medir, no una casualidad: si la guía del sistema necesitara cliente
  para enseñar sus propios componentes, los componentes estarían mal

## 3. Tres tipos de archivo, y no se mezclan

| Carpeta                       | Hace                           | NUNCA hace               |
| ----------------------------- | ------------------------------ | ------------------------ |
| `src/app/**/page.tsx`         | Rutas, `metadata`, pedir datos | Lógica de negocio        |
| `src/components/ui/**`        | Primitivos genéricos           | Saber qué es fittraining |
| `src/components/<feature>/**` | Componentes del dominio        | Pedir sus propios datos  |
| `src/lib/**`                  | Lógica, datos, tipos           | Contener JSX             |

- La dependencia va en **una sola dirección**: feature → primitivo. NUNCA al
  revés
- Un archivo de `components/ui/` que importe algo de dominio es un error de
  arquitectura, no un detalle

## 4. La API entra por una sola puerta

- NUNCA un `fetch()` dentro de un componente o de un `page.tsx`
- Todo acceso a `fitmess-api` vive en `src/lib/api/`
- La respuesta se **valida** en esa frontera antes de entrar en la app
- Motivo: son dos repos separados. Sin validación en el borde, un campo que el
  backend cambia revienta en producción sin decir dónde

## 5. Nada de estado global, barriles ni abstracciones prematuras

- NUNCA instalar Redux, Zustand ni un gestor de estado. URL + Server
  Components + `useState` alcanzan. Cuando haga falta cachear datos del
  servidor: TanStack Query, y no antes
- NUNCA crear barrel files (`index.ts` que reexporta). Rompen el tree-shaking
  y crean imports circulares
- NUNCA abstraer antes de la **tercera** repetición

## 6. Idioma y tono

- Identificadores, funciones, tipos, carpetas y clases CSS: **inglés**
- Texto visible, contenido, comentarios y mensajes de commit: **español**
- Regla corta: si lo lee una máquina, inglés; si lo lee una persona, español
- NUNCA mezclar dentro de un mismo identificador (`getRutinasDelDeportista`)
- Excepción: las URLs, fijadas por `definicion-web.md § 3`

Y el tono, que es lo que más se olvida:

- El producto **tutea**: «Entrena con un plan real», «tu progreso», «Elige tu
  plan». Frases cortas y en presente
- **Los documentos legales son la excepción y van en «usted»**, como ya están
  publicados. `content/legal/` no se reescribe para uniformar el tono: son
  textos jurídicos versionados y nunca se borra una versión
- Mayúsculas completas **solo** en botones, etiquetas y metadatos. Nunca en un
  titular ni en un párrafo
- Cifras concretas: «12 semanas», «4 sesiones». Nunca «muchas»
- **La copy no afirma lo que la pantalla no enseña.** Un recuento («cuatro
  tipos»), un dato concreto de algo inexistente («las ocho semanas») o un «a
  la vista» describen lo que hay en la página **hoy**, no lo que habrá. Cuando
  se borra una sección, la copy que la contaba se borra con ella — y eso
  incluye la que no se ve dentro de la página: **`metadata` (`title`,
  `description`, Open Graph) es texto de producto**, y es justamente el que
  publica el buscador y el que se lee **antes** de entrar. Si un dato solo será
  cierto cuando exista otra pantalla, se escribe la frase sin el dato. Y las
  muestras de `/estilo` se eligen **entre la copy viva del producto**: un
  espécimen mide forma —familia, peso, medida de línea—, nunca afirma un hecho,
  y cuando la copy cambia el espécimen la sigue
- Sin emoji, sin signos de exclamación, sin jerga de gimnasio
- Los textos legales se nombran igual que en el documento oficial

---

## Estilos

- Tailwind es el sistema por defecto
- **Excepción permitida 1:** `legal-shell.module.css`, porque estiliza el HTML
  que genera `marked` y ese HTML no tiene clases donde colgar utilidades
- **Excepción permitida 2:** las cuatro clases globales de `globals.css`
  —`.scrim-side`, `.scrim-bottom`, `.photo-slot` y `.grid-cards`—. Las tres
  primeras son **degradados**, es decir color, y por la regla 1 el color solo
  vive en `globals.css`; escribirlas como `bg-[linear-gradient(...)]` en una
  pantalla sería exactamente el valor suelto que la regla prohíbe.
  `.grid-cards` es la única rejilla del sistema y se repite en cada sección,
  muy por encima de la tercera repetición
- Esas hojas y clases **tampoco declaran colores literales**: consumen los
  tokens globales
- Cualquier excepción nueva debe justificarse con la misma concreción y
  quedar escrita aquí. "Es más cómodo" no es justificación

## Imagen

- NUNCA texto directamente sobre una foto: siempre un degradado de protección
  en medio. `.scrim-side` para el héroe, `.scrim-bottom` para la tarjeta
- Mientras no haya fotos va `.photo-slot` con la etiqueta monoespaciada de lo
  que falta. NUNCA un `<div>` gris improvisado ni una imagen de relleno de un
  tercero
- Tamaños: héroe 2400×1400, tarjeta 1200×1400, retrato 400×400
- **Cambiar una foto es cambiar su nombre de archivo.** `heroe.jpg` →
  `heroe-2.jpg`, y se actualiza la ruta en el componente. Las variantes
  optimizadas se cachean un año (`minimumCacheTTL` en `next.config.ts`) y su
  URL se construye con el nombre, que no cambia al desplegar: reemplazar el
  archivo conservando el nombre deja a quien ya la tenga viendo la vieja
- Toda foto pasa por `PhotoSlot` con `sizes`, nunca por un `<img>` suelto. Sin
  `sizes`, `fill` asume `100vw` y le sirve a un teléfono el archivo entero
- Sin filtros de color de marca sobre la piel

## Movimiento

- Hover: **160ms**, `ease-out`. Es el valor **por defecto** de toda transición
  (`--default-transition-duration` en `globals.css`), así que un
  `transition-colors` pelado ya sale bien y no hay que acordarse
- Entrada de paneles y acordeones: **240ms**, solo opacidad y 8px de
  desplazamiento
- Carrusel: 6s, con fundido, y se detiene al pasar el cursor
- NUNCA rebotes, escalados en hover, parallax ni nada de más de **400ms**
- `prefers-reduced-motion` ya está resuelto globalmente. NUNCA anularlo

## Accesibilidad

- Todo lo enfocable muestra el anillo de foco. Ya está resuelto globalmente
  con `:focus-visible` en `globals.css` —2px de cian claro con 3px de
  separación— NUNCA anularlo con `outline: none`
- NUNCA comunicar un estado **solo** con color (WCAG 1.4.1). Los avisos llevan
  icono o texto además del color: «sesión registrada», no solo el punto verde
- Área de toque: **44px** de alto mínimo para una acción. El tamaño `sm` del
  botón (36px) existe solo para tablas y paneles densos y NUNCA lleva la
  acción principal de una pantalla
- Los niveles de encabezado (`h1`…`h6`) describen la **jerarquía del
  documento**, no el tamaño del texto. El tamaño se ajusta con clases: un
  `<h2 className="text-h4">` es correcto y son dos decisiones distintas
- Un enlace que navega es `<Link>`; un botón que ejecuta es `<button>`. NUNCA
  intercambiarlos por apariencia — para un enlace con aspecto de botón existe
  `buttonStyles()`
- Un dato que solo existe como longitud (una barra de progreso) necesita el
  número en texto además del gráfico

### Las tres desviaciones deliberadas del canvas

El canvas 1.0 incumple sus propios mínimos en tres sitios. `globals.css` los
corrige, y **la corrección manda**. No son descuidos que haya que "arreglar"
volviendo al valor del canvas:

1. **`--input` es `#546366`, no el `#2A3234` con que el canvas dibuja los
   campos.** Ese gris mide 1.49:1 sobre el fondo y WCAG 1.4.11 exige 3:1 para
   el límite de algo que se opera. `#546366` es el mínimo que cumple
2. **`--meta-foreground` es `#768486`, no `#6D7A7C`.** El original mide 4.38:1
   sobre el fondo y 3.96:1 sobre la superficie alta; como los metadatos van a
   12px son texto normal y exigen 4.5:1
3. **El botón `sm` mide 36px y no 44px.** El canvas se contradice: pide 44px
   de alto mínimo y a la vez define un tamaño chico «solo para tablas y
   paneles». Se resuelve del lado de la norma exigible — 36px pasa de sobra el
   mínimo AA real (WCAG 2.5.8, 24px) — y a cambio `sm` queda prohibido para la
   acción principal

## Testing

- Los tests unitarios son `*.test.ts(x)` **junto al archivo que prueban**
- Cobertura medida **por archivo** (`thresholds.perFile: true`), nunca sobre
  el promedio. NUNCA volver a `perFile: false`: con el promedio, un archivo en
  0% pasa escondido detrás de los demás
- Umbrales: 80% líneas / 80% funciones / 80% statements / 75% ramas
- `coverage.include` cubre hoy solo `src/lib/`. Ampliarlo es una decisión
  deliberada que acompaña al código que la justifica — NUNCA se reduce para
  que un gate pase
- Un test que solo comprueba que React renderiza no es cobertura, es ruido
- Un test de copy sobre el DOM renderizado **no ve `metadata`**: es un `export`
  del módulo, no un nodo del documento. La copy de `metadata` se prueba
  importando el export. Un guardián de texto que solo mira
  `container.textContent` cubre menos de lo que aparenta, y esa apariencia es
  peor que no tenerlo
- Los tests de aceptación con Playwright llegan con el panel. Todavía no existen

## Gates y verificación

- Los cinco gates (`typecheck`, `lint`, `format`, `test`, `build`) se corren
  con **`pnpm run gates`**, que escribe `outputs/gates.json`
- Ese JSON es la **única fuente de números**. NUNCA transcribir un porcentaje
  o un conteo a un reporte: se referencia por su `timestamp`
- NUNCA escribir "PENDIENTE", "PENDIENTE_EJECUCION_REAL" ni placeholders. Si
  el script falla, se reporta el error real
- Ningún agente reporta trabajo completo sin **confirmarlo contra el disco**:
  - Con Bash: `pnpm run gates:check`, o `git status --short`
  - Sin Bash: un `Read` explícito del archivo después del `Write`
- NUNCA vale como confirmación el valor de retorno del propio `Write`, ni un
  grep de contenido que ya está en el contexto: ese grep coincide con lo que
  el agente redactó, no prueba que el disco haya cambiado
- **El contrato de un ítem vive en `specs/W-XX.md`, en git**, con una sola
  copia y enmendado editando el cuerpo — nunca prefijando un bloque que
  invalide lo de abajo. Las reglas del directorio están en `specs/README.md`
- **Al cerrar un ítem se archivan sus artefactos** en `docs/evidencia/W-XX/`:
  el spec, el reporte del QA, la revisión y el `gates.json` que citan. Sin eso,
  un reporte que dice «gates.json @ 00:47:10Z» apunta a un archivo que la
  corrida siguiente sobrescribió
- **Un gate que no corre es indistinguible de uno que pasa.** Lo mismo un
  artefacto que no se escribió
- **Y un criterio de aceptación sin verificador es indistinguible de uno que
  se cumple.** Cada criterio del plan declara quién lo comprueba —`[gate]`,
  `[test:<archivo>]`, `[navegador]` o `[humano]`—; uno cuyo verificador no se
  puede correr hoy no pasa el Checkpoint 1
- **Lo que exige navegador se mira en un navegador**: `pnpm run screenshot`
  levanta el build y captura la ruta a 320, 390 y 1440. NUNCA se cierra un
  criterio `[navegador]` «por análisis» — los cinco gates estuvieron en verde
  desde que se construyó el héroe hasta que alguien abrió la página, y en todo
  ese tiempo su foto no se dibujaba

### El sistema de diseño lo comprueba `lint`

No es un sexto gate —`gates.json` sigue teniendo cinco—: va **dentro** de
`lint`, que es lo que le da fuerza. Rompe `pnpm run lint`, rompe `next build`
y rompe la CI, sin añadir un paso que alguien pueda saltarse.

- La regla local `design-system/no-untokenized-style`
  (`eslint-rules/design-system.mjs`) convierte en **error** un color literal,
  la paleta de fábrica de Tailwind, un valor suelto donde el sistema tiene
  escala, un `dark:`, un `warm`, un radio fuera del sistema y una sombra
- Lo que **no** cubre, y por tanto sigue siendo revisión humana:
  - **El CSS.** ESLint no lo lee, así que `legal-shell.module.css` queda fuera
  - **El tono.** Un «usted» es un defecto en producto y lo correcto en
    `content/legal/`; ninguna regla puede distinguirlo sola
  - **El token correcto, no solo uno válido.** `bg-accent` compila y sale
    gris, porque `accent` está reservado para el hover de shadcn y el cian es
    `primary`
- Los `*.test.ts(x)` están **exentos** a propósito: el test de
  `design-tokens` comprueba que `--primary` sigue valiendo lo que la guía
  enseña, y para eso tiene que poder nombrar el color. No debilita nada: un
  test no se renderiza
- La regla tiene sus propios tests (`eslint-rules/design-system.test.mjs`), y
  la mitad comprueba que **no** dispara con lo legítimo. Un gate con falsos
  positivos se acaba desactivando, y entonces deja de proteger también lo que
  sí protegía

## Orquestación de agentes

- Los agentes de `.claude/agents/` se lanzan **como subagentes** (herramienta
  Agent), NUNCA como teammates. `.claude/settings.json` fija
  `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0`
- Motivo (medido en `fitmess-api`, EPICA-06): un teammate corre **sin los
  `skills:` de su frontmatter, sin `maxTurns` y sin disparar los hooks
  `SubagentStart/Stop`**. La cadena Implementador → QA → Líder Técnico es
  secuencial por diseño y se comunica por artefactos, no debatiendo
- Máximo **3 ciclos** de corrección. Al tercero sin resolver: **escalar al
  humano**, nunca intentar un cuarto
- Para continuar un agente ya terminado se usa `SendMessage` a su nombre:
  reanuda con su contexto. Relanzarlo desde cero es la excepción

## Git

- Git lo opera **exclusivamente el humano**
- Ningún agente ejecuta `git add`, `git commit`, `git push` ni `git tag`
- Única excepción: el skill `/commit`, porque lo invoca el humano de forma
  explícita
- `main` es lo que despliega Amplify. El trabajo va en `develop` y llega a
  `main` por PR
- NUNCA commitear con `--no-verify`

## Despliegue

- `next` y `eslint-config-next` están pinneados a `15.5.25` **a propósito**:
  Amplify no soporta Next 16
- NUNCA usar streaming, Edge middleware ni ISR on-demand: Amplify tampoco los
  soporta
- Antes de tocar cualquiera de esas dos versiones: leer
  `docs/despliegue-amplify.md`
- Las fuentes se auto-hospedan con `next/font`. NUNCA enlazar
  `fonts.googleapis.com` desde la app: el canvas lo hace porque es un HTML
  suelto, la app no
