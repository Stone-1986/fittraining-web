# Plan — W-10 La landing pública

> **REVISIÓN 2 — cambio de alcance del humano (2026-09-08), posterior al ciclo 2.**
>
> No es un ciclo de corrección: el contrato cambió porque el humano cambió el
> producto, no porque un error persistiera. **El contador de ciclos vuelve a
> empezar**; la regla de «máximo 3» existe para que la cadena no se atasque en
> un defecto, no para limitar cuántas veces el humano puede decidir.
>
> Lo que cambia está en § Revisión 2. El resto del plan sigue vigente.

## Revisión 2 — el alcance nuevo

**El producto cambia:** desde la web, el atleta **se registrará** y el
entrenador **iniciará sesión**. Eso invierte el supuesto sobre el que se
decidió D-1.

| # | Cambio | Efecto |
| - | ------ | ------ |
| 1 | La barra lleva los cinco elementos del canvas: Inicio · Planes · Preguntas · Iniciar sesión · **Registrarme** | Se deshace la parte de D-1 que los quitaba |
| 2 | **Se elimina la sección de planes** de la portada | Muere D-2 entera, y con ella el contenido provisional que había inventado el asistente |
| 3 | «Planes» **permanece en la barra pero inerte** | Habrá página de planes antes de producción |
| 4 | «Iniciar sesión», «Registrarme» y «Crear mi cuenta» se dibujan **inertes**, igual que «Planes» | Nada lleva a un 404; cuando existan las páginas se cambian los `href` |
| 5 | El botón del héroe pasa de «Ver los planes» a **«Crear mi cuenta»** | El ancla `#planes` deja de existir |
| 6 | El párrafo del cierre pasa a: «Elige un plan, crea tu cuenta y ten tu primera sesión hoy mismo.» y **conserva** el botón «Crear mi cuenta» | Texto dictado por el humano, literal |

**Lo que esto arregla solo:** el contenido inventado de los cuatro planes
desaparece del producto, y con él las cuatro salvaguardas y el pendiente que
lo acompañaban. Hay que **borrar** ese punto de `docs/sistema-de-diseno.md § 8`
y quitar los planes de `landing-content.ts` (quedan los tres pasos y las tres
preguntas).

**Lo que esto abre, y no bloquea hoy:** los Términos publicados § 12 afirman
que fittraining «opera hoy en fase de prueba, con acceso limitado», y
`definicion-web.md § 3` dice «sin registro público» y que la web no lleva
botón de «Crear cuenta». Una portada que invita a registrarse contradice los
dos. **No es una decisión de esta cadena** —el humano decidió el producto—
pero los dos documentos habrá que actualizarlos antes de producción, y queda
anotado en `docs/sistema-de-diseno.md § 8` para que no se pierda.

**Qué NO cambia:** los diez componentes, el cero JavaScript de cliente, la
accesibilidad, el pie legal, las tres preguntas frecuentes, D-3, D-4 y D-5, y
la regla de que W-10 no llega a `main` sin fotos.

> Fase 1. Este documento no es código y no autoriza a escribirlo. Requiere
> aprobación humana explícita antes de `/implementar`.
>
> Fuentes: `docs/sistema_diseño/fittraining Landing.dc.html` (el canvas de la
> landing), `docs/sistema_diseño/Sistema de Diseño fittraining.dc.html` § 05 y
> § 07 (botones y piezas), `src/app/globals.css` (los tokens), `/estilo` (la
> guía viva).

## Qué se construye

La portada pública de fittraining en `/`, sustituyendo la página de
verificación de despliegue que ocupa esa ruta hoy. Un visitante que no tiene
cuenta entiende qué es el producto, ve los tipos de plan y sus datos concretos
—duración, nivel, sesiones por semana—, entiende que detrás de cada plan hay
un entrenador que responde, y resuelve sus dudas antes de registrarse.

Es una página **estática, sin datos de la API y sin JavaScript de cliente**.

## Qué NO entra

Lo que queda deliberadamente fuera, para que la cadena no lo añada por su
cuenta:

- **Registro e inicio de sesión.** No hay páginas de auth y W-10 no las crea.
  Los CTA que llevarían allí apuntan a `#planes` — decidido en § D-1.
- **Rutas `/planes` y `/preguntas`.** La barra las enlaza como **anclas
  internas** (`#planes`, `#preguntas`), no como páginas.
- **El carrusel del héroe.** El canvas dibuja cuatro puntos de paginación y
  el § 09 define un carrusel de 6s. Fuera: exigiría `'use client'` y sería el
  único JavaScript de toda la web pública. Además no hay cuatro fotos que
  rotar — no hay ninguna.
- **Página de entrenadores.** El enlace «VER TODOS →» del canvas no tiene
  destino, así que **no se dibuja**: el bloque de entrenadores se queda sin
  ese enlace. Misma razón que D-1 — nada que lleve a un 404.
- **Las fotos.** Se construye con `.photo-slot`. El merge a `main` —que es lo
  que despliega— espera a tenerlas.
- **`src/lib/api/`.** No se abre la puerta a la API en este ítem.

## Rutas

| Ruta      | Tipo               | Notas                                                                  |
| --------- | ------------------ | ---------------------------------------------------------------------- |
| `/`       | Estática (server)  | Sustituye la portada de verificación actual. `metadata` propia          |
| `#planes` | Ancla en `/`       | Destino de «Planes» en la barra y de «VER LOS PLANES» en el héroe       |
| `#preguntas` | Ancla en `/`    | Destino de «Preguntas» en la barra                                     |

`/legal`, `/estilo` y las rutas de documentos legales **no se tocan**.

## Componentes

### Ya existen y se reutilizan

- `Button` / `buttonStyles()` — las variantes `primary`, `secondary`, `neutral`
  y `link` cubren los cuatro botones del canvas; `shape="rect"` es exactamente
  el «REGISTRARME» de la barra
- `Card`, `CardBody`, `CardTitle` — la tarjeta de plan y los bloques
- `Container` — `size="full"` para las secciones a sangre con margen lateral
- `.grid-cards` — la rejilla `auto-fit / minmax(320px, 1fr)` del sistema
- `.photo-slot`, `.scrim-side`, `.scrim-bottom` — los huecos de foto y sus
  degradados de protección
- `listDocuments()` de `src/lib/legal.ts` — los cinco enlaces del pie

### Nuevos

| Componente          | Ubicación                            | Servidor/Cliente | Por qué                                                                 |
| ------------------- | ------------------------------------ | ---------------- | ----------------------------------------------------------------------- |
| `PhotoSlot`         | `src/components/ui/photo-slot.tsx`   | Servidor         | Hueco de foto con su etiqueta y proporción. Se repite 3× (héroe, entrenador, avatares) y no sabe qué es fittraining |
| `SiteHeader`        | `src/components/site/site-header.tsx`| Servidor         | La barra. Recibe la sección activa por prop                              |
| `SiteFooter`        | `src/components/site/site-footer.tsx`| Servidor         | El pie. **Recibe los documentos legales por prop** — no los pide él      |
| `SectionHeading`    | `src/components/landing/section-heading.tsx` | Servidor | El par rótulo-cian + `h2`. Se repite 4×, por encima de la tercera repetición |
| `Hero`              | `src/components/landing/hero.tsx`    | Servidor         | Héroe con `.photo-slot` + `.scrim-side`                                  |
| `PlanCard`          | `src/components/landing/plan-card.tsx`| Servidor        | La tarjeta del § 07: foto, scrim, nombre, metadato, enlace de acción     |
| `HowItWorks`        | `src/components/landing/how-it-works.tsx` | Servidor    | Los tres pasos. Ver § D-3: va en `<ol>`                                  |
| `CoachesBlock`      | `src/components/landing/coaches.tsx` | Servidor         | Foto + texto + fila de avatares                                          |
| `Faq`               | `src/components/landing/faq.tsx`     | Servidor         | `<details>` nativo con `group-open:`, cero JS                            |
| `ClosingCta`        | `src/components/landing/closing-cta.tsx` | Servidor     | El cierre a sangre con `.photo-slot` y su velo                           |

**Ninguno lleva `'use client'`.** El acordeón es `<details>` —el patrón ya está
resuelto y funcionando en `/estilo`— y el menú móvil de la barra usa el mismo
`<details>` que `legal-shell` ya emplea. Si algún componente acaba necesitando
cliente, es una desviación del plan y se escala.

`SiteHeader` y `SiteFooter` van en `src/components/site/` y no en
`components/ui/` a propósito: conocen el dominio (la marca, las secciones, el
catálogo legal), y la regla § 3 prohíbe que un primitivo sepa qué es
fittraining.

## Datos

**No hay API.** Lo comprobé contra `fitmess-api/outputs/openapi.json`: de 73
endpoints, **9 son públicos** —health, registro (3), login, refresh, verificar
invitación, olvido y reseteo de contraseña— y **ninguno expone planes ni
entrenadores**. `/catalog/plans` existe pero lleva `@UseGuards(JwtAuthGuard)`;
su propio comentario dice «cualquier usuario **autenticado**». Una página
pública no puede pedirlo.

Por tanto el contenido es **estático y tipado en el repo**:

| Archivo                      | Contiene                                             |
| ---------------------------- | ---------------------------------------------------- |
| `src/lib/landing-content.ts` | Los tipos de plan, los tres pasos y las preguntas     |

**Aviso para el Implementador y el QA — esto cuesta un ciclo si se ignora:**
`vitest.config.ts` mide cobertura **por archivo** sobre `src/lib/**/*.ts` con
un umbral del 80 %. Un archivo de datos que ningún test importe se queda en
**0 % y tumba el gate por sí solo**. `landing-content.ts` necesita su
`landing-content.test.ts`, y no un test de relleno: que los slugs sean únicos,
que ningún plan quede sin duración ni nivel, y que haya exactamente los tipos
que la portada promete. Es el mismo tipo de test que ya protege `legal.ts`.

## Lo que el sistema de diseño no cubre

Cinco cosas. **Cuatro quedaron aprobadas el 2026-09-08** y su decisión está
escrita abajo tal como se implementa; la única abierta es D-2, el contenido de
los planes.

### D-1 · Los CTA principales no tienen destino

El canvas cierra con «CREAR MI CUENTA» y la barra con «REGISTRARME», y no hay
páginas de auth. Un botón que lleva a un 404 es peor que uno que no está.

**APROBADO (2026-09-08).** Ambos son el mismo botón primario y apuntan a
`#planes` con el texto «VER LOS PLANES». El bloque «¿Eres entrenador? Publica
tu plan» se queda como **texto sin enlace**. La landing conserva su llamada a
la acción sin prometer una pantalla que no existe.

Para el Implementador: que el `href` esté en **un solo sitio** por botón y sea
literal (`#planes`), no calculado. Cuando llegue el ítem de auth se cambian
dos cadenas, y conviene que `grep -rn '#planes' src/` las encuentre todas.

### D-2 · La sección de planes — RESUELTA CON CONTENIDO PROVISIONAL

**El canvas de la landing no la dibuja.** Tiene una rejilla vacía justo debajo
del héroe (offset 8333) y ningún `h2` para ella — los cuatro titulares del
canvas son «Tres pasos», «Detrás de cada plan», «Antes de registrarte» y
«Empieza esta semana». Pero la barra dice «Planes» y el héroe dice «VER LOS
PLANES»: los dos apuntan a una sección que nunca se rellenó.

La pieza sí está diseñada, en el **sistema § 07 «tarjeta de plan»**.

**DECISIÓN (2026-09-08): se construye con contenido provisional**, porque los
planes reales todavía no existen ni en la API ni definidos como producto.
Advertí que inventar copy de producto en una web pública es una promesa que
alguien puede leer como real; con esa advertencia sobre la mesa, la decisión
es construir ahora y sustituir después. Queda registrada la advertencia y
quedan puestas las salvaguardas de abajo.

#### Los cuatro planes

Tres de los cuatro **no son invención mía**: salen del propio canvas, que ya
los usa como ejemplo. Solo el cuarto es enteramente propuesto.

| Nombre  | Duración   | Ses/sem | Nivel        | Descripción                                              | Procedencia                          |
| ------- | ---------- | ------- | ------------ | -------------------------------------------------------- | ------------------------------------ |
| Running | 12 semanas | 4       | principiante | De cero a diez kilómetros con carga progresiva.          | Canvas § 07, **literal**             |
| En casa | 8 semanas  | 4       | principiante | Ocho semanas con peso corporal, sin equipo ni gimnasio.  | Canvas (preguntas frecuentes)        |
| Híbrido | 16 semanas | 5       | avanzado     | Fuerza y resistencia en el mismo bloque semanal.         | Cifras del canvas § 07; texto propuesto |
| Fuerza  | 16 semanas | 3       | intermedio   | Progresión de carga en los levantamientos base.          | **Propuesto entero**                 |

#### Las cuatro salvaguardas

Son lo que hace que esto no llegue a producción por descuido:

1. **Ningún plan lleva la insignia «POPULAR».** El § 07 la define, pero es una
   afirmación sobre uso real y con planes provisionales sería sencillamente
   falsa. No se implementa en W-10.
2. **La tarjeta no lleva «VER PLAN →».** No existe `/planes/[slug]` y no entra
   en W-10; un enlace a ninguna parte es lo mismo que ya se descartó en D-1.
   La tarjeta es descriptiva, no clicable.
3. **`landing-content.ts` abre con un aviso `PROVISIONAL`** en su comentario de
   cabecera: qué está inventado, por qué, y qué lo sustituye. Es el sitio donde
   alguien mira de verdad.
4. **W-10 no se mergea a `main` hasta tener las fotos** —ya decidido— y ahora
   también hasta tener los planes reales. Es la misma puerta, y `main` es lo
   único que despliega Amplify.

#### El pendiente, en un sitio que sobrevive

`outputs/` está en `.gitignore`: se regenera y su valor es el mtime local. Un
pendiente anotado solo aquí **se pierde en el próximo `pnpm run gates`**.

Por eso el pendiente se registra en **`docs/sistema-de-diseno.md § 8 "Lo que
falta"`**, que está versionado, y se repite en la cabecera de
`landing-content.ts`. Sustituirlo el día que existan los planes reales es:
cambiar ese archivo, borrar el aviso, y quitar la nota de § 8.

#### Las cuatro preguntas frecuentes

El canvas da **cuatro** preguntas pero solo una respuesta. **Se implementan
tres**: «¿Puedo cambiar de plan a mitad de camino?» queda fuera por decisión
del 2026-09-08 (ver más abajo). De las dos restantes sin respuesta, las dos son
sobre datos de salud, y **ésas no se inventan**: las responde
literalmente el `Consentimiento para el Tratamiento de Datos Sensibles de
Salud` v1.1.0 que ya está publicado en `src/content/legal/`.

| Pregunta                                   | Respuesta                                                                                                                                    | Fuente                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| ¿Necesito equipo para el plan en casa?     | No. Las ocho semanas están diseñadas con peso corporal.                                                                                      | Canvas, **literal**           |
| ¿Qué datos de salud me piden y por qué?    | Tu esfuerzo percibido en cada serie (RPE o RIR) y cuatro sensaciones semanales del 1 al 10: dolor muscular, motivación, sueño y energía. Sirven para que tu entrenador ajuste el plan. No pedimos diagnósticos, medicamentos, peso ni frecuencia cardíaca. | Consentimiento salud **§ 3**  |
| ¿Mi entrenador ve mis registros?           | Sí, y es el motivo de recogerlos: son la materia prima con la que ajusta tu plan. Solo ve los datos de los atletas inscritos en sus propios planes. | Consentimiento salud **§ 5**  |

Dos condiciones sobre esas respuestas:

- **Se reescriben en tuteo, no se copian.** El documento legal está en «usted»
  y ahí se queda; la landing tutea. Lo que **no** puede cambiar es el fondo:
  una respuesta que contradiga al consentimiento es un defecto grave, no un
  matiz de estilo.
- **Las dos respuestas de salud enlazan al documento**
  (`/consentimiento-datos-de-salud`), para que quien quiera el texto exacto lo
  tenga a un clic.

**«¿Puedo cambiar de plan a mitad de camino?» NO se implementa** (decisión del
2026-09-08). Depende de una regla de producto que no existe: lo único que
consta es que el consentimiento se acepta **por plan**
(`LegalAcceptance.planId`), de donde se deduce que cambiar exige aceptarlo de
nuevo — pero no si el progreso anterior se conserva, que es lo que la persona
pregunta de verdad. Publicar una respuesta inventada sobre qué pasa con el
entrenamiento de alguien es peor que no tener la pregunta.

**El acordeón lleva tres preguntas, no cuatro.** Cuando exista la regla, se
añade la cuarta: es una entrada más en el array de `landing-content.ts`.

### D-3 · Los números de paso incumplen el contraste

El canvas pinta «01 02 03» en Archivo 900 a 44px con `#1F2A2C`, que sobre el
fondo mide **1.32:1**. Como texto grande necesitaría 3:1. El token más cercano
del sistema, `border-strong`, tampoco llega (1.49:1), y el primero que cumple
—`input`, 3.11:1— ya no produce el efecto de número fantasma que el diseño
busca. Es la **cuarta** contradicción que encontramos en el canvas.

**APROBADO (2026-09-08).** El número es decorativo y **redundante**, porque el
orden ya lo da el documento. Se marca `aria-hidden="true"` y la sección se
construye como `<ol>`: un lector de pantalla anuncia «1 de 3» de forma nativa
y mejor que leyendo «01». Con el número fuera del árbol de accesibilidad WCAG
no le exige contraste, y se conserva el fantasma tal como está diseñado.

Token nuevo en `globals.css`, porque `#1F2A2C` no existe hoy:

```css
/* SOLO DECORATIVO. Mide 1.32:1 sobre el fondo, muy por debajo de cualquier
 * minimo: NUNCA para texto que informe de algo. Existe para el numero
 * fantasma de los pasos, que va `aria-hidden` dentro de un <ol> y cuyo
 * orden ya comunica la lista. Si alguna vez se usa en algo legible, esta
 * mal usado. */
--decorative: #1f2a2c;
```

Y su rol en `@theme inline`: `--color-decorative: var(--decorative)`, que
habilita `text-decorative`.

**Se añade también a `/estilo`**, en la tabla de superficies y con esa
advertencia escrita al lado. Un token que solo vive en el CSS es un token que
alguien reutilizará mal.

### D-4 · Dos tamaños fuera de la escala tipográfica

El canvas usa 44px en el número de paso y 62px en el `h2` del cierre. La
escala tiene `text-h3` (34), `text-h2` (52) y `text-display` (96).

**APROBADO (2026-09-08).** `text-h2` (52px) en el cierre y `text-h2` también
en el número de paso. Añadir dos tokens para 44 y 62 daría siete escalones
donde el sistema definió cinco, que es cómo una escala deja de serlo. Si al
verlo el cierre pide más presencia, se decide entonces con la pantalla
delante — no antes.

### D-5 · Dos medidas menores — APROBADO (2026-09-08)

- La barra cian de 3px junto al párrafo de entrada: se usa **4px**
  (`border-l-4`), que es la escala. Diferencia imperceptible.
- El logotipo a 26px: se usa `text-h4` (22px) con `font-black`, que es
  exactamente como ya está resuelto en `/estilo` y en su pie.

## Tono

- **La copy tutea**, sin excepción en esta pantalla: «Entrena con un plan
  real», «tu progreso», «Elige tu plan». Ningún «usted» — eso es solo de
  `content/legal/`, y el pie solo enlaza esos documentos, no los cita.
- **Mayúsculas completas solo** en botones, rótulos de sección y metadatos.
  Los titulares van en caja normal. La única excepción es el nombre del plan
  en su tarjeta («RUNNING»), que el § 07 fija en versalitas de display.
- Cifras concretas: «12 semanas», «4 sesiones». Nunca «muchas».
- Sin emoji, sin exclamaciones, sin jerga de gimnasio.

## Criterios de aceptación

Lo que el QA va a verificar:

- [ ] `/` renderiza héroe, planes, cómo funciona, entrenadores, preguntas,
      cierre y pie, en ese orden
- [ ] **Cero JavaScript de cliente**: el `First Load JS` de `/` en la salida de
      `next build` es igual al del resto de páginas estáticas. Ningún archivo
      de W-10 contiene `'use client'`
- [ ] «Planes» y «Preguntas» de la barra saltan a sus secciones; ningún enlace
      de la landing produce un 404
- [ ] Los cinco documentos legales del pie salen de `listDocuments()` y sus
      URLs resuelven
- [ ] `landing-content.ts` tiene test propio y **la cobertura por archivo no
      baja del umbral**
- [ ] Los gates en verde: `pnpm run gates`, 5/5
- [ ] La regla `design-system/no-untokenized-style` no dispara: ni un color
      literal, ni un `text-[...]`, ni un radio fuera del sistema
- [ ] Accesibilidad:
  - [ ] Un solo `h1` en la página, y los `h2` de sección sin saltos de nivel
  - [ ] Los números «01/02/03» son `aria-hidden` y la sección es un `<ol>`
  - [ ] Todo `.photo-slot` y todo scrim es decorativo: `aria-hidden` o
        `alt=""`
  - [ ] El acordeón se abre y se cierra **con el teclado** y sin JavaScript
  - [ ] Todo lo enfocable muestra el anillo de foco; el orden de tabulación
        sigue el orden visual
  - [ ] Los botones de acción miden 44px de alto; ninguno usa `size="sm"`
  - [ ] La página no desborda horizontalmente a 320px de ancho

## Riesgos

| Riesgo                                                                                                   | Qué haríamos                                                                                            |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| El contenido de los cuatro planes (D-2) no llega y la cadena lo inventa                                  | **Bloqueante.** Sin ese texto no se implementa la sección; se construye el resto y se deja el hueco marcado |
| La landing se despliega con los huecos rayados por un merge distraído a `main`                           | El merge a `main` es manual y por PR. Queda escrito aquí que W-10 no se mergea hasta tener las fotos      |
| El menú móvil acaba pidiendo `'use client'`                                                              | Es señal de que se intentó un desplegable en vez del `<details>` que ya funciona en `legal-shell`. Se escala |
| `landing-content.ts` tumba el gate de cobertura                                                          | Está avisado arriba. Si aun así ocurre, lo arregla el QA escribiendo el test, no bajando el umbral        |
| Aparece una quinta contradicción del canvas a mitad de implementación                                    | Se escala al Líder Técnico y se anota junto a las otras cuatro en `rulesFrontend.md § Accesibilidad`      |

## Estado

**CHECKPOINT 1 — APROBADO el 2026-09-08.**

| Decisión | Estado                                                     |
| -------- | ---------------------------------------------------------- |
| D-1 · destino de los CTA          | **SUPERSEDIDA por la Revisión 2**     |
| D-2 · contenido de los planes     | **ANULADA por la Revisión 2** — se quita la sección |
| D-2b · pregunta 2 del acordeón    | **RESUELTA — no se implementa**        |
| D-3 · números de paso             | **APROBADA**                          |
| D-4 · tamaños fuera de escala     | **APROBADA**                          |
| D-5 · medidas menores             | **APROBADA**                          |

**PLAN APROBADO EN SU TOTALIDAD (2026-09-08). Autorizado `/implementar`.**

Queda constancia de que el contenido de los planes es **provisional y
propuesto por el asistente**, con las cuatro salvaguardas de D-2, y de que
W-10 no llega a `main` hasta tener los planes reales y las fotos.
