# Mejoras del proceso — seguimiento

Backlog de mejoras al **flujo de trabajo** (reglas, skills, agentes, gates,
hooks), no al producto. Sale de la auditoría del 2026-09-09 sobre la cadena de
W-10: qué falló de verdad, medido contra el disco y no contra los reportes.

**Cómo se usa.** Un ítem se cierra marcando su casilla, poniendo la fecha y
—si dejó rastro en git— el commit. Lo que se decide NO hacer se mueve a
§ Descartado con el motivo; borrar un ítem sin motivo escrito es perder la
decisión, que es justo el defecto que la mitad de esta lista viene a arreglar.

**El orden es por riesgo ÷ coste**, no por importancia percibida. P0 son
minutos y desbloquean lo demás; P2 espera al próximo ítem de trabajo.

---

## Estado

| #   | Ítem                                                     | Prioridad | Estado    |
| --- | -------------------------------------------------------- | --------- | --------- |
| 1   | Librerías del navegador                                  | P0        | Hecho     |
| 2   | Cerrar la deriva del árbol (fotos)                       | P0        | Hecho     |
| 3   | Reenunciar el hallazgo de `definicion-web.md`            | P0        | Hecho     |
| 4   | Cada criterio de aceptación declara su verificador       | P1        | Hecho     |
| 5   | Las excepciones se escriben junto al código              | P1        | Hecho     |
| 6   | `definicion-web.md` a la lista de lectura + contraste QA | P1        | Hecho     |
| 7   | La copy del cierre contra Términos § 12                  | P1        | Hecho     |
| 8   | Ampliar `WATCHED` en `gates.mjs`                         | P1        | Hecho     |
| 9   | El contrato pasa a `specs/W-XX.md` versionado            | P2        | Pendiente |
| 10  | Dos patrones más en `design-system.mjs`                  | P2        | Pendiente |
| 11  | Escribir cuándo NO se usa la cadena                      | P2        | Pendiente |
| 12  | La plantilla del QA dice qué mide la cobertura           | P2        | Pendiente |

---

## P0 — Hoy, menos de una hora en total

### 1. Instalar las librerías del navegador

- [x] **Hecho** el 2026-09-09 · `ldd` sobre el binario de Chromium: 0 faltantes

```bash
sudo apt-get install -y libnss3 libnspr4 libasound2   # Ubuntu 22.04
```

**Qué arregla.** Los cuatro criterios de aceptación de W-10 que hoy se
verifican «por análisis y no por píxeles»: el desbordamiento a 320px, el
anillo de foco sobre cada fondo, el acordeón con una tecla real y el encuadre
de las fotos.

**Beneficio.** El mayor de la lista por coste. Chromium **ya está descargado**
(`~/.cache/ms-playwright/chromium-1243`); lo único que falta son cinco
librerías del sistema que salen de tres paquetes:

```
$ ldd .../chrome-linux64/chrome | grep "not found"
libasound.so.2   libnspr4.so   libnss3.so   libnssutil3.so   libsmime3.so
```

**Coste.** Un comando. **Ojo:** en Ubuntu 22.04 el paquete es `libasound2`;
`libasound2t64` es de 24.04 en adelante.

**Lo que NO trae este ítem:** instalar Playwright como dependencia del repo.
Los tests de aceptación llegan con el panel. Esto solo devuelve la capacidad
de **mirar** la página, y se usa así —sin dependencia nueva—: `next start` en
un puerto libre y el binario de la caché con `--headless --screenshot`.

**Lo que encontró en su primer uso, el mismo día:** el héroe y el cierre
llevaban meses sin dibujar su foto. Ver el ítem 2.

---

### 2. Cerrar la deriva que hay en el árbol

- [x] **Hecho** el 2026-09-09 · commits `22af0a1` y `693fe32`

**Qué arregla.** El 2026-09-09 el árbol tenía cuatro archivos modificados y
`public/` sin commitear —entre ellos +99 líneas en un primitivo compartido,
`photo-slot.tsx`— sin plan, sin QA y sin revisión. La aprobación vigente
(`revision_codigo.md`, 20:46) describía un código que ya no era el del disco
(último cambio, 22:09).

**Beneficio.** Es el mismo fallo que ese documento dice haber venido a
corregir —«sustituye a la aprobación de las 20:04, que cubría un código que ya
no es el que hay en disco»—, repetido con más superficie. Cada hora que sigue
abierto, el diff a revisar crece.

**Coste.** Una lectura del diff y `/commit`. No hace falta cadena de agentes:
es trabajo de presentación ya escrito y con gates en verde.

**Defecto encontrado al revisarlo, que se decide antes de commitear:** las dos
fotos son **1376×768**, y `rulesFrontend.md § Imagen` fija el héroe en
**2400×1400**. No es solo tamaño, también relación de aspecto (1.79 frente a
1.71). `next/image` no amplía por encima del original, así que en cualquier
pantalla más ancha que ~1376 px el héroe se sirve escalado y se ve blando. Dos
salidas, y las dos exigen decisión humana: conseguir los originales a 2400 px,
o cambiar la regla con su motivo escrito. Lo que no puede es quedarse en
silencio, porque la regla seguiría diciendo una cosa y el repo enseñando otra.

**Avance (2026-09-09).** El héroe está resuelto: `docs/imagenes/heroe-6.jpg`
mide **2400×1400** exactos, la medida de la regla. Medido sobre el archivo:
luminancia media 11.5/255 —más oscuro que el que sustituye— y el tercio
izquierdo, que es donde vive el `<h1>`, entre 3 y 7/255. Necesita
`focus="70%"`: con el centro por defecto, el recorte de 390px parte a la
atleta por la mitad. **`cierre.jpg` resuelto también (2026-09-09):** `docs/imagenes/heroe-4.jpeg`
—que pese al nombre es la foto del cierre— llega a **2400×1400**. Las dos
fotos cumplen ya `§ Imagen` y **no hay que tocar la regla**. Medido sobre el
compuesto real (recorte `object-cover` a 1440×450 más el velo
`bg-background/80`): el fondo más claro bajo la columna de texto queda en
61/255, así que el titular mide **9.11:1** y el párrafo **5.05:1**. Los dos
pasan AA, y hacía falta comprobarlo porque esta foto es más clara que la que
sustituye (luminancia media 44.4 frente a 37.9).

**Defecto encontrado con el navegador, ya corregido (2026-09-09).** La foto
del héroe **no se dibujaba**, y la del cierre tampoco. `PhotoSlot` traía
`relative` propio y las dos pantallas le pasaban `absolute inset-0`: dos
utilidades de posición con la misma especificidad, y gana la que Tailwind emite
más abajo en la hoja —`relative`, en el byte 11634 del CSS construido frente al
11606 de `absolute`—. El hueco quedaba en el flujo con **alto cero** y la
imagen, que va con `fill`, desaparecía sin error. Corregido quitando el
`relative` del primitivo y poniéndolo en los dos sitios que lo necesitan
(`coaches.tsx`), con la invariante escrita al lado: sin caja no hay foto.

**Segundo defecto, también del navegador (2026-09-09).** Con la foto ya
visible, en una ventana de 1900px **la cabeza de la atleta quedaba cortada por
arriba**. `object-cover` recorta por el lado que sobra y en una ventana ancha
sobra el alto: a 1900px se pierden 440 de los 1400 y, centrados, son 220 por
arriba — pero la cabeza empieza en el píxel 156. Resuelto con el segundo valor
de `focus`, que hasta ahora solo llevaba el horizontal: `focus="70% 20%"`. En
móvil no cambia nada, porque a 390×760 no hay recorte vertical.

**Tercera foto (2026-09-09):** `entrenador.jpeg`, 1200×1400 — la medida de
«tarjeta» del sistema. Entra en `coaches.tsx` con `sizes` siguiendo a la
rejilla (`(min-width: 768px) 50vw, 100vw`) y sin `focus`: comprobado en el
navegador que a 1440 y a 390 las dos personas entran completas. Con ella la
portada ya no tiene ninguna nota de producción, así que el test que exigía
que las hubiera (`notas.length > 0`) se retiró y en su lugar quedó uno con
dientes: las tres fotos son decorativas, llevan `sizes` y **solo una no es
`loading="lazy"`** — el héroe, que es el LCP.

**Por qué importa más que los tres defectos:** los cinco gates estaban en verde con la
foto invisible, y lo siguen estando — no hay nada roto en el HTML, en los
tipos, ni en los tests. Es la prueba de que un criterio sin verificador (ítem 4) no está cubierto por mucho que la suite esté verde.

---

### 3. Reenunciar el hallazgo de `definicion-web.md`

- [x] **Hecho** el 2026-09-09 · queda escrito aquí

**Qué arregla.** El hallazgo circulaba como «planificamos una landing que
contradice los **Términos publicados**». Es falso, y es exactamente la
confusión que `docs/sistema-de-diseno.md § 8` ya documenta como error cometido
al planificar W-10.

**El enunciado correcto, que es el que hay que archivar:**

> Las reglas citan `definicion-web.md` una sola vez y de pasada (§ 6, para las
> URLs). No está en la lista de lectura de `/planificar` ni del Implementador,
> y **no vive en este repositorio** sino en `fitmess-api/docs/web/`. La cadena
> planifica producto contra un documento que ningún agente puede abrir. La
> contradicción de W-10 es con `definicion-web.md § 3` («sin registro
> público», «la web no lleva botón de Crear cuenta»), **no con los Términos**:
> su § 5 concede al Atleta «registro directo en la aplicación, sin aprobación
> previa».

**Beneficio.** Archivado como estaba, manda a alguien a «corregir» un
documento jurídico publicado y versionado que no tiene nada que corregir.

**Queda abierto y es otro ítem (el 7):** lo que sí roza los Términos es la
frase del cierre, no el botón.

---

## P1 — Antes de que W-10 llegue a `main`

### 4. Cada criterio de aceptación declara su verificador

- [x] **Hecho** el 2026-09-10 · `pnpm run screenshot` + notación en cuatro
      archivos de proceso

**Qué se hace.** En la plantilla de `/planificar`, un sufijo por criterio:
`[gate]`, `[test:<archivo>]`, `[lint]`, `[humano:navegador]`. Y una regla
nueva: **un criterio cuyo verificador no existe no pasa el Checkpoint 1** — se
resuelve el verificador, o el criterio sale del alcance con nombre y apellido.

**Qué arregla.** La raíz del ítem 1. El plan de W-10 escribió cuatro criterios
que exigían navegador, el humano los aprobó, y la cadena los aprobó tres veces
sin que nadie lo tratara como bloqueante. El QA lo declaró honestamente —«en
este entorno no hay navegador»— y aun así el ítem avanzó.

**Beneficio.** «Comprobado» deja de ser indistinguible de «no comprobable
aquí». Es el principio que sostiene el repo, aplicado un nivel más arriba.

**Coste.** Editar una plantilla. Cero herramientas nuevas.

**Lo que se hizo, y por qué costó una herramienta más de lo previsto.** La
notación son cuatro etiquetas —`[gate]`, `[test:<archivo>]`, `[navegador]`,
`[humano]`— en la plantilla de `/planificar`, con la regla del Checkpoint 1 y
una restricción que la hace exigible. Pero dejar `[navegador]` significando
«que lo mire el humano cuando se acuerde» arreglaba la mitad del problema, así
que se añadió **`pnpm run screenshot`** (`scripts/screenshot.mjs`): levanta el
build, abre el Chromium que ya estaba en la caché y captura la ruta a 320, 390
y 1440 en `outputs/capturas/`. Sin dependencias nuevas y con el mismo guardián
de frescura que los gates —si `.next` no corresponde al código, se niega, porque
una captura de un build viejo no se distingue de una buena—.

Y el reparto de responsabilidades quedó escrito donde se aplica: `qa.md` recorre
los criterios uno a uno con su verificador y **tiene prohibido declarar
verificado lo que no corrió**; `/implementar` presenta los `[humano]` abiertos
en el Checkpoint 2 en vez de darlos por buenos; y `rulesFrontend.md § Gates`
recoge la regla, que es lo que la hace del repo y no del skill.

---

### 5. Las excepciones se escriben junto al código que exceptúan

- [x] **Hecho** el 2026-09-10 · `SubHeading` en `/estilo` + § «Dónde vive una
      excepción» en las reglas

**Qué se hace.** Toda excepción a una regla lleva comentario en la línea **y**
entrada en la regla que la contempla. Se prohíbe explícitamente
`outputs/plan.md:NNN` como justificación de nada.

**Qué arregla.** El Líder Técnico encontró un `<h3 uppercase>` cuya excepción
solo existía en `outputs/plan.md:281`. Al verificarlo hoy: `plan-card.tsx` ya
no existe **y** la línea 281 del plan habla de otra cosa —el token
`--decorative`— porque el plan se reescribió para la Revisión 2. **La cita
dejó de resolver sin que nadie regenerara nada.** Basta editar el plan.

**Dónde está vivo hoy.** `estilo/page.tsx:429, 453, 477, 495` — cuatro `<h3>`
en mayúsculas. La justificación es sólida y está en las reglas («los niveles
de encabezado describen la jerarquía, no el tamaño»; `text-label` es una
etiqueta), pero no está al lado del código. Un revisor futuro abre § 6, lee
«mayúsculas nunca en un titular» y tiene los papeles en regla para pedir el
cambio.

**Coste.** Cuatro comentarios y dos líneas en `rulesFrontend.md`.

---

### 6. `definicion-web.md` a la lista de lectura, y contraste factual al QA

- [x] **Hecho** el 2026-09-10 · copia en `docs/definicion-web.md` + mandato en
      los tres agentes

**Qué se hace.** Dos ediciones de texto:

1. Añadir `definicion-web.md` a la lista de lectura de `/planificar` y del
   Implementador. Si el otro repo no está disponible en la sesión, traer una
   copia al repo y decir de dónde salió.
2. Una línea en `.claude/agents/qa.md`: _toda afirmación de la copy —incluida
   `metadata`— se contrasta contra el documento fuente que la sostiene
   (Términos, `definicion-web.md`, el catálogo legal), y lo que no se pueda
   sostener se reporta._

**Qué arregla.** El hueco por el que pasó `cd61aad` («los tres pasos describían
mal el flujo de consentimiento»): un defecto **semántico real** que superó al
Implementador, al QA, al Líder Técnico y a los cinco gates, y lo cazó una
persona leyendo.

**Beneficio.** Mueve al QA de donde no aporta —presentación sin ramas, que su
propia configuración de cobertura declara no medible— a donde ya demostró que
aporta: contrastar copy contra realidad (H-2 fue suyo, y su diagnóstico de
causa fue exacto).

**Coste.** Dos ediciones de texto.

**Lo que se hizo, y un hallazgo por el camino.** El documento se copia a
`docs/definicion-web.md` con su procedencia y el md5 del original en la
cabecera, fuera de Prettier para que un refresco no produzca un diff falso.
Entra en la lista de lectura de `/planificar`, del Implementador y del Líder
Técnico, y el QA gana un apartado entero —«La copy se contrasta con su
documento fuente»— con la tabla de qué se comprueba dónde y una fila nueva en
la clasificación: copy que contradice un documento fuente **bloquea**.

Y al abrirlo apareció que **`definicion-web.md § 3` ya estaba corregido**
(2026-09-09): dice «Registro público SÍ, acceso NO» y separa las tres puertas.
El pendiente que arrastraba `docs/sistema-de-diseno.md § 8` queda cerrado ahí
mismo. Es exactamente lo que este ítem venía a hacer posible: comprobar en vez
de recordar.

---

### 7. La frase del cierre contra Términos § 12

- [x] **Hecho** el 2026-09-10 · los Términos NO se tocan; cambia la copy

**Qué se decide.** `closing-cta.tsx:51` dice «Elige un plan, crea tu cuenta y
**ten tu primera sesión hoy mismo**». Los Términos § 12 declaran fase de
prueba, «grupo reducido de usuarios» y acceso controlado; § 5 remite a § 12
justo para el rol Atleta. Prometer sesión inmediata a cualquier visitante
afirma disponibilidad general de un servicio que el documento publicado
declara restringido.

**Qué arregla.** Una afirmación de producto que hoy no explota porque los
botones están inertes, y que explota el día del ítem de auth.

**Beneficio.** Es exactamente el tipo de defecto que la regla nueva de § 6
—«la copy no afirma lo que la pantalla no enseña»— existe para atrapar, y se
le escapó porque el QA lo miró por otro motivo (invita a elegir un plan que no
se muestra) y lo descartó por ser texto literal del humano.

**Coste.** Una decisión + anotarla en § 8 con su disparador: «revisar al
encender el registro».

**Cómo se resolvió, y el ítem estaba mal planteado.** Al leer los documentos
—que es lo que el ítem 6 acababa de hacer posible— resultó que **los Términos
no hay que tocarlos**: su § 5 ya concede al Atleta «registro directo, sin
aprobación previa», y lo que § 12 limita es el acceso durante la fase de
prueba, que sigue siendo cierto porque el acceso lo controla la aprobación del
entrenador. Publicar una versión nueva de un documento legal que no necesita
cambiar tiene coste —`1.1.0` no se borra nunca— y ningún beneficio.

**Lo que sí era falso es la copy, y por otro motivo del que decía el ítem.** La
frase prometía «ten tu primera sesión hoy mismo», y § 6 fija la cadena
Pendiente → Aprobada → consentimientos → Activa: registrarte hoy te da una
solicitud pendiente, no una sesión. De las tres puertas de
`definicion-web.md § 3`, la frase prometía justamente la única cerrada. Ahora
dice «…y empieza en cuanto tu entrenador apruebe tu inscripción», con el
porqué escrito en el componente y en su test, que la fija carácter a carácter.

---

### 8. Ampliar `WATCHED` en `scripts/gates.mjs`

- [x] **Hecho** el 2026-09-10 · comprobado que `public/`, `eslint-rules/` y
      `tsconfig.json` invalidan el JSON

**Qué se hace.** Añadir `eslint.config.mjs`, `eslint-rules`, `tsconfig.json` y
`public` a la lista que invalida un `gates.json`.

**Qué arregla.** Hoy `WATCHED` es `src`, `scripts`, `package.json`,
`vitest.config.ts` y `next.config.ts`. Cambiar la regla de lint o meter una
foto deja el JSON declarándose «fresco» — y las dos cosas se hicieron esta
semana.

**Beneficio.** `gates:check` deja de tener el punto ciego justo donde se acaba
de tocar.

**Coste.** Cuatro cadenas en un array.

**Lo que se hizo.** `WATCHED` pasa de cinco entradas a once, cada una con el
gate que la justifica escrito al lado. Comprobado a mano que tocar `public/`,
`eslint-rules/` o `tsconfig.json` invalida ahora el JSON. Se deja fuera a
propósito la prosa de `docs/` y `.claude/`, con el motivo escrito: la formatea
el hook en cada escritura, y vigilarla obligaría a recorrer los cinco gates por
corregir una frase.

---

## P2 — Con el próximo ítem de trabajo, no antes

### 9. El contrato pasa a `specs/W-XX.md`, versionado en git

- [ ] **Hecho** el ****-**-** ·

**Qué se hace.** `outputs/plan.md` sigue siendo el borrador; el **contrato**
vive en `specs/W-XX.md`, dentro de git, con criterios de identificador estable
(`AC-3`) y enmiendas **editadas en el cuerpo**, no prefijadas. Al cerrar el
ítem, copiar plan, `reporte_qa.md`, `revision_codigo.md` y el `gates.json`
citado a `docs/evidencia/W-XX/`.

**Qué arregla.** Dos cosas medidas:

- **El plan se contradice a sí mismo.** Revisión 2 borró la sección de planes,
  pero `§ Qué se construye` sigue prometiendo «los tipos de plan y sus datos
  concretos» y el criterio de aceptación nº 1 sigue listándola. De esa
  contradicción salió H-2, y el QA lo diagnosticó bien: «el conflicto es entre
  dos frases del propio plan».
- **Las citas por `timestamp` no resuelven.** `/outputs` está en `.gitignore`.
  El QA cita `gates.json @ 00:47:10Z` y el LT `@ 01:28:57Z`; en disco hay uno
  solo, `@ 03:10:18Z`. Ninguno de los dos referenciados existe en ninguna
  parte.

**Beneficio.** `docs/evidencia/` ya existe, ya está en git y ya se usa para
builds y despliegues: esto extiende un patrón propio, no inventa uno.

**Coste.** Una carpeta y cinco líneas en `/commit`. **Sin** esquema, sin
validador, sin herramienta.

---

### 10. Dos patrones más en `design-system.mjs`

- [ ] **Hecho** el ****-**-** ·

**Qué se hace.** Paleta de fábrica sin sufijo numérico (`white`, `black`,
dejando pasar `transparent` y `current`) y valores sueltos de espaciado
(`(p|m|gap|w|h|inset|top|…)-\[`, excepto `%`, `vh` y `vw`). Y —por primera
vez— casos de test que fijen **lo que se deja pasar a propósito**.

**Qué arregla.** Comprobado contra los patrones actuales:

```
PASA  text-white    PASA  bg-black     PASA  bg-white/10
PASA  mt-[34px]     PASA  p-[13px]     PASA  gap-[7px]
FLAG  text-red-500  FLAG  duration-[250ms]
```

`34px` es literalmente el valor que `rulesFrontend.md § 1` nombra como la
tentación del canvas.

**Beneficio.** El QA y el Líder Técnico tienen instrucción explícita de **no**
revisar a mano lo que el lint cubre. El hueco del gate es, por diseño, el
punto ciego de los dos revisores.

**Coste.** Dos regex y cuatro casos de test. Hoy `src/` no usa ninguno de esos
patrones —solo `bg-transparent`, que es legítimo—, así que es cerrar la puerta
antes de que entre nadie.

---

### 11. Escribir cuándo NO se usa la cadena

- [ ] **Hecho** el ****-**-** ·

**Qué se hace.** Un párrafo en `CLAUDE.md` y otro en `/implementar`: cadena
completa para pantallas con lógica, datos o contrato de API; Implementador +
revisión humana para presentación; nada para copy y ajustes. Con una condición
innegociable: **toda ruta rápida deja igualmente su registro en el spec**.

**Qué arregla.** De cinco cambios materiales de W-10, dos pasaron por la cadena
completa. El ciclo 2 no tuvo Líder Técnico; la Revisión 2 no tuvo segundo QA;
`cd61aad` no tuvo cadena; el trabajo de fotos tampoco.

**Beneficio.** Hoy la cadena se salta sin dejar rastro. Escrita la regla,
saltársela es una decisión y no un olvido.

**Coste.** Dos párrafos.

---

### 12. La plantilla del QA dice qué mide la cobertura

- [ ] **Hecho** el ****-**-** ·

**Qué se hace.** Una línea fija en el reporte: «`coverage.include` cubre
`src/lib/`: los componentes de este ítem **no** se miden».

**Qué arregla.** «La cobertura no baja de umbral en ningún archivo» se leyó
como evidencia de una entrega de diez componentes. Se miden tres archivos de
veintidós (`design-tokens.ts`, `landing-content.ts`, `legal.ts`).

**Beneficio.** Cierto y desinformativo pasa a cierto y honesto. No cambia ni un
umbral ni una configuración.

**Coste.** Una línea.

---

## Descartado a propósito — aquí estaría la sobreingeniería

Ninguno de estos se hace hoy. Si alguna vez se retoma, que sea con un motivo
nuevo escrito debajo, no por inercia.

- **Suite de Playwright.** Con el ítem 1 hecho, se **mira** la página. Los
  tests de aceptación llegan con el panel, como ya dicen las reglas. Una suite
  E2E para una landing estática es más mantenimiento que señal.
- **Ampliar `coverage.include` a los componentes.** El razonamiento de
  `vitest.config.ts` es correcto: hoy produciría tests que confirman que React
  renderiza. El umbral llega con los formularios del panel.
- **Stylelint.** Una dependencia nueva para una hoja de CSS que no declara ni
  un color. Revisión humana y a otra cosa.
- **Hash o firma en `gates.json`.** Propuesto y retirado: el modelo de amenaza
  de un repo de un solo desarrollador no justifica criptografía sobre un
  archivo local. El ítem 8 cubre el 90 % por el 2 % del coste.
- **Un cuarto agente, o un sistema formal de ADRs.**
  `docs/sistema-de-diseno.md § 8` ya funciona como registro de decisiones, está
  en git y se usa. Extenderlo, no sustituirlo.
- **Refactorizar los comentarios-changelog del código.** Son densos y algunos
  envejecen, pero son la única memoria que sobrevivió a `outputs/`. Con el
  ítem 9 hecho dejan de crecer solos; borrarlos ahora quita registro sin dar
  nada a cambio.

---

## Bitácora

| Fecha      | Qué                                                                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-09 | Auditoría de la cadena de W-10. Se abre esta lista con 12 ítems. Ítem 3 cerrado en el acto.                                                                                                                             |
| 2026-09-10 | Medido el «build inestable»: 10 builds seguidos con `next dev` vivo, 0 fallos (24 con los de la sesión). El pendiente no tenía definición ni evidencia y se cierra — `docs/evidencia/2026-09-10-build-estabilidad.txt`. |
| 2026-09-10 | Ítem 7 cerrado, y al revés de como estaba escrito: los Términos ya permitían el registro; lo falso era la copy del cierre.                                                                                              |
| 2026-09-10 | Ítems 5, 6 y 8 cerrados. Al traer `definicion-web.md` se descubre que su § 3 ya estaba corregido: el pendiente de § 8 se cierra.                                                                                        |
| 2026-09-10 | Ítem 4 cerrado: notación de verificadores + `pnpm run screenshot`.                                                                                                                                                      |
| 2026-09-09 | Ítem 1 cerrado. En su primer uso el navegador descubre que las dos fotos a sangre no se dibujaban (colisión `relative`/`absolute` en `PhotoSlot`). Corregido, con la foto del héroe a 2400×1400 y `focus="70%"`.        |
