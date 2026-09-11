<!-- ─────────────────────────────────────────────────────────────────────────
COPIA. El original vive en `fitmess-api/docs/web/definicion-web.md`.

POR QUE ESTA AQUI: `rulesFrontend.md § 6` fija las URLs de la web «por
`definicion-web.md § 3`», y este documento decide qué páginas existen y qué
puede afirmar la copy. Mientras vivía solo en el otro repositorio, ninguna
sesión de trabajo sobre la web podía abrirlo — y de ahí salió un defecto real:
los tres pasos de «Cómo funciona» describían mal el flujo de consentimiento y
llegaron a producción de `develop` con los cinco gates en verde (`cd61aad`).

SI LOS DOS DIFIEREN, MANDA EL ORIGINAL. Esta copia se refresca a mano:

    cp ../fitmess-api/docs/web/definicion-web.md docs/definicion-web.md
    # (y se vuelve a escribir esta cabecera, con el hash nuevo)

Copiado el 2026-09-10 · md5 del original: 0be6c16b009e
No se edita aquí: un cambio de producto se hace en el original y se vuelve a
copiar. Editar la copia produce dos verdades y ninguna autoridad.
────────────────────────────────────────────────────────────────────────── -->

# Definición técnica de la web — stack, repositorio y arquitectura

> **Tipo: DECISIÓN** — Stack, repositorio y arquitectura de la web.
> Estado: **PROPUESTA — sin aprobar**, 2026-09-01. Extiende `docs/despliegue/plan-de-despliegue.md § 4`
> y aterriza el alcance de `docs/backlog/backlog-mvp-android.md § Web del entrenador`.
> Nada de esto está ejecutado.

La web cubre cuatro trabajos: **presentación del producto**, **publicación de los documentos
legales**, **panel del entrenador** y **las páginas que sostienen los enlaces de correo**
(recuperación de contraseña de los tres roles, registro de administrador por invitación,
eliminación de cuenta).

---

## 0. Lo que cambia respecto del backlog

Tres correcciones al § *Web del entrenador*, todas verificadas contra el código hoy:

1. **Las páginas públicas son SEIS, no cinco.** Falta el formulario de *solicitud* de
   recuperación (`POST /api/auth/forgot-password`). El backlog inventarió la página que canjea
   el token pero no la que lo pide. **El atleta la tiene dentro de la app; el entrenador y el
   administrador no tienen app**, así que sin esta página los dos únicos usuarios privilegiados
   del MVP no tienen ningún camino de vuelta si olvidan la contraseña. Es media línea de
   backlog y es la mitad que hace que P1-02 sirva.
2. **No se crea el monorepo `fitmess-app` todavía.** Ver § 2.
3. **El nombre público del producto es `fittraining`, no `fitmess`.** Ver § 2.

Y un bloqueante que no es de la web pero la detiene: **el quinto documento legal no existe**.
`docs/legal/` tiene cuatro archivos; `ACCOUNT_DELETION_NOTICE 1.0.0` está en el catálogo
server-side (`legal-documents.catalog.ts`) y `DELETE /api/auth/account` valida la versión contra
él, pero **nadie escribió el texto**. La página de eliminación de cuenta no se puede construir
sin él: tiene que mostrar lo que la persona reconoce al confirmar.

---

## 1. Stack

| Capa | Elección | Por qué esta y no otra |
|---|---|---|
| Framework | **Next.js (App Router) + React 19 + TypeScript** | Es lo único que cubre los cuatro trabajos con un solo modelo mental: páginas estáticas prerenderizadas para el CDN, formularios que hacen POST a la API, panel detrás de auth, y —cuando llegue— Route Handlers para la cookie de sesión. Vite+SPA no tiene servidor y obliga a decidir hoy el problema de la sesión; Astro es mejor para las seis páginas y peor para el panel |
| Estilos | **Tailwind + shadcn/ui** | Costo de runtime cero, componentes copiados al repo (no una dependencia que versionar). Para la fase 1 se necesitan cuatro: botón, input, card, alert |
| Cliente de API | **`openapi-typescript` + `openapi-fetch`** | Dos dependencias de desarrollo y un script. El valor real no es el tipado, es el chequeo de CI del § 4 |
| Contenido legal | **Markdown renderizado en build** | Los textos ya existen en Markdown y son inmutables por versión |
| Hosting | **AWS Amplify Hosting** | Decidido en el plan de despliegue. Ver el riesgo en § 5 |
| Pruebas | **`tsc --noEmit` + ESLint + build + Playwright sobre los tres flujos de token** | Ver § 6 |

### Lo que el backlog listaba y NO entra en la fase 1

- **TanStack Query** — en la fase 1 hay cuatro llamadas a la API, todas POST de un formulario,
  ninguna cacheable. Entra con el panel, donde sí paga (invalidaciones de inscripciones
  pendientes, progreso por atleta).
- **`react-hook-form` + `zod`** — tres formularios de uno a tres campos. `<form>` nativo y la
  validación del servidor alcanzan. Entra con el constructor de planes, que es el único
  formulario serio del producto.

Postergar estas dos no es ahorro de dependencias: es que **en la fase 1 no hay nada que
decidir sobre caché ni sobre esquemas de formulario**, y elegir sin el problema delante es
como se llega a una abstracción que después estorba.

---

## 2. Repositorio

### `fittraining-web` — repo propio, no monorepo

```
fittraining-web/          (nuevo)
fittraining-app/          (después, cuando la app exista)
fitmess-api  → fittraining-api   (renombrar, ver abajo)
```

**El backlog propone `fitmess-app` con `apps/mobile` + `apps/web` + `packages/api`. No para el
MVP.** El argumento del backlog es que la app y la web comparten el cliente generado del
contrato. Pero ese cliente **se genera con un comando desde `openapi.json`**: su fuente de
verdad ya vive en el repo de la API, y tenerlo dos veces no es duplicación —es el mismo
artefacto derivado dos veces del mismo original—. Lo que sí cuesta el monorepo hoy:

- La app **todavía no existe** (P1-06, y el offline-first quedó diferido el 2026-09-01). Es
  andamiaje de monorepo para una sola aplicación real.
- Amplify desplegando desde un subdirectorio necesita configuración de monorepo y `appRoot`;
  es fricción en el único despliegue que hoy bloquea Play Store.
- Expo y Next.js no van a compartir la capa de fetch de todos modos.

**La salida si el argumento cambia:** cuando exista la app y se descubra código realmente
compartido (que no será el cliente generado, sino tipos de dominio o lógica de formato),
juntar dos repos en un monorepo es un día de trabajo, **y para entonces se sabrá qué se
comparte**. Hoy es una suposición.

### El nombre: `fittraining`, no `fitmess`

El producto se llama **fittraining** en todo lo que es público y caro de cambiar:

- el dominio del plan de despliegue: `fittraining.app`
- los cuatro documentos legales: *«fittraining es operado por…»*
  (`terminos-y-condiciones-v1.1.0.md:22`)
- el correo de contacto del responsable del tratamiento: `fittraining.ap@gmail.com`

`fitmess` sobrevive solo en el nombre del repo, en `package.json` y en el título de Swagger.
Es lo privado y barato. **Nombrar el repo nuevo `fitmess-web` propaga el nombre muerto al
único artefacto que todavía no existe**, que es exactamente cuándo no hay que hacerlo.

**Recomendación adicional: renombrar `fitmess-api` → `fittraining-api` ahora.** Hoy es el
momento más barato de toda la vida del proyecto: nada está desplegado, no hay pipeline de
Amplify apuntando al repo, no hay imagen de Lightsail construida, no hay `assetlinks.json` ni
Play Console. GitHub redirige los remotos viejos. La misma operación después del paso 3 del
plan de despliegue toca configuración de tres servicios. Si se decide no renombrar, que sea
una decisión y no una omisión — pero no se propaga a los repos nuevos en ningún caso.


### Cerrado el 2026-09-05 — W-D5, y por qué son tres decisiones y no una

El renombre parecía uno solo y son tres, con costos que no se parecen. Medidos contra el repo antes
de decidir:

**1. El repo nuevo se llama `fittraining-web`.** Es la parte que bloqueaba W-01 y no tiene
contraargumento: el nombre muerto no se propaga al único artefacto que todavía no existe.

**2. `fitmess-api` se renombra a `fittraining-api`, pero SOLO en GitHub.** Un botón en Settings más
`git remote set-url` para no depender del redirect. Hoy no cuesta nada porque **nada apunta a ese
nombre**: Amplify se conecta al repo de la web, no a este, y Lightsail construye desde el fuente.

**3. La carpeta local NO se renombra.** Es la parte que ningún documento había considerado y la
única con costo real: Claude Code deriva el directorio de memoria y de transcripts de la **ruta
absoluta** del proyecto — hoy `~/.claude/projects/-home-jonfonse-projects-fitmess-fitmess-api/`. Si
la carpeta cambia de nombre, la sesión siguiente arranca **sin `MEMORY.md` y sin historial**, y se
ve exactamente igual que un proyecto nuevo. Es recuperable renombrando esa carpeta en paralelo, pero
el beneficio del lado local es **cero**: ese nombre no lo ve nadie más que quien tiene el checkout.
De paso, `.claude/settings.local.json` cablea la ruta absoluta en una decena de permisos; no rompen,
solo se vuelven a preguntar.

**Lo que esta decisión NO incluye: el nombre del producto dentro del código.** Es un renombre
distinto, y su inventario quedó medido:

| Dónde | Qué se hace |
|---|---|
| Los **seis correos** (`email.service.ts`, 10 cadenas) | **Se arregla, y es lo único urgente de la lista** → hallazgo **#30**, ítem **P2-14** del backlog de release. Es lo único que ve un usuario |
| Título de Swagger (`main.ts:85` **y** `scripts/export-openapi.mjs:149`) | Opcional. Está **duplicado**: si se cambia, van los dos o el contrato exportado deja de coincidir con el runtime. Swagger está apagado en producción |
| `package.json`, prefijos `fitmess-*` de `.spectral.yaml` | Opcional, cosmético |
| `deleted+<userId>@fitmess.invalid` | **NO se toca.** Es el centinela de anonimización, se persiste en filas ya escritas y `.invalid` es un TLD reservado: cambiarlo crearía dos formatos del mismo dato |
| 92 fixtures `@fitmess.co`, `FITMESS_MIGRATION_WINDOW`, `POSTGRES_DB` | **NO se tocan.** Ruido, o costo sin ganancia |

El criterio que ordena la tabla es el mismo que decidió (2) y (3): **el nombre importa donde lo ve
alguien de afuera, y no importa donde no.**

---

## 3. Arquitectura

### Dos fases, y la segunda no bloquea nada

**El panel del entrenador no bloquea la publicación en Play Store.** Los pasos 1–7 del plan de
despliegue sí, y el panel es el 8. Separarlos importa porque **la fase 1 no necesita sesión**,
y la sesión es la única decisión difícil de toda la web.

#### Fase 1 — Las seis páginas públicas. Sin sesión.

| Ruta | Qué hace | API | Cierra |
|---|---|---|---|
| `/` | Presentación. Qué es, capturas, enlace a Play Store, enlaces legales, enlace a eliminar cuenta, y las llamadas a **registrarse** e **iniciar sesión** (ver más abajo) | — | — |
| `/politica-de-privacidad` | Renderiza el Markdown | — | **P0-02** |
| `/terminos`, `/consentimiento-deportivo`, `/consentimiento-datos-de-salud` | Ídem | — | P1-07 |
| `/eliminar-cuenta` | Correo + contraseña + aviso de eliminación + confirmación | `POST /api/auth/login`, `DELETE /api/auth/account` | **P0-01** |
| `/auth/forgot-password` | Correo → dispara el envío | `POST /api/auth/forgot-password` | P1-02 (la mitad que falta) |
| `/auth/reset-password?token=` | Token de la query + contraseña nueva | `POST /api/auth/reset-password` | **P1-18** |
| `/auth/admin/register?token=` | Token de la query + datos de registro | `POST /api/admin-invitations/verify`, `POST /api/auth/admin/register` | El agujero de EPICA-09 |

**Las dos últimas rutas no son negociables: están cableadas en el backend.**
`email.service.ts:103` construye `${APP_BASE_URL}/auth/admin/register?token=` y `:415`
construye `${APP_BASE_URL}/auth/reset-password?token=`. Cambiar la ruta de la página rompe el
correo en silencio; el 404 aparece del lado del usuario y no en ningún gate.

Sin sesión de verdad: `/eliminar-cuenta` se autentica y sostiene el *bearer* **en memoria** los
segundos del flujo, sin persistirlo. Para una página cuyo propósito es terminar la cuenta,
no persistir es mejor que una cookie. Es lo que ya decidió el plan de despliegue § 4.

**Registro público SÍ, acceso NO.** (Corregido el 2026-09-09; antes este párrafo decía «sin
registro público» y era erróneo.) Desde la web el **atleta se registra** y el **entrenador
inicia sesión**. El administrador sigue entrando solo por invitación.

Lo que hace que esto no contradiga nada es que **registrarse no da acceso a nada**:

| | Puerta | Quién decide |
|---|---|---|
| **Crear la cuenta** | Abierta. Registro directo, sin aprobación previa | Nadie |
| **Inscribirse a un plan** | **Cerrada.** La solicitud queda *Pendiente* | El entrenador la aprueba o la rechaza |
| **Ejecutar las sesiones** | Cerrada hasta aceptar los dos consentimientos, **por plan** | El atleta, tras la aprobación |

Es literalmente lo que dicen los Términos, y conviene citarlos porque el párrafo anterior los
citaba al revés: el **§ 5** describe al Atleta como «Registro directo en la aplicación, **sin
aprobación previa**», y el **§ 6** fija la cadena *Pendiente → Aprobada → consentimientos →
Activa*. Lo que el **§ 12** limita es el **acceso durante la fase de prueba**, no la puerta de
registro; leerlo como si cerrara el registro fue el error.

El backend ya lo implementa así: `POST /api/auth/register` es público, y
`/api/subscriptions/{id}/approve`, `/reject` y `/accept-consent` son los tres pasos siguientes.

**Consecuencia para la web, y es la parte que se olvida:** una landing puede invitar a
registrarse, pero **no puede prometer que registrarse basta para entrenar**. Si describe el
flujo —unos «tres pasos», por ejemplo— tiene que incluir la aprobación del entrenador y colocar
los consentimientos **después** de ella, no en el alta de la cuenta. La portada de W-10 llegó a
equivocarse justo en eso y se corrigió contra el § 6 (`fittraining-web`, commit `cd61aad`).

**Lo que queda por decidir:** el nombre de las rutas de registro e inicio de sesión. Hoy la
portada las dibuja **inertes** —se ven y no navegan— precisamente para no fijarlas a la ligera.
Cuando se decidan, entran en la tabla de arriba, y conviene mirar antes las dos que el backend
ya tiene cableadas para no elegir un esquema que choque con ellas.

#### Fase 2 — El panel. Cuatro cosas.

Alcance del backlog, sin agregados: crear y publicar plan; **cargar la estructura completa con
`POST /plans/{id}/replace-structure`**; aprobar o rechazar inscripciones; ver progreso. Los 73
endpoints del contrato ya cubren las cuatro.

**La decisión de sesión se toma acá, no antes**, y hay dos diseños coherentes:

- **(A) BFF en Next.js.** Route Handlers en `/api/session/*` guardan el refresh token en cookie
  `httpOnly` del dominio de la web y hacen de intermediarios. **No toca el backend.** Es lo que
  el plan de despliegue ya asume en su paso 8.
- **(B) Cookie de dominio compartido.** La API pone la cookie `httpOnly` en
  `Domain=.fittraining.app` (el plan § 1 ya compró el dominio pensando en esto). Deja la web
  100% estática, pero **exige tocar el backend**: cookie en login/refresh/logout, CORS con
  credenciales, y la disciplina de que **solo el refresh** viaje en cookie —el access token
  sigue siendo *bearer* en memoria— porque si toda la API pasa a autenticarse por cookie
  aparece CSRF donde hoy no hay.

Por defecto **(A)**, porque no toca un backend que ya está verificado y porque elegir Next.js
en la fase 1 la deja gratis: agregar un Route Handler es agregar un archivo, no migrar nada.

**El diseño de las tres pantallas del panel —y el hallazgo del 413 que lo bloquea— está en
`docs/web/definicion-panel-entrenador.md`.**

### Lo que NO se construye

- **Panel de administrador** (P3-03). El backlog ya argumenta por qué: un administrador con
  tres acciones irrepetibles, cubiertas por la colección Postman y Swagger.
- **Editor de árbol con CRUD por nodo.** `replace-structure` recibe el plan entero en un
  payload. Un formulario estructurado que arme ese payload es una fracción del costo.
- **El bucket de medios, para la fase 1.** El plan § 3 lo reserva para versiones legales,
  avatares e imágenes de ejercicios. Verificado hoy: **no hay ni un endpoint de subida en el
  contrato** —cero `FileInterceptor`, cero `@UploadedFile`, cero código de S3 en `src/`—, y
  `avatarUrl`/`bannerUrl` son columnas que nadie escribe. Y los documentos legales los sirve la
  propia web en URLs versionadas, que es lo mismo que pedía el argumento de inmutabilidad. El
  bucket entra cuando exista el endpoint que lo llene.

---

## 4. Cómo la web consume el contrato y los textos legales

**El contrato (`openapi.json`) es del backend.** Se copia al repo web como artefacto pinneado a
un tag de release, nunca por ruta relativa entre repos:

```
fittraining-web/
  contract/openapi.json      ← copiado de un tag de fittraining-api, commiteado
  lib/api/schema.d.ts        ← generado, commiteado
```

CI regenera y falla si el diff no está vacío — es el mismo espíritu de `contract:check` en el
repo de la API: **un cliente generado que nadie verifica es indistinguible de uno al día**.

**El texto legal es de la web.** No es una preferencia: es la decisión D-8 de EPICA-01, escrita
en el propio catálogo del backend — *«el contenido y el versionado detallado del texto viven en
el frontend»* (`legal-documents.catalog.ts:8-10`). El backend es dueño solo de **qué versiones
acepta**. Consecuencia práctica: los `docs/legal/*.md` de este repo se mueven al repo web y las
copias que queden acá son históricas, con un solo dueño declarado.

**No se construye un gate que compare las versiones publicadas contra
`LEGAL_DOCUMENT_VERSIONS`.** Son cinco cadenas, y si divergen la API responde **422** en el
primer intento de aceptación — un fallo ruidoso e inmediato, no silencioso. La regla se escribe;
el gate no se construye.

---

## 5. Riesgos que se aceptan a ojos abiertos

**Amplify va detrás de las versiones de Next.js.** Si el build falla, se estará depurando el
hosting y no la aplicación, en el camino crítico de Play Store. Mitigación: fijar la versión de
Next.js a una que Amplify documente como soportada, y verificar el despliegue con una página
vacía **antes** de escribir las seis.

La salida de emergencia es Vercel, y **tiene un costo legal con fecha de vencimiento**: sería un
encargado del tratamiento nuevo y una transferencia internacional más, o sea § 8 de la política.
Hoy eso es gratis porque los documentos **no están publicados** — es la misma ventana que
aprovechó la declaración de AWS el 2026-08-30. **Después de publicar, cuesta una versión 1.2.0 y
volver a pedir la autorización a cada usuario.** Si hay alguna duda sobre Amplify, se resuelve
antes del paso 5 del plan de despliegue, no después.

---

## 6. Gates de la web

El repo de la API tiene siete gates. La web al arrancar no necesita siete; necesita que no se
rompa en silencio lo que no tiene otra red:

| Gate | Por qué |
|---|---|
| `tsc --noEmit` | El cliente generado no sirve de nada si nadie verifica los tipos |
| ESLint + Prettier | Igual que en la API |
| `build` | Amplify falla tarde y en su propia consola; que falle antes y acá |
| Cliente generado al día contra `contract/openapi.json` | § 4 |
| **Playwright sobre los tres flujos de token** | Recuperación, registro de admin y eliminación de cuenta. Son los únicos caminos de vuelta a una cuenta perdida, dependen de una cadena de tres piezas (correo → URL → POST) y **ninguna otra capa los ejercita** |

**Sin umbral de cobertura unitaria.** Sobre seis páginas mayormente estáticas mediría la
disciplina de escribir tests, no el riesgo. El riesgo está en los tres flujos de arriba y ahí va
Playwright.

---

## 7. Orden

Encaja en el § 6 del plan de despliegue sin cambiarlo:

1. **Escribir el quinto documento legal** (`ACCOUNT_DELETION_NOTICE 1.0.0`). Bloquea
   `/eliminar-cuenta`, o sea P0-01. Es texto, no código, y no depende de nada.
2. Crear `fittraining-web`, desplegar una página vacía en Amplify y **verificar el build antes
   de escribir nada** (§ 5).
3. Las cuatro páginas legales + la presentación → cierra **P0-02**.
4. `/auth/forgot-password`, `/auth/reset-password`, `/auth/admin/register` → cierra **P1-18** y
   la mitad web de P1-02. Son las páginas más baratas y las de mayor retorno: desbloquean
   backend que ya está construido y verificado.
5. `/eliminar-cuenta` → cierra **P0-01**.
6. El panel, con la decisión de sesión del § 3.

### Dos cosas del backend que la fase 1 obliga a tocar

- **P1-09 (CORS) pasa a bloqueante.** Hoy `main.ts:77` es `app.enableCors()` sin opciones: con
  la web en `fittraining.app` llamando a `api.fittraining.app`, funciona por accidente porque
  permite todos los orígenes. Hay que restringirlo al dominio de la web, y eso necesita una
  variable que **no existe** en `.env.example`.
- **`APP_BASE_URL` y `EMAIL_FROM` siguen apuntando al proyecto anterior**
  (`.env.example:82-83`: `noreply@fitmess.co`, `http://localhost:3000`). Los dos enlaces de
  correo se arman por concatenación de cadenas, así que una barra final de más produce
  `//auth/reset-password`. Es lo que P2-12 pide validar al arranque.
