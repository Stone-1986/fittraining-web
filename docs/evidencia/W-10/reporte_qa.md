# Reporte QA — W-10 La landing pública — revisión 2

**Estado:** APROBADO CON HALLAZGOS (ninguno bloqueante; dos requieren decisión
del humano antes de `main`)
**Gates:** `outputs/gates.json` @ `2026-09-09T00:47:10.080Z` — 5/5 en verde
**Alcance:** los seis cambios de `outputs/plan.md § Revisión 2`, más la
verificación de que no se rompió lo que el ciclo 2 ya dejó en verde.

> No es un ciclo de corrección: el contrato cambió. Lo que aprobé en el ciclo 2
> —«la barra no dibuja los cinco elementos»— está deliberadamente invertido, y
> el test que lo afirmaba fue reescrito para afirmar lo contrario. Doy esa
> inversión por correcta: la ordena el plan.

---

## Lo primero: los dos hallazgos que piden decisión

Ninguno bloquea los gates ni impide usar nada —no hay nada que usar todavía—,
pero ninguno se resuelve dentro de la cadena, porque los dos exigen copy nueva
o una decisión de producto.

### H-1 · El defecto mayor de lo inerte no está donde se esperaba: está en quien SÍ ve la pantalla

`site-header.tsx:94,110` · `hero.tsx:69` · `closing-cta.tsx:51`

**Qué pasa.** Cinco piezas se dibujan con el aspecto exacto de un control y no
lo son: `<span>` sin rol, sin foco y sin acción. La pregunta del encargo era si
eso crea una trampa para el teclado o para el lector de pantalla. **La respuesta
medida es que no, y que la asimetría va en el sentido contrario al intuitivo.**

- **Teclado:** no hay trampa (WCAG 2.1.2 no aplica). Un `<span>` sin `tabindex`
  no entra en el orden de tabulación: no se puede quedar atrapado en algo a lo
  que no se llega. Verificado sobre el HTML real de `next build`: `tabindex` no
  aparece ni una vez en `/`.
- **Lector de pantalla:** tampoco hay control fantasma (WCAG 4.1.2 no aplica —
  no hay rol que nombrar). En modo lectura el usuario oye «Inicio, enlace ·
  Planes · Preguntas, enlace · Iniciar sesión · Registrarme»: **el lector
  distingue** lo que es enlace de lo que no, porque anuncia el rol.
- **Quien ve la pantalla:** no distingue nada. «Planes» es idéntico a
  «Preguntas»; «Crear mi cuenta» es idéntico a un botón vivo del sistema. Y
  `pointer-events-none` elimina el hover, que era el único indicio residual en
  escritorio — **en un teléfono, donde no hay hover, la señal es exactamente
  cero**.

**El defecto mayor, con su criterio:** el árbol de accesibilidad es hoy **más
honesto que la capa visual**. Formalmente esto no es un fallo limpio de un
criterio WCAG —el gancho más cercano es 1.3.1 «Info y relaciones» (A): la
presentación comunica «esto es un control» y esa relación no es programáticamente
determinable—; en la práctica es un defecto de usabilidad que penaliza sobre todo
al usuario de ratón y de dedo. Por eso **no lo clasifico como fallo de
accesibilidad que impida usar una función** (la función no existe) y por eso no
bloquea.

**Qué recomiendo, y por qué no lo puede decidir la cadena.** La corrección
correcta no es semántica, es **texto visible**: una línea que diga que todavía no
está disponible («El registro abre pronto», junto a la llamada del cierre y en la
barra). Arregla el caso del usuario vidente sin estropear el del lector —hoy la
única forma de saberlo es intentarlo y no obtener nada, que es comunicar un
estado por ausencia, hermano del «solo con color» que la regla § Accesibilidad
prohíbe—. Es copy de producto y la copy de esta pantalla la dicta el humano.

Las alternativas y por qué no las propongo: `<button disabled>` rompe el aspecto
del canvas (variantes `disabled:` en gris) y además un botón que no ejecuta nada
contradice § Accesibilidad; `aria-disabled` sobre un `<button>` sería un botón
que existe para no hacer nada; y no dibujarlas es justo lo que la revisión 2
deshizo.

### H-2 · Queda una segunda afirmación de copy que dependía de los planes borrados

`src/lib/landing-content.ts:80-81`

**Qué pasa.** La primera pregunta del acordeón dice: «¿Necesito equipo para **el
plan en casa**?» y responde «No. **Las ocho semanas** están diseñadas con peso
corporal.» Eso afirma que existe un plan llamado «En casa» de ocho semanas — que
es, literalmente, uno de los cuatro planes provisionales que la revisión 2
eliminó por inventados. Es el mismo defecto que ya se corrigió a mano en
`STEPS[0]`, en otra parte de la página: la única diferencia es que aquí la frase
sale del canvas y allí la había escrito el asistente.

**Cómo reproducirlo.** Cargar `/` sin JavaScript, abrir la primera pregunta: la
portada no enseña ningún plan en ninguna parte, «Planes» está inerte, y sin
embargo el texto da por conocido un plan concreto con su duración.

**Por qué no lo declaro bloqueante ni lo cambio.** `plan.md § Revisión 2` dice
explícitamente, en «Qué NO cambia»: «las tres preguntas frecuentes». El
Implementador siguió el plan; el conflicto es entre dos frases del propio plan
—no anunciar lo que no se puede cumplir, y no tocar las preguntas—, y resolverlo
es del humano. Dos salidas posibles: reformular sin nombrar el plan («¿Necesito
equipo si entreno en casa?» / «No: hay planes diseñados para hacerse con peso
corporal») o dejarlo tal cual y anotarlo como pendiente junto a los otros de
`docs/sistema-de-diseno.md § 8`.

Anexa a esto, y de la misma familia, el párrafo del cierre que dictó el humano:
«Elige un plan, crea tu cuenta…» invita a elegir un plan que la web todavía no
puede mostrar. Es texto literal del humano y no se toca: queda solo anotado.

---

## Hallazgos bloqueantes

Ninguno. Los cinco gates están en verde, no hay test en rojo, la cobertura no
baja de umbral en ningún archivo y no encontré ninguna violación de
`rulesFrontend.md` en lo implementado.

---

## Los seis cambios, uno a uno

| # | Cambio del plan | Verificado | Cómo |
| - | --------------- | ---------- | ---- |
| 1 | La barra recupera los cinco elementos | Sí | HTML real de `next build`: «Inicio · Planes · Preguntas · Iniciar sesión · Registrarme», dos veces (barra ancha y menú estrecho) |
| 2 | Se elimina la sección de planes, `plan-card.tsx` y `PLAN_TYPES` | Sí | No existe el archivo; no queda ninguna referencia a `PlanCard`/`PLAN_TYPES`; los `h2` de la página son cuatro y ninguno es de planes |
| 3 | Cinco piezas inertes, `[sin-destino]`, `pointer-events-none` | Sí | 9 marcas `[sin-destino]` en `src/`, una por pieza y una por comentario de cabecera; 0 `<button>` y 0 `tabindex` en el HTML de `/` |
| 4 | El héroe dice «Crear mi cuenta»; `#planes` ya no existe | Sí | `grep` de `#planes` en `src/`: cero. Los dos únicos `#` del documento apuntan a `#preguntas`, que existe |
| 5 | El párrafo del cierre, literal | Sí | Test nuevo que lo fija carácter a carácter |
| 6 | `STEPS[0].description` sin el recuento de planes | Sí | Es «Ves la duración, el nivel y las sesiones por semana antes de decidir.» y un test nuevo impide que vuelva el recuento |

---

## Tests escritos

Cinco, y ninguno confirma que React renderiza. El bug concreto que atrapa cada
uno está escrito en su comentario, dentro del archivo.

- `src/app/page.test.tsx` — **tres nuevos**
  - _«todo lo que recibe el foco tiene nombre accesible»_: el test que ya había
    solo miraba enlaces. Aquí entran también los `<summary>` —los tres del
    acordeón y el del menú estrecho—, descontando lo que va `aria-hidden`. Bug
    que atrapa: dejar el menú con solo el signo «+», el caso clásico del control
    de icono, que se sigue viendo y se sigue pulsando.
  - _«tutea en toda la página, también donde el texto vive en el JSX»_: el test
    de tono existente cubría solo `landing-content.ts`, y **la mitad de la copy
    visible está escrita en los componentes** (héroe, entrenadores, cierre,
    barra, pie). Un «usted» ahí no lo veía nada: ni un gate, ni ESLint, ni el
    otro test. Cubre además exclamaciones y emoji.
  - _«no anuncia un catálogo de planes que la portada ya no enseña»_: es el
    guardián del cambio 6. Comprobado que el patrón dispara con «Cuatro tipos» y
    con «4 planes», y que no dispara con la copy actual («los planes no son
    plantillas genéricas», «sus propios planes»).
- `src/components/site/site-header.test.tsx` — **uno nuevo**
  - _«la barra ancha y el menú estrecho ofrecen exactamente lo mismo»_: son dos
    listas distintas en el DOM. Bug que atrapa: tocar la barra ancha y olvidar el
    menú, de modo que en teléfono desaparece «Registrarme» — invisible para quien
    revisa en escritorio.
- `src/components/landing/closing-cta.test.tsx` — **nuevo**
  - _«conserva literal el párrafo que dictó el humano»_: la frase del cambio 5.
    Una copy reescrita no rompe el build, ni el lint, ni la cobertura; se
    despliega sin que nadie la vea. En este repo hay antecedente de agentes
    reescribiendo copy de producto por su cuenta.

Consultan por rol y por texto accesible. Ninguno consulta por clase CSS.

---

## Lo que ya estaba en verde y sigue estándolo

- **Cero JavaScript de cliente, en la salida real de `next build`:** el
  `First Load JS` de `/` es el mismo que el de `/estilo` y el de las páginas
  legales —los tres son el bloque compartido y nada más—, y su tamaño propio
  está en el mismo orden que el de `/estilo`. No hay ni un `'use client'` en
  `src/` fuera de comentarios y tests. Las cifras exactas están en la salida
  del último `pnpm run gates`; no las copio aquí.
- **Ningún enlace a ninguna parte:** los 12 `<a>` del HTML generado apuntan a
  `/`, a `#preguntas` (que existe en la página) o a los cinco documentos legales
  del catálogo. Cero `<button>`.
- **Un solo `h1` y sin saltos de nivel:** h1 → h2 → h3×3 → h2 → h2 → h2.
- **Números `aria-hidden` dentro de un `<ol role="list">`:** confirmado en el
  HTML generado, no solo en el JSX.
- **Acordeón operable con teclado:** es `<details><summary>` nativo, cuatro
  veces en la página (tres preguntas y el menú). Ver la limitación abajo.
- **Ni un «usted»:** comprobado sobre el texto extraído del HTML generado, y
  ahora también por test.
- **Sistema de diseño:** ni un `dark:`, ni un `accent`, ni un `warm`, ni un
  radio fuera del sistema (lo cubre `lint`, en verde). Revisado a mano lo que
  `lint` no ve: los roles usados son los correctos —el cian es `primary`, no
  `accent`—, `legal-shell.module.css` no se tocó, y la jerarquía tipográfica se
  sostiene. Las tres desviaciones deliberadas del canvas siguen intactas y no
  las reporto como defectos.
- **Área táctil:** el botón del cierre y el del héroe son `lg` (48px); el de la
  barra, `md` (44px). Ninguna acción usa `sm`.

## Hallazgos no bloqueantes

1. **`pointer-events-none` — evaluado: aceptable, con dos advertencias.**
   `site-header.tsx:114` · `hero.tsx:72` · `closing-cta.tsx:55`. Lo decidió el
   Implementador por su cuenta y la decisión es defendible: `buttonStyles()`
   trae el hover y el estado presionado del sistema, y un botón que se rellena
   de cian promete un clic que no ocurre; anular esos estados uno a uno sería
   inventar una variante. Es además la misma utilidad que el propio botón usa en
   `disabled:`. Lo que hay que saber: **(a)** no aporta nada al teclado —un
   `<span>` nunca fue enfocable— ni al móvil, donde no hay hover, así que compra
   menos de lo que parece; **(b)** su riesgo real es de precedente: el día que
   una de estas piezas pase a ser `<Link>`, si la clase se queda se produce un
   control operable con teclado y muerto con el ratón, que es un defecto de
   verdad y silencioso. Los tres comentarios ya dicen «y se le quita
   `pointer-events-none`»; conviene que esa frase no se pierda en el ítem de
   auth. Efecto lateral menor: el texto de esas piezas no se puede seleccionar.
2. **Tres piezas que no navegan viven dentro de `<nav aria-label="Principal">`.**
   Un landmark de navegación es, por definición, un conjunto de elementos de
   navegación; hoy dos de sus cinco hijos lo son. No es grave —el lector anuncia
   el rol y la diferencia se oye— y se resuelve solo el día que existan las
   páginas. Se documenta por si ese día tarda.
3. **Dos `<nav>` con la misma etiqueta «Principal».** Es la barra ancha y el
   menú estrecho. Aceptable porque son mutuamente excluyentes por `media query`
   —nunca hay dos expuestos a la vez—, pero una auditoría automática lo marcará
   como landmarks duplicados. Si molesta, se distinguen con la etiqueta.
4. **Resto del borrado, en un comentario.** `section-heading.tsx:4` sigue
   diciendo que el par rótulo+titular «se repite CUATRO veces —planes, cómo
   funciona, entrenadores y preguntas—». Son tres desde la revisión 2. La
   abstracción sigue justificada (§ 5 permite abstraer a la tercera), pero la
   frase nombra una sección que ya no existe.
5. **Ejemplo de la documentación apuntando a una ruta inexistente.**
   `button.tsx:138` ilustra `buttonStyles()` con `<Link href="/planes">`. Es un
   comentario, no código, pero es el primitivo que todos leen y `/planes` es
   justo la ruta que hoy no existe.
6. **Opción muerta en un primitivo.** `PhotoSlot` conserva `scrim="bottom"`, que
   su propio comentario describe como «el de la tarjeta de plan». Ya no lo usa
   nadie en la app —`/estilo` demuestra la clase `.scrim-bottom` directamente—.
   Es una pieza del sistema y por eso no pido borrarla; solo que el comentario
   deje de citar un componente que ya no está.

## Lo que sigue verificado por análisis y no por píxeles

Lo repito porque es el estado real de la validación, no un formalismo: **en este
entorno no hay navegador**.

- **320px de ancho.** Verificado leyendo el layout, no midiendo: el margen del
  `Container` deja 256px útiles; el `h1` baja de 96px a 52px por debajo de `sm` y
  rompe por el espacio de «Entrena / con»; la cabecera es `flex-wrap`, así que el
  menú cae a una segunda línea antes de desbordar; los botones llevan
  `whitespace-nowrap` pero su ancho estimado (~232px con el padding) cabe. **No
  está medido en un navegador.**
- **El anillo de foco.** Verificado que `:focus-visible` sigue definido una sola
  vez en `globals.css` y que nadie escribe `outline: none` en `src/`. Que se
  **vea** sobre cada fondo no se ha comprobado ópticamente.
- **El acordeón con teclado.** Verificado que es `<details><summary>` nativo,
  que es de donde viene el soporte de Enter y Espacio; los tests simulan el
  clic, porque jsdom no implementa la activación por teclado del `summary`. No
  se ha pulsado una tecla real.
- **Contraste.** Los valores vienen anotados en `globals.css` y no se ha tocado
  ningún token en esta revisión; no se ha vuelto a medir con un instrumento.

## Observación sobre el build

Los dos `pnpm run gates` de este ciclo corrieron completos y en verde, con el
`next dev` del humano vivo en el puerto 3000 y sin lanzar dos `next build` a la
vez. No observé ningún fallo de build aislado. El diagnóstico abierto sobre
`.next` no es de este reporte.

## Cobertura

Ver `outputs/gates.json` → `coverage`, medida **por archivo**
(`thresholds.perFile: true`). Umbrales en `vitest.config.ts`: 80% líneas / 80%
funciones / 80% statements / 75% ramas. No se tocó ningún umbral ni
`coverage.include`.
