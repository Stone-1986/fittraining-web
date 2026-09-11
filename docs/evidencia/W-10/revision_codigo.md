# Revisión de código — W-10, revisión 2 del alcance — cierre

**Estado:** APROBADO
**Gates:** `outputs/gates.json` @ `2026-09-09T01:28:57.647Z` — all_passed: true
**Razonamiento:** Siete cambios posteriores a mi aprobación anterior, revisados
uno a uno contra el canvas local y con gates @ `01:28:57`. Los siete correctos,
incluidos los dos tokens del logotipo (26/9px en `rem`, 5.02:1). Quedan dos
tareas de higiene con texto y criterio escritos; ninguna bloquea.

> **Este documento sustituye a la aprobación de las 20:04, que cubría un código
> que ya no es el que hay en disco.** Esa es la razón de ser de esta pasada: dos
> reportes afirmando haber aprobado siete archivos que nadie había mirado es
> exactamente el fallo que costó caro en el repo de la API. Ahora sí hay un
> artefacto que cubre el estado real, y abajo está archivo por archivo.

---

## Los siete cambios, uno a uno

Ninguno lo doy por bueno por lo que dice el mensaje del orquestador: los leí en
disco, y las medidas del logotipo las contrasté contra el canvas del repo.

| # | Archivo | Quién | Veredicto |
| - | ------- | ----- | --------- |
| 1 | `estilo/page.tsx:228` | LT (yo) | Correcto, con el criterio escrito al lado |
| 2 | `.claude/rules/rulesFrontend.md` | Humano | Las dos reglas, en su sitio y sin contradicción |
| 3 | `landing/hero.tsx` | Humano | Correcto; la historia queda en el comentario |
| 4 | `app/page.test.tsx` | Orquestador | Inversión correcta y sin perder protección |
| 5 | `lib/landing-content.ts` | Humano | Respuesta correcta; **el comentario quedó obsoleto** |
| 6-7 | `globals.css` + `site-header.tsx` | Orquestador | Correcto, y verificado contra el canvas |

### 1. El espécimen de `/estilo` — hecho, y con el criterio donde sobrevive

`estilo/page.tsx:228` lleva el texto que propuse, y el comentario de `:228-237`
guarda el razonamiento entero: por qué un espécimen enseña también un modelo de
redacción, por qué el canvas manda en la forma y nunca en los hechos, y por qué
de un espécimen se conserva la longitud (69 caracteres frente a 67) y no el
contenido. Eso es lo que pedí: que nadie lo «corrija» dentro de tres meses.

### 2. Las dos reglas en `rulesFrontend.md` — comprobadas en su sección

- **§ 6, línea 125-135**, justo después de «Cifras concretas… Nunca “muchas”».
  Es el sitio correcto y las dos se complementan sin solaparse: una dice que la
  cifra sea concreta cuando es cierta, la otra que no se afirme una cifra de lo
  que no existe. Está la versión ampliada, con `metadata` nombrada como texto de
  producto y con la frase de los especímenes de `/estilo`.
- **§ Testing, línea 227-231**, justo después de «un test que solo comprueba que
  React renderiza no es cobertura, es ruido». Correcto: es su corolario natural.

**No contradicen nada de lo que ya había.** Lo comprobé contra § 1 (tokens), § 2
(cero JS de cliente en `/estilo`), § Estilos y § Gates. El único roce posible
—que § 6 pida «cifras concretas» y la nueva regla las limite— se resuelve solo
al leerlas seguidas, que es como quedaron.

### 3. La retirada de «¿Eres entrenador? Publica tu plan»

Decisión del humano, no la reabro. Lo que sí reviso es la ejecución, y está
bien: el comentario de `hero.tsx:79-92` guarda la historia completa —nació del
canvas, sobrevivió a D-1 como texto sin enlace, su subrayado acabó siendo
bloqueante en el ciclo 1— y dice qué pasa el día que exista la pantalla: vuelve
como enlace de verdad, no como texto. Es el registro que impide reponerla sin
saber lo que costó.

### 4. La inversión del test — no perdió protección

`page.test.tsx:107-129`. Comprobado con el mismo rasero que apliqué a
`site-header.test.tsx`:

- **Borrar el viejo en vez de dejarlo en `skip` fue correcto** (§ Testing: un
  test que no puede fallar es ruido).
- **Y el nuevo protege más que el que sustituye, no menos.** El anterior
  comprobaba dos cosas (la frase está; no es `link` ni `button`). El nuevo
  comprueba cuatro, y cubre el hueco por el que la frase podría volver
  disfrazada: `queryByText(/publica tu plan/i)`, `queryByText(/eres
  entrenador/i)` —esta es la que importa, porque atrapa la reposición parcial—
  y las dos consultas por rol. Falla el día que alguien la reponga en cualquier
  forma, que es justo el día en que hay que preguntarse si ya existe la pantalla
  del entrenador.

### 5. La respuesta sobre el equipo — correcta, y el descarte también

«Depende del plan. Los hay que solo piden tu peso corporal, lo que tengas en
casa, o salir a correr.» El humano tenía razón en que mi versión anterior era
incorrecta: «hay planes diseñados para hacerse con peso corporal» respondía a
una pregunta sobre entrenar **en casa** con una afirmación sobre un subconjunto,
y dejaba fuera los planes con material de casa y los de carrera.

Y **el descarte es tan importante como la respuesta**: no escribir «ninguno
necesita equipo» evita el cuarto absoluto falso de esta serie. Está bien
tipificado. La respuesta nueva pasa las dos reglas nuevas: no da recuento, no da
un dato de algo inexistente, y «los hay que…» describe la naturaleza del
producto, no lo que esta pantalla enseña — que es el mismo registro que ya
aprobé.

**Lo único que quedó mal aquí es el comentario.** Ver instrucción B.

### 6 y 7. El logotipo: `--text-brand-mark` y `--text-brand-tag`

Es el que pediste que mirara y es el que más miré. **Lo apruebo, y dejo el
criterio por escrito en las tres preguntas que abre.**

**Primero, las medidas — verificadas contra el canvas del repo, no contra el
mensaje.** `docs/sistema_diseño/fittraining Landing.dc.html:99-120` dibuja la
cabecera con `900 26px/1 Archivo`, `letter-spacing: .02em`, `#fff`, y la bajada
con `500 9px/1 Barlow`, `letter-spacing: .42em`, `#6d7a7c`, con `gap: 2px`. La
implementación es 26px, `.02em`, `text-title`, 9px, `tracking-brand` (.42em),
`gap-0.5` (2px). Coincide. Y el pie del canvas (`:819-851`) dibuja la marca a
`900 22px` sin `letter-spacing` y la bajada a `300 15px`: el comentario que dice
«en el PIE el canvas la pinta más pequeña y ahí sí es `text-h4`» es exacto, y
`site-footer.tsx` ya estaba así. La asimetría cabecera/pie es del diseño, no un
descuido.

**Y lo más importante, que es lo que la tabla de las tres fuentes exige:** se
copiaron las **medidas** del canvas, no sus colores. El `#fff` y el `#6d7a7c`
del canvas no aparecen: la marca usa `text-title` y la bajada `text-meta-
foreground` (#768486), que es la **desviación deliberada nº 2** —el `#6D7A7C`
del canvas mide 4.38:1 y no llega a AA—. Es exactamente cómo hay que consumir el
canvas: nadie copia un valor, se copia al token y el componente pide el token.

**¿Un logotipo justifica tokens propios fuera de la escala? Sí, y el argumento
no es «lo dice el canvas».** Es que **no está en la escala: está al lado**. La
escala tipográfica ordena la jerarquía del documento (`display` → `label`) y un
logotipo no participa de esa jerarquía — tiene proporciones fijas por
definición. El sistema ya tenía el precedente exacto: `--text-action` (13px) y
`--text-action-lg` (14px) tampoco son escalones de lectura, son el tamaño del
texto de un botón, y nadie los cuenta como escalones.

**Y por eso no contradice D-4**, que es la objeción previsible. D-4 rechazó
añadir tokens de 44 y 62px porque eran **texto de la jerarquía** —un número de
paso y un `h2`— y añadirlos habría convertido cinco escalones en siete, que es
cómo una escala deja de serlo. Nombrarlos `brand-*` es justamente lo que impide
eso: la escala de lectura sigue teniendo los mismos escalones.

**Los 9px: defendibles, y estas son las tres razones y la condición.**

1. **No hay regla que fije un tamaño mínimo, y WCAG tampoco lo fija.** El
   criterio que sí aplica es 1.4.4 «Resize text», y **se cumple porque el token
   está en `rem`** (`0.5625rem`): respeta el ajuste de tamaño de fuente del
   usuario y el zoom del navegador. Con `px` esta conversación sería otra, y
   conviene que quede escrito por si alguien «simplifica» el token algún día.
2. **El contraste está medido y pasa:** 5.02:1, por encima del 4.5:1 que exige
   un texto de 9px (no es texto grande, así que no le vale el 3:1). Y no cambió:
   es el mismo token que ya llevaba.
3. **Tu argumento es el correcto:** es una línea de marca en versalitas muy
   espaciadas, no información que haya que leer para operar la página. El nombre
   del producto está al lado a 26px, y el nombre accesible del `<Link>` que las
   envuelve sale del conjunto, así que quien no ve la pantalla no pierde nada.

**La condición, que ya está escrita en el token y por eso no la subo a
instrucción:** nada que alguien tenga que leer para usar la página va en
`brand-tag`. El comentario de `globals.css:310-314` lo dice con esas palabras.
Si algún día se usa para comunicar algo, está mal usado.

**Un efecto de proceso que hay que registrar y no se pierde solo:** esto
**supersede a D-5** del plan, que aprobó explícitamente «el logotipo a 26px: se
usa `text-h4` (22px)». Puede: el humano decide, y decidió después. Lo señalo
porque `plan.md` vive en `outputs/`, que se regenera, así que dentro de un mes
la única memoria de por qué la cabecera no usa `text-h4` serán los comentarios
de `globals.css:298-314` y `site-header.tsx:128-133`. Los leí: los dos explican
el cambio y el porqué de la asimetría con el pie. Están bien y no hay que hacer
nada más.

---

## Instrucciones — dos tareas de higiene, ninguna bloqueante

Las dos son del mismo tipo que la de `estilo/page.tsx:228` de la pasada
anterior: van por la ruta rápida antes del commit de W-10, con `pnpm run gates`
detrás. Si no se hacen ahora, van a `docs/sistema-de-diseno.md § 8`. Lo que no
pueden es quedarse sin registro en ninguno de los dos sitios.

### A. `/estilo` no registra los dos tokens nuevos — y `brand-tag` es el más fácil de reutilizar mal del sistema

**Qué hacer.** Añadir `text-brand-mark` y `text-brand-tag` a `/estilo`, con la
advertencia de los 9px escrita al lado, igual que la lleva el token en el CSS.

- **Regla:** decisión **D-3** del plan, aprobada y ya ejecutada para
  `--decorative`: «se añade también a `/estilo`… **un token que solo vive en el
  CSS es un token que alguien reutilizará mal**». Lo comprobé:
  `estilo/page.tsx:91-92` tiene `decorative` en la tabla, con su aviso. Y la
  tabla de las tres fuentes, que hace de `/estilo` **la verificación** del
  sistema.
- **Por qué este token y no otro.** Un tamaño de 9px es la cosa más apetecible
  de un sistema para quien busca «algo pequeñito» — una etiqueta, un pie de
  tabla, una nota. La advertencia existe justo por eso, y hoy solo la ve quien
  abra `globals.css`. La ve quien define; no la ve quien consume.
- **Nota sobre la cabecera de `/estilo` (`:346-350`): la dejo a tu criterio.**
  Hoy dibuja la marca con `text-h4` + `text-label`, es decir con las medidas
  anteriores, así que la guía enseña un logotipo y el sitio enseña otro. Usar
  los tokens nuevos ahí haría que la guía muestre lo que documenta; dejarla a
  22px también es defendible, porque es la medida que el canvas da para el pie.
  **Es preferencia mía, no regla, y por eso no la convierto en instrucción.** Lo
  que sí es instrucción es la entrada en la tabla con su advertencia.

### B. `landing-content.ts:80-87` — el comentario narra una versión que ya no existe

**Qué cambiar.** Reescribir el comentario de la primera pregunta para que cuente
las **dos** correcciones, no solo la primera. Hoy explica por qué se quitaron el
nombre del plan y las ocho semanas, y cierra con «así sigue siendo cierta cuando
exista la página de planes» — pero describe la pregunta «¿Necesito equipo para
entrenar **en casa**?», que ya no es la que está debajo, y no dice una palabra
de por qué esa versión también era incorrecta. Debe recoger: que respondía a una
pregunta sobre entrenar en casa con una afirmación sobre un subconjunto de
planes; que existen planes con material de casa y de carrera; y que «ninguno
necesita equipo» se descartó **por ser otro absoluto falso**.

- **Regla:** § 6, la regla nueva que el humano acaba de aprobar («la copy no
  afirma lo que la pantalla no enseña»), leída con el motivo por el que estos
  comentarios existen en este repo: son el registro que impide reponer un texto
  retirado.
- **Por qué no es cosmético.** Es el único comentario del repo que hoy **guía
  hacia el error**: quien lo lea entero concluirá que la versión buena es
  «¿Necesito equipo para entrenar en casa?» / «Hay planes diseñados para hacerse
  con peso corporal» — que es exactamente el texto que el humano acaba de
  declarar incorrecto. Los otros comentarios desactualizados que acepté
  (`section-heading.tsx:4`, `button.tsx:138`, `photo-slot.tsx:24`) están
  obsoletos por omisión; éste lo está por afirmación.

---

## ¿Debe volver a pasar el QA? No, y estas son las tres razones

**No relanzaría la cadena.** El criterio:

1. **Cinco de los siete cambios son copy, tests y documentación** (1, 2, 3, 4 y
   5). El valor añadido del QA —extraer el texto del HTML real de `next build`,
   recorrer el árbol de accesibilidad, contar los `<a>`— no se aplica a un
   cambio de copy; lo que sí lo cubre son los gates, que corrieron después
   (`01:28:57`), más esta revisión, que es posterior a los siete.
2. **Su reporte no queda invalidado en lo que afirma.** Lo repasé contra el
   estado actual: sus seis verificaciones de los seis cambios, el «cero
   JavaScript de cliente», los 12 `<a>` y el «ni un usted» siguen siendo
   ciertos. Solo dos frases de su reporte describen texto que ya no está —la del
   héroe y la pregunta 1—, y las dos las cubre este documento, con quién las
   cambió y por qué.
3. **Lo único genuinamente nuevo es visual, y el QA tampoco tiene navegador.**
   Volver a pasarlo produciría otra vez análisis, no píxeles — el mismo análisis
   que acabo de hacer contra el canvas del repo.

**Pero queda un hueco nuevo que nadie ha medido, y lo anoto para que no se
pierda:** el QA razonó el no-desbordamiento a 320px con el logotipo a **22px**.
Ahora son 26px con `.02em` de `letter-spacing`. La cabecera sigue siendo
`flex-wrap` y «FITTRAINING» a 26px queda holgadamente dentro de los 256px
útiles, así que no espero problema — pero **es análisis, no medición**, igual
que el resto de lo que espera navegador. Va a la lista de lo que se comprueba
antes de `main`, no a un ciclo nuevo.

---

## Lo que sigue abierto y NO lo cierra esta aprobación

Los cuatro son del humano y ninguno es del código de la revisión 2:

1. **El `build` inestable.** La medición E1/E2/E3 sigue sin resultado. Dos —o
   tres— ejecuciones verdes seguidas no exoneran nada con una tasa observada del
   25 %. No bloquea el ítem; **sí sigue siendo condición para `main`**, porque
   la CI corre esos mismos cinco comandos en cada push.
2. **Las fotos**, y ahora también **la comprobación en navegador**: 320px con el
   logotipo nuevo, el anillo de foco sobre cada fondo, el acordeón con una tecla
   de verdad y el velo del cierre con la foto puesta.
3. **Los dos documentos que contradicen a la portada** —Términos § 12 y
   `definicion-web.md § 3`—, anotados en `docs/sistema-de-diseno.md § 8`.
4. **Las dos tareas de higiene A y B** de arriba.

## Aceptado con observación

- **`hero.tsx:64`** quedó con un `<div className="flex flex-wrap items-center
  gap-4">` que hoy envuelve un solo hijo. No molesta y tiene sentido conservarlo
  para cuando el botón recupere un vecino; lo anoto por si alguien lo ve y cree
  que falta algo.
- **La tabla de escala de `/estilo` no lista `text-action` ni `text-action-lg`**
  tampoco. Es coherente —los botones se demuestran en su propia sección— pero
  conviene saberlo al ejecutar la instrucción A: la tabla es de la escala de
  **lectura**, así que los tokens de marca pueden ir ahí o en una fila aparte,
  con tal de que la advertencia de los 9px se vea.
- Siguen en pie, sin cambios, las observaciones de la pasada anterior: los tres
  comentarios desactualizados, los dos `<nav>` con la misma etiqueta (preferencia
  mía, no regla), los medios pasos de la escala de espaciado, y que `plan.md`
  describe el mundo viejo en su cuerpo — ahora también en D-5.

## Regla que propongo agregar

Nace de un **vacío** que este cambio destapó, no de un error repetido. Lo
declaro para que se juzgue como lo que es.

### En `§ 1 Tokens`, en la línea de la tipografía

```markdown
- Tipografía: se usa la escala del sistema (`text-display`, `text-h2`,
  `text-h3`, `text-h4`, `text-lead`, `text-body`, `text-ui`, `text-action`,
  `text-label`). NUNCA un `text-[21px]` suelto. **Esa enumeración es la escala
  de LECTURA, y no es toda la tipografía del sistema:** hay familias que viven
  fuera de ella porque no participan de la jerarquía del documento —`action`
  (el texto de un botón) y `brand` (el logotipo, que tiene proporciones fijas
  por definición)—. Añadir una familia nueva exige dos cosas: que lo que se
  añade **no sea un escalón de lectura** —si lo es, se usa el escalón existente
  más cercano, como decidió D-4— y que quede **visible en `/estilo`**, porque un
  token que solo vive en el CSS es un token que alguien reutilizará mal.
```

**Por qué.** Hoy § 1 enumera nueve nombres y el sistema tiene doce: ya faltaba
`text-action-lg` y ahora faltan los dos de marca. Un revisor que lea esa línea
al pie de la letra rechazará `text-brand-mark` como «fuera de la escala», y
tendrá los papeles en regla para hacerlo. La regla no puede ser una lista que se
queda vieja: tiene que decir **qué distingue** a un escalón de lectura de una
familia de rol, que es justamente la distinción con la que se aprueba este
cambio y con la que D-4 rechazó el anterior.

---

## Cierre

Revisión 2 **APROBADA sobre el estado real del disco** a `2026-09-09T01:28:57`.
`reporte_qa.md` y este documento quedan ambos en APROBADO; la parte del código
posterior a su reporte la cubre este documento, archivo por archivo, con quién
decidió cada cosa. Quedan dos tareas de higiene con texto y criterio escritos,
cuatro pendientes abiertos que son del humano, y una regla sobre la mesa.
