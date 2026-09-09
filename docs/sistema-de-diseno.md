# Sistema de diseño y convenciones de código

Este documento es el **porqué**. La versión normativa y corta —una línea por
regla, sin prosa— vive en
[`.claude/rules/rulesFrontend.md`](../.claude/rules/rulesFrontend.md), que es
lo que leen los agentes. Si los dos se contradicen, **manda el de reglas** y
hay que corregir éste.

Todo lo que describe se puede ver funcionando en **`/estilo`**, que no es
documentación sino el sistema en vivo: usa los mismos tokens y los mismos
componentes que las páginas reales, así que no puede quedarse desactualizado.

## De dónde sale el sistema

La intención visual está en el canvas `docs/sistema_diseño/`, versión 1.0: dos
archivos `.dc.html` con el sistema completo y la landing. El canvas es una
**maqueta** —HTML suelto, hexadecimales incrustados, fuentes enlazadas desde
Google— y por eso no se copia nada de él a un componente. Se traduce a tokens
en `globals.css`, y el componente pide el token.

Esa traducción no es mecánica en tres sitios, donde el canvas incumplía sus
propios mínimos de accesibilidad y `globals.css` lo corrige. Están listadas en
`rulesFrontend.md § Accesibilidad`; el resumen es que **la norma manda sobre
la maqueta**.

---

## 1. La regla que sostiene todo lo demás

> **Los componentes nombran roles, no colores.**
> Se escribe `bg-primary`, nunca `bg-teal-400` ni `#28E0C8`.

`primary` es un rol: «la acción principal». Que hoy sea cian es un detalle de
implementación que vive en un único archivo — y ya cambió una vez, de verde a
cian, sin tocar un solo componente. Esa es toda la prueba que necesita la
regla.

De aquí sale todo:

- Cambiar la marca es cambiar un archivo.
- Un componente no sabe de qué color es nada, así que no puede desafinar.
- **`dark:` en un componente es un error.** No hay modo claro: no existe un
  segundo tema al que aplicarse.

**Ningún archivo del repo escribe un color.** Ni un hex, ni un `rgb()`, ni un
`text-neutral-500` de la paleta de fábrica de Tailwind. Todo sale de
`src/app/globals.css`.

Y desde la versión 1.0 la regla es más ancha que el color: **tampoco se
escribe un tamaño de texto, un tracking ni un radio sueltos**. Un
`text-[21px]` es el mismo problema que un `#28E0C8`, solo que menos visible.

### Las cuatro decisiones que explican el resto

1. **Fondo oscuro siempre.** La interfaz vive sobre negro carbón. No hay modo
   claro. La foto es la que aporta luz — por eso § 8 le dedica reglas propias.
2. **Un solo acento.** El cian marca lo accionable y el dato clave. Si todo es
   cian, nada lo es: como mucho un botón primario por vista.
3. **Titulares pesados.** La jerarquía la hace el contraste de peso
   (Archivo 800/900 en grande), no el color. Es lo que permite que el cian
   quede libre para señalar acciones.
4. **Bloques a sangre.** Las secciones se separan con una línea de 1px, no con
   tarjetas flotantes. **No existe un token de sombra y no se añade uno:** una
   sombra negra sobre fondo negro no se ve, y mantenerla obligaría a inventar
   un valor que solo sirve para disimular esa limitación.

---

## 2. Los tokens

### Colores

Los nombres **no son libres**: son los que espera `shadcn/ui`. Hoy no usamos
shadcn (ver § 6), pero respetar la convención cuesta cero y significa que el
día que llegue, los componentes aparecen ya con nuestra marca.

**Ojo con una traducción:** el canvas llama «acento» al cian de marca. En el
código ese rol es **`primary`**. `--accent` se queda reservado para lo que
shadcn entiende por acento —el fondo tenue de un `hover`— porque si le
robábamos el nombre, el día que se instale shadcn los menús saldrían cian
fosforito. Cuando el canvas dice «acento», el código escribe `bg-primary`.

| Rol                          | Para qué                             | Regla de uso                                   |
| ---------------------------- | ------------------------------------ | ---------------------------------------------- |
| `background`                 | El lienzo                            | —                                              |
| `card`                       | Superficie sobre el lienzo           | —                                              |
| `muted`                      | Superficie alta: cabecera, hover     | —                                              |
| `border`                     | Separadores y marcos                 | Decorativo, sin requisito de contraste         |
| `border-strong`              | Separador con más presencia          | Decorativo                                     |
| `input`                      | Límite de algo que se **opera**      | 3:1 obligatorio: WCAG 1.4.11                   |
| `title`                      | Blanco puro                          | **Solo** titulares y texto sobre el botón cian |
| `foreground`                 | Cuerpo fuerte                        | El texto por defecto                           |
| `muted-foreground`           | Cuerpo secundario                    | Nunca el texto principal                       |
| `subtle-foreground`          | Terciario: navegación inactiva       | —                                              |
| `meta-foreground`            | Metadatos monoespaciados             | —                                              |
| `disabled-foreground`        | Deshabilitado                        | Exento de contraste por WCAG 1.4.3             |
| `primary`                    | **La** acción. El cian               | Como mucho una por pantalla                    |
| `primary-hover` / `-pressed` | Sus dos estados                      | No inventar un `primary/90`                    |
| `primary-soft`               | Fondo de insignia, con cian encima   | —                                              |
| `accent`                     | Fondo de `hover`                     | **Reservado para shadcn. No es el cian**       |
| `success`                    | Confirmación                         | Solo en avisos, **siempre con texto o icono**  |
| `warning`                    | Atención sin error                   | —                                              |
| `destructive`                | Dato inválido, o borrar sin deshacer | —                                              |
| `info`                       | Nota del entrenador                  | —                                              |
| `ring`                       | Anillo de foco del teclado           | Ya está puesto globalmente                     |

Cuatro decisiones que parecen raras y no lo son:

**`border`, `border-strong` e `input` son tres tokens distintos.** No es
estética, es accesibilidad. Los dos primeros separan cosas y son decorativos,
así que la norma no les exige contraste — por eso pueden ser tan sutiles
(1.21:1). `input` es el límite de algo que se _opera_ —un campo, una casilla,
un punto de carrusel— y WCAG 1.4.11 le exige 3:1 contra el fondo, o la gente
no ve dónde escribir.

**Hay cinco niveles de texto y no dos.** Con fondo oscuro y una sola familia
de color, la jerarquía de un párrafo se hace con la luminosidad del gris. Si
solo existieran `foreground` y `muted-foreground`, todo lo secundario acabaría
con el mismo peso y la página se leería plana.

**Ya no existe `warm`.** El sistema anterior tenía una terracota de
contrapunto para destacar un dato. El canvas 1.0 decide un solo acento y la
elimina: el dato del plan se destaca con el cian, que es el mismo color de la
acción, y funciona porque el resto de la página es gris.

**`success` ya no compite con la marca.** Antes la marca era verde y `success`
también, así que la separación tenía que ser de uso. Con la marca en cian el
verde queda libre — pero la regla del icono se mantiene, porque no era una
solución a ese choque: **WCAG 1.4.1 prohíbe comunicar algo únicamente con
color**, y sin texto al lado la interfaz es ambigua para quien no distingue el
verde del rojo. «Sesión registrada», no solo el punto verde.

Todos los pares están medidos y anotados en `globals.css`, y la columna se ve
en `/estilo`. **Si cambias un color, vuelve a medirlo** — esa columna es donde
se nota si no lo hiciste.

### Tipografía

**Dos familias y un monoespaciado**, cargadas con `next/font` desde
`layout.tsx`.

Antes era una sola (Inter) y el argumento era que mezclar familias se ve
desordenado. Sigue siendo cierto en general, y aun así el sistema 1.0 cambia
de opinión por un motivo concreto: la jerarquía se hace con **contraste de
peso**, y para eso hace falta una display que llegue a 900 sin empastarse
junto a una de texto que se lea cómoda en 300. Ninguna familia única hace bien
las dos cosas.

| Familia        | Rol               | Pesos                 | Nota                                 |
| -------------- | ----------------- | --------------------- | ------------------------------------ |
| **Archivo**    | Titulares, cifras | 700 / 800 / 900       | Variable. Nunca por debajo de 20px   |
| **Barlow**     | Texto e interfaz  | 300 / 400 / 500 / 600 | No es variable: se piden esos cuatro |
| `ui-monospace` | Metadatos         | —                     | La del sistema. No se descarga nada  |

Barlow **no es variable**, así que cada peso es un archivo. Se piden los
cuatro que el sistema usa y ni uno más: párrafos en 300, interfaz en 500,
botones y etiquetas en 600.

`next/font` no es comodidad. Auto-hospeda las fuentes en nuestro dominio
durante el build: no hay petición a `fonts.googleapis.com` en tiempo de
ejecución —una dependencia externa menos, y un dato menos que sale del
navegador de un usuario hacia un tercero, lo cual importa en una app que gira
alrededor del tratamiento de datos personales— y reserva el espacio antes de
descargarlas, así que el texto no salta. **El canvas sí enlaza Google porque
es un HTML suelto; la app no lo hace nunca.**

**La escala es de rol, no de tamaño**, y eso resuelve una confusión que se
repite: `text-display`, `text-h2`, `text-h3`, `text-h4`, `text-lead`,
`text-body`, `text-ui`, `text-action`, `text-label`. El nivel de un encabezado
(`h1`…`h6`) describe la jerarquía del documento; el tamaño se ajusta con la
clase. Un `<h2 className="text-h4">` es correcto y son dos decisiones
distintas — la primera la lee un lector de pantalla, la segunda un ojo.

El **tracking** también es token (`tracking-brand`, `-eyebrow`, `-label`,
`-meta`, `-nav`). Ninguno de los cinco valores del canvas cae en la escala de
fábrica de Tailwind, así que sin token acabarían como `tracking-[.14em]`
sueltos por las pantallas.

Regla de ancho de línea: un párrafo no pasa de **620px**, que es lo que
devuelve `Container size="prose"`. Los titulares llevan `text-wrap: balance` y
los párrafos `pretty`, puestos globalmente para no depender de que alguien se
acuerde.

`.tabular` para cifras de ancho fijo. Suena menor y no lo es aquí: en una
tabla de series, pesos y tiempos las cifras proporcionales bailan de fila en
fila y la columna se vuelve difícil de comparar de un vistazo.

### Espaciado y radios

- **Espaciado:** la escala de 4px que Tailwind trae de fábrica. **No inventamos
  una propia.** El canvas dibuja un paso de 34px que no está en la escala; se
  usa 32px, que es la parada real y una diferencia que nadie ve.
- **Radios:** cuatro, y se reparten **por tipo de pieza, no por tamaño** —
  `rounded-none` en bloques y tarjetas (es el valor por defecto del sistema),
  `rounded-sm` (2px) solo en el botón rectangular de la barra, `rounded-pill`
  en el botón de acción, `rounded-full` en avatares.

  Antes eran tres escalones (4/8/12px) aplicados a todo. El cambio es de
  fondo: **el sistema nuevo no tiene esquinas suaves.** La tarjeta es un
  rectángulo con borde de 1px y lo único redondeado es la pastilla del botón.
  Un radio intermedio suelto por el CSS es exactamente lo que un sistema
  evita.

- **Movimiento:** 160ms en hover con `ease-out`, 240ms en la entrada de un
  panel, y nada de rebotes, escalados ni parallax. El valor de 160ms está
  puesto como **transición por defecto** en `globals.css`, así que un
  `transition-colors` pelado ya sale bien: la regla se cumple por omisión en
  vez de por disciplina.

---

## 3. Tono y voz

**El producto tutea. Los documentos legales van en «usted».**

Esa asimetría es deliberada y conviene entender por qué, porque el repo
sostuvo lo contrario hasta la versión 1.0 del canvas.

El argumento anterior era: los documentos legales tratan al lector de «usted»,
luego el producto entero debía hacerlo, porque manejamos datos de salud y
consentimientos, y un producto que tutea alrededor de un consentimiento se lee
como poco confiable. La consistencia de voz valía más que cualquier otra cosa.

Lo que ese razonamiento pasaba por alto es que **no son el mismo texto ni el
mismo acto**. Un consentimiento informado es un documento jurídico: se
redacta para que sea inequívoco y para que aguante una lectura legal, y ahí el
«usted» es la convención. Una landing que dice «Entrena con un plan real» es
otra cosa: le habla a alguien que está decidiendo si entrena, y el «usted» ahí
no suena serio, suena distante.

Así que la consistencia se mantiene donde importa —**dentro de cada tipo de
texto**— y no se fuerza entre tipos distintos:

- **Producto** (landing, panel, formularios, mensajes de error): tuteo, frases
  cortas, presente.
- **`content/legal/`**: «usted», y no se reescribe. Son textos versionados y
  publicados; **nunca se borra una versión**. Uniformar el tono a posteriori
  significaría emitir cinco versiones nuevas de documentos legales por una
  razón estética, que es exactamente el tipo de cambio que no se hace a un
  consentimiento.

El resto de la voz no cambia y sigue siendo lo que evita el «¡vamos,
campeón!»:

- Cifras concretas: «12 semanas», «4 sesiones». Nunca «muchas».
- Mayúsculas completas **solo** en botones, etiquetas y metadatos. Nunca en un
  titular ni en un párrafo.
- Sin emoji, sin signos de exclamación, sin jerga de gimnasio.
- Los textos legales se nombran igual que en el documento oficial.

Así sí: «De cero a diez kilómetros en 12 semanas.» · «Tu entrenador ve tu
progreso y ajusta lo que haga falta.»

Así no: «¡Transforma tu vida hoy mismo!» · «La plataforma líder en soluciones
fitness.»

---

## 4. Dónde va cada cosa

> La versión **normativa y corta** de esta sección —una línea por regla, sin
> prosa— vive en [`.claude/rules/rulesFrontend.md`](../.claude/rules/rulesFrontend.md),
> que es lo que leen los agentes. Aquí está el porqué. Si los dos se
> contradicen, manda el otro.

### Tres tipos de archivo, y no se mezclan

| Carpeta                   | Hace                                  | **No** hace              |
| ------------------------- | ------------------------------------- | ------------------------ |
| `app/**/page.tsx`         | Rutas, `metadata`, pedir datos        | Lógica de negocio        |
| `components/ui/**`        | Primitivos genéricos                  | Saber qué es fittraining |
| `components/<feature>/**` | Componentes que sí conocen el dominio | Pedir sus propios datos  |
| `lib/**`                  | Lógica, datos, tipos                  | Contener JSX             |

La dependencia va **en una sola dirección**: los componentes de feature usan
los primitivos, nunca al revés. Si un `Button` alguna vez importa algo de
`rutinas/`, el sistema ya se rompió.

### Servidor por defecto, cliente en la hoja

En App Router **todo componente es de servidor salvo que diga `'use client'`**,
y `'use client'` es **contagioso hacia abajo**: si lo pones en un `page.tsx`,
la página entera y todos sus hijos viajan como JavaScript al navegador.

**Ponlo lo más abajo posible**, en el botoncito que necesita `onClick`.

Hoy las páginas legales y `/estilo` mandan **cero** JavaScript de cliente. Esa
es la vara de medir.

### Una sola puerta para la API

Cuando empiece a consumirse `fittraining-api`:

- **Todo `fetch()` vive en `src/lib/api/`.** Nunca dentro de un componente.
- **La respuesta se valida ahí** (con `zod`) antes de entrar en la app.

Esto importa más aquí que en un proyecto normal por ser dos repos separados:
el backend puede cambiar un campo y el frontend no se entera hasta que
revienta en producción con un `undefined is not a function`. Validar en el
borde convierte eso en un error claro, en un solo sitio.

### Tres cosas que no hacemos

- **Nada de Redux, Zustand ni gestores de estado.** URL + Server Components +
  `useState` cubren hasta bien entrado el panel. Cuando haga falta cachear
  datos del servidor: TanStack Query, y no antes.
- **Nada de barrel files** (`index.ts` que reexporta todo). Rompen el
  tree-shaking y crean imports circulares.
- **No se abstrae hasta la tercera repetición.** Dos usos parecidos casi nunca
  son el mismo concepto.

---

## 5. Estilos: Tailwind, con dos excepciones

**Tailwind es el sistema por defecto.** Toda la interfaz se escribe con
utilidades sobre los tokens.

Hay **dos excepciones**, y las dos están justificadas por el mismo criterio:
no es que Tailwind sea incómodo ahí, es que no puede llegar.

**1. Las páginas legales** (`legal-shell.module.css`). Lo que se estiliza ahí
es el HTML que genera `marked` a partir del markdown. Ese HTML no tiene clases
y nunca las va a tener, así que no hay dónde colgar una utilidad; hay que
apuntarle con selectores (`.prose h2`, `.prose table`). Es CSS Modules, pero
**no declara ni un color**: consume los mismos tokens que el resto.

**2. Cuatro clases globales en `globals.css`.** `.scrim-side`,
`.scrim-bottom`, `.photo-slot` y `.grid-cards`.

Las tres primeras son **degradados**, es decir color, y por la regla 1 el
color solo vive en `globals.css`. Escribirlas en una pantalla como
`bg-[linear-gradient(...)]` sería exactamente el valor suelto que la regla
prohíbe, solo que más largo. Existen porque el sistema (§ 8) prohíbe poner
texto directamente sobre una foto: siempre va un degradado de protección en
medio, lateral para el héroe e inferior para la tarjeta. `.photo-slot` es el
hueco de foto mientras no hay fotos — tenerlo como clase evita que cada
pantalla dibuje su propio placeholder gris y que el día de las fotos haya que
salir a buscarlos.

`.grid-cards` es la única rejilla del sistema:
`repeat(auto-fit, minmax(320px, 1fr))`, que da cuatro columnas en escritorio,
dos en tableta y una en móvil **sin escribir un solo punto de quiebre** y sin
huecos huérfanos en la última fila. Se repite en cada sección del producto,
muy por encima de la tercera repetición a partir de la cual está permitido
abstraer.

Si aparece otra excepción, tiene que poder justificarse igual de concretamente
y quedar escrita aquí. «Es más cómodo» no es justificación.

**Un detalle práctico:** los primitivos concatenan clases con una plantilla,
sin `tailwind-merge`. Eso significa que pasar `className="bg-destructive"` a un
`<Button variant="primary">` **no gana necesariamente**: en CSS gana la regla
según el orden de la hoja, no el orden del atributo. La forma correcta de
cambiar el aspecto de un botón es una variante, no un `className`.

---

## 6. Librería de componentes: shadcn/ui, y por qué todavía no

**La decisión está tomada: cuando haga falta una librería, será `shadcn/ui`.**

La razón es concreta: **no es una dependencia**. El CLI copia el código fuente
a nuestro repo. Se puede abrir `components/ui/dialog.tsx`, leerlo y entenderlo,
y nunca quedamos bloqueados esperando el fix de un mantenedor. Para un equipo
que está aprendiendo, es la diferencia entre usar magia y aprender.

Se descartaron **MUI, Mantine y Chakra**: traen su propio motor de estilos que
pelearía con Tailwind, pesan de más para un sitio mayormente estático, y
encierran — cuando el componente no hace lo que necesitas, no lo puedes tocar.

**Pero todavía no se instala.** Las páginas públicas necesitan un botón, una
tarjeta y un contenedor; montar un sistema de componentes para eso es
sobre-ingeniería. Donde se paga solo es en **el panel del entrenador**:
diálogos, dropdowns, selectores de fecha, tablas, trampas de foco, navegación
por teclado, ARIA. Eso son semanas de trabajo fino de accesibilidad que no se
deben escribir a mano.

Cuando llegue ese día (septiembre de 2026, `shadcn init` usa **Base UI** por
defecto; `-b radix` para lo otro):

```bash
pnpm dlx shadcn init
```

Como nuestros tokens ya usan sus nombres, los componentes llegan con nuestra
marca puesta y **no hay que reestilizar nada**.

### Iconos

**`lucide-react`**, cuando haga falta el primero. Es el default de shadcn,
tree-shakeable si se importan uno a uno, y de trazo consistente.

La regla que de verdad importa: **una sola librería de iconos, siempre.**
Mezclar dos es lo que más rápido hace que una interfaz se vea amateur.

---

## 7. Idioma del código

- **Identificadores, funciones, tipos, carpetas y clases CSS: inglés.**
- **Texto visible para el usuario, contenido y comentarios: español.**

La regla corta: _si lo lee una máquina, inglés; si lo lee una persona,
español._ Evita mezclas dentro de un mismo nombre (`getRutinasDelDeportista`),
que es lo peor de los dos mundos.

Las URLs son la excepción evidente: son texto que lee una persona y están
fijadas por `definicion-web.md § 3`.

---

## 8. Lo que falta

- **Los controles de autenticación de la portada están inertes, y se acepta
  el riesgo.** «Iniciar sesión», «Registrarme» y los dos «Crear mi cuenta»
  son `<span>`, no enlaces: se ven exactamente igual que un control vivo y no
  hacen nada. El QA lo levantó (revisión 2 de W-10) con un criterio que
  conviene no perder: el árbol de accesibilidad es hoy **más honesto que la
  capa visual** —un lector de pantalla anuncia el rol y distingue, un usuario
  de ratón no—, y el estado «todavía no funciona» se comunica **por
  ausencia**, que es hermano del «solo con color» que la regla § Accesibilidad
  prohíbe. El humano decidió **dejarlo así por ser temporal** (2026-09-08).

  **Qué hay que hacer cuando existan las páginas de auth:**
  `grep -rn '\[sin-destino\]' src/` localiza los cinco sitios. Cada `<span>`
  pasa a `<Link>` y **hay que quitar `pointer-events-none`** de los tres que
  usan `buttonStyles()`: si se queda, el control será operable con teclado y
  estará muerto con el ratón, que es peor que lo de ahora.

- **La portada invita a registrarse y los documentos publicados dicen que
  todavía no se puede.** Los Términos y Condiciones § 12 afirman que
  fittraining «opera hoy en fase de prueba, con acceso limitado», y
  `definicion-web.md § 3` dice «sin registro público» y que la web no lleva
  botón de «Crear cuenta». La portada, desde la revisión 2 de W-10, dibuja
  «Registrarme», «Iniciar sesión» y «Crear mi cuenta», porque el producto
  cambió: el atleta se registrará desde la web y el entrenador iniciará
  sesión.

  **No es un defecto del código, es un pendiente de producto.** Hoy las tres
  piezas son inertes —se dibujan y no navegan— así que nada promete una
  pantalla que no exista. Lo que hay que hacer antes de producción es
  actualizar los dos documentos: los Términos, con su versión y su fecha,
  porque son texto publicado y una versión no se borra; y
  `definicion-web.md § 3`, que fija lo que la web hace.

- **La landing (W-10) está construida, pero no publicada.** Vive en
  `src/app/page.tsx` con sus piezas en `src/components/landing/` y
  `src/components/site/`, sigue el canvas
  (`docs/sistema_diseño/fittraining Landing.dc.html`) y manda cero JavaScript
  de cliente. Lo que le falta para llegar a `main` son las fotos — el punto de
  abajo.

  Tres piezas del canvas **no se dibujan a propósito**, y las tres por el
  mismo motivo: no tienen destino. El carrusel del héroe (sería el único JS de
  cliente de la web pública, y no hay fotos que rotar), «VER TODOS →» del
  bloque de entrenadores y el avatar «+9», que afirmaría que hay doce
  entrenadores dados de alta.

  Y no hay sección de planes: la revisión 2 la quitó junto con el contenido
  provisional que la llenaba. «Planes» sigue en la barra, inerte, hasta que
  exista la página. Las tres piezas sin destino —«Planes», «Iniciar sesión» y
  «Registrarme»/«Crear mi cuenta»— están marcadas con `[sin-destino]` en el
  código: `grep -rn '\[sin-destino\]' src/` las encuentra todas.

- **Las fotos.** No hay ninguna. Todo lo que las espera usa `.photo-slot` con
  la etiqueta monoespaciada de lo que falta y el tamaño previsto. Los tres
  formatos están fijados: héroe 2400×1400, tarjeta 1200×1400, retrato 400×400.
- **Un icono.** No se ha instalado `lucide-react` porque todavía no hay ningún
  icono en el producto. Los avisos de `/estilo` usan caracteres de texto como
  marcador de sitio.
- **El CSS, que sigue sin comprobación automática.** La regla de ESLint
  `design-system/no-untokenized-style` ya cubre `src/**/*.{ts,tsx}`, que es
  donde vive `className` y por donde se escapaba todo. Lo que queda fuera es
  `legal-shell.module.css`: ESLint no lee CSS, y cubrirlo exigiría Stylelint,
  es decir una dependencia nueva. Hoy esa hoja consume tokens y no declara ni
  un color, así que el riesgo es bajo — pero es una comprobación humana.
- **Tests de componente.** `coverage.include` cubre solo `src/lib/`. Los
  componentes son hoy presentación sin ramas; cuando el panel traiga
  formularios y estado, el umbral llega con ellos.
