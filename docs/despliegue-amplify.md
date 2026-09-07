# Despliegue en AWS Amplify — restricciones y consideraciones

> **Tipo: RESTRICCIONES.** Lo que Amplify impone sobre este repo y por qué cada decisión de
> versión es la que es. Investigado y verificado contra la documentación de AWS el **2026-09-05**.
> Las fuentes están al final; cada afirmación de versión sale de ahí, no de memoria.

---

## 1. La versión de Next está fijada, y no es la última

`package.json` fija **`next: 15.5.25`** — sin `^`, a propósito.

La documentación de AWS dice, textual:

> «You can deploy apps built with Next.js versions **up through Next.js 15**»
> «Amplify Hosting compute fully manages server-side rendering (SSR) for apps built with
> **Next.js versions 12 through 15**»

Y el 2026-09-05 la última estable de Next es **16.3.4** (2026-08-31). O sea que **`create-next-app`
sin versión instala una major que Amplify no soporta**, y el fallo aparece en la consola de Amplify
—no en local— cuando ya hay páginas escritas.

`15.5.25` es la última estable de la rama 15 (2026-08-31) y trae React 19, que es lo que el stack
ya asumía.

### La regla que se deriva

**Antes de subir a Next 16 hay que releer la página de soporte de Amplify y confirmar que la
enumera.** No alcanza con que el build pase en local: la incompatibilidad no es de compilación,
es del proveedor de SSR. `eslint-config-next` va pinneado a la misma versión por el mismo motivo.

---

## 2. Node 22

Amplify soporta **Node.js 20, 22 y 24**; la imagen AL2023 trae **22 por defecto** y ya no soporta
14, 16 ni 18. Amplify elige el runtime de la función según **el major con el que se construyó la
app**, así que el major del build es el que manda.

Este repo lo fija en tres lugares, y los tres deben decir lo mismo:

| Dónde                            | Valor      | Para qué                                               |
| -------------------------------- | ---------- | ------------------------------------------------------ |
| `.nvmrc`                         | `22`       | El local y el build de Amplify                         |
| `engines.node` en `package.json` | `>=22 <23` | Falla ruidosamente si alguien usa otro major           |
| entorno local                    | v22.22.0   | Coincide con el default de Amplify sin configurar nada |

---

## 3. Lo que Amplify NO soporta — condiciona el diseño, no solo el deploy

Lista textual de la documentación de AWS:

- **Edge API Routes** (_Edge middleware is not supported_)
- **ISR _on-demand_** (la ISR normal sí está soportada)
- **Next.js streaming**
- Middleware corriendo sobre static assets e imágenes optimizadas
- `unstable_after` (experimental de Next 15)

**El que muerde es el streaming.** No afecta a la fase 1 —las seis páginas públicas son estáticas o
formularios— pero el patrón habitual del panel (`loading.tsx` + Suspense para ir pintando mientras
llegan los datos) **se apoya en streaming**. En la fase 2 hay que resolverlo con estados de carga
del lado del cliente, no con streaming del servidor. Anotarlo acá para no descubrirlo con el panel
escrito.

### Imágenes

El tamaño máximo de salida de una imagen optimizada es **4.3 MB**. Amplify **despliega `sharp` por
su cuenta**: no hay que instalarlo, a diferencia de lo que dice la documentación de Next.

---

## 4. pnpm, y cómo aislar un fallo de build

Amplify autodetecta Next.js **asumiendo npm**. Este repo usa **pnpm**, igual que la API, así que
`amplify.yml` es explícito y activa pnpm con `corepack` leyendo el campo `packageManager` de
`package.json` (versión exacta; nunca `npm i -g pnpm`, que ignoraría el pin).

### El `amplify.yml` del repo le gana a la consola

La consola de Amplify muestra un «Comando de compilación de frontend» que autodetectó de
`package.json` — y **no es lo que corre**. La documentación de AWS lo dice textual:

> «Amplify applies these settings to all of your branches **unless there is an `amplify.yml` file
> stored in your repository**»

Consecuencia práctica para depurar: **editar el comando en la consola no cambia nada** mientras este
archivo exista en la raíz. Verificado el 2026-09-05, cuando la consola mostraba `pnpm run build` y el
build corrió el `preBuild` con corepack que la consola no mostraba en ningún lado.

**Si el primer build falla, hay dos variables sospechosas a la vez** —la versión de Next y el gestor
de paquetes—, y confundirlas cuesta horas. El orden para aislarlas:

1. Leer el log de Amplify: si revienta en `preBuild`, es **pnpm/corepack**; si revienta en
   `pnpm run build`, es **Next o el código**.
2. Si es pnpm: cambiar `amplify.yml` a `npm ci` + `npm run build` y borrar `pnpm-lock.yaml` del
   build. Es un cambio de tres líneas y **no toca el código**.
3. Recién si con npm también falla, el problema es Next o la aplicación.

---

## 5. El dominio

`fittraining.app` está en **Cloudflare Registrar**, con la zona DNS en Cloudflare y **todos los
registros en modo solo DNS**.

- **La nube naranja (proxy) se queda apagada.** Con el proxy activo, Cloudflare termina el TLS y
  ve los datos —incluidos los de salud— y pasa a ser **encargado del tratamiento**, lo que obliga a
  declararlo en el § 8 de la política de privacidad. Es una decisión legal, no de rendimiento.
- El ápice (`fittraining.app`, sin `www`) no admite un CNAME por DNS: Cloudflare lo resuelve con
  **CNAME flattening**, que funciona en modo solo DNS. **Verificarlo el día que se conecte el
  dominio**, no asumirlo.
- **El hola mundo NO espera al dominio:** corre sobre `*.amplifyapp.com`. El dominio se conecta
  después.

### Conectado y verificado el 2026-09-07

`https://fittraining.app` responde 200 con la página del sitio. Comprobado desde fuera de las dos
consolas, que es lo único que prueba que existe para un tercero:

```
fittraining.app       A     → 3.174.240.159 .176 .122 .161   (IPs de CloudFront)
www.fittraining.app   CNAME → dp50dntay5qpx.cloudfront.net
certificado           CN = *.fittraining.app · emisor Amazon RSA 2048 S19
                      SAN: fittraining.app + *.fittraining.app
                      2026-09-07 → 2027-03-24, renovación automática de Amplify
```

**El CNAME flattening dejó de ser una suposición:** preguntar por el ápice devuelve las IPs de
CloudFront y no un alias, con Cloudflare en modo solo DNS. Era el punto que este documento marcaba
como «verificarlo, no asumirlo».

Los tres registros que hubo que crear a mano en Cloudflare: el CNAME de validación de ACM
(`_1efa9ade…` → `…acm-validations.aws`), un CNAME en `@` y otro en `www`, los tres apuntando a la
distribución y los tres en **DNS only**. El «Nombre de host» que muestra Amplify trae el dominio
incluido y en Cloudflare va **solo la parte izquierda**.

### La redirección de `www` a la raíz funciona para las rutas y NO para la portada

Se probaron **dos** formas de la regla de la raíz en _Reescrituras y redirecciones_, y las dos
fallaron de manera distinta:

| `source` de la regla                       | Resultado medido                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| `https://www.fittraining.app` (sin barra)  | la portada de `www` responde **200**, la regla nunca matchea                    |
| `https://www.fittraining.app/` (con barra) | además **rompe** la regla de rutas: `/politica-de-privacidad` pasó de 301 a 404 |

**La configuración que funciona necesita las DOS reglas de `www`**, y esto es lo menos obvio de
toda esta sección:

```json
[
  {
    "source": "https://www.fittraining.app",
    "target": "https://fittraining.app",
    "status": "301"
  },
  {
    "source": "https://www.fittraining.app/<*>",
    "target": "https://fittraining.app/<*>",
    "status": "301"
  },
  { "source": "/<*>", "status": "404-200", "target": "/index.html" }
]
```

Tres configuraciones medidas el 2026-09-07, en este orden:

| Reglas de `www` presentes           | `/favicon.ico` por `www`              | `/politica-de-privacidad` por `www` |
| ----------------------------------- | ------------------------------------- | ----------------------------------- |
| sin barra **+** `/<*>`              | **301** al ápice                      | **301** al ápice                    |
| con barra final **+** `/<*>`        | —                                     | 404 (rompe la de rutas)             |
| **solo** `/<*>`                     | **200**, sirve el archivo desde `www` | 404                                 |
| sin barra **+** `/<*>` (restaurada) | **301** al ápice                      | **301** al ápice                    |

**LA PRIMERA REGLA PARECE NO HACER NADA Y ES LA QUE HABILITA A LA SEGUNDA.** Por sí sola nunca
redirige la portada —`https://www.fittraining.app` responde 200 con las cuatro configuraciones—, así
que a cualquiera que ordene esta lista le va a parecer basura y la va a borrar. Cuando la sacamos,
la redirección de rutas **dejó de funcionar en silencio**: sin ella, `/<*>` no matchea por host y el
sitio empieza a servirse por dos dominios sin que nada avise. No se toca.

### Cómo se prueba esto sin engañarse

**Un 404 no sirve como prueba.** Mientras no existan páginas reales, pedir
`www.fittraining.app/politica-de-privacidad` devuelve 404 tanto si la regla no se aplicó como si se
aplicó y el destino no existe — son dos causas distintas con el mismo síntoma, y por perseguir esa
ambigüedad se fueron varias vueltas.

**Se prueba contra una ruta que EXISTE**, y hoy la hay: `/favicon.ico`. Ahí sí, **301 significa que
la regla funciona y 200 significa que no**, sin interpretación posible.

**Se deja así a propósito, y la portada duplicada se resuelve desde el código.** `layout.tsx`
declara `metadataBase` + `alternates.canonical`, que emite un `<link rel="canonical">` con el origen
correcto en cada página — verificado en el HTML generado: `/` produce
`https://fittraining.app` y `/_not-found` produce `https://fittraining.app/_not-found`. Así, aunque
alguien llegue por `www`, el buscador sabe cuál es la URL buena.

Es una decisión de proporción: seguir probando sintaxis no documentada de una consola cuesta más que
el problema —una portada accesible por dos URLs en un sitio de prueba cerrada—, y la solución del
canonical **vive en el repo, entra por PR y la verifican los gates**, a diferencia de una regla que
solo existe en la consola de alguien.

**Lo que NO se hizo, y por qué:** invertir la canónica marcando el checkbox de Amplify (que redirige
la raíz hacia `www`) sí funcionaría de una, pero dejaría las URLs legales como
`www.fittraining.app/politica-de-privacidad` — más largas, con `www`, y escritas para siempre en
Play Console y dentro del texto legal.

### Pendiente antes de P0-02

Si en algún momento se activa la protección por contraseña del sitio mientras es un placeholder,
**hay que quitarla antes de publicar las páginas legales**: Google y Play tienen que poder leer la
política sin credenciales. Una protección que sobrevive a la publicación es un rechazo de revisión.

---

## 6. Por qué la web va en Amplify y no en la instancia de la API

Las páginas legales son estáticas **para que sobrevivan a que el backend se caiga**. Google abre
`fittraining.app/politica-de-privacidad` para aprobar la app en Play Store: si la web comparte
instancia con la API, comparte el apagón, y se reprueba una revisión por algo que no tiene nada que
ver con el documento. Separar dominios de falla es el punto.

Consecuencia práctica: **las cuatro páginas legales no llaman a un solo endpoint**, así que no
dependen de que la API esté desplegada. La única página pública que sí depende del backend es
`/eliminar-cuenta`, que se autentica y llama a `DELETE /auth/account`.

---

## 7. El riesgo que se acepta, y por qué tiene fecha de vencimiento

Amplify va detrás de las versiones de Next —hoy mismo, 15 contra 16—. Si un build falla, se está
depurando el hosting y no la aplicación, en el camino crítico de Play Store.

**Mitigación:** fijar la versión (§ 1) y verificar el despliegue con una página vacía **antes** de
escribir las seis páginas. Eso es lo que hace este repo en su primer commit.

**La salida de emergencia es Vercel, y cuesta caro tarde.** Sería un encargado del tratamiento nuevo
y una transferencia internacional más, o sea § 8 de la política de privacidad. Hoy es gratis porque
**los documentos legales todavía no están publicados**; una vez publicados cuesta una versión 1.2.0
y volver a pedirle la autorización a cada usuario. **Si hay dudas sobre Amplify, se resuelven antes
de publicar las legales, nunca después.**

---

## 8. Checklist de la verificación (W-02)

Lo que tiene que quedar comprobado antes de escribir la primera página real:

- [x] Amplify construye el repo con `next@15.5.25` y **pnpm vía corepack**
- [x] El sitio responde sobre `*.amplifyapp.com`
- [x] **El runtime es Node 22** — `v22.18.0`, confirmado en el build del 2026-09-06
- [x] El log de build no trae advertencias de versión no soportada
- [x] `pnpm run gates` pasa en local (typecheck, lint, format:check, build)

### Resultado del primer despliegue — 2026-09-05

`https://main.d2km5210mv8hal.amplifyapp.com` · build de **2 min 18 s** (1:57 compilar + 0:20
implementar) sobre el commit inicial de la rama `main`.

**Verificado desde fuera de la consola**, que es lo único que prueba que el sitio existe para un
tercero:

```
HTTP/2 200            <title>fittraining</title>
x-nextjs-prerender: 1 → se sirve prerenderizada, no rendereada por request
x-nextjs-cache: HIT
x-amz-cf-pop: BOG50   → CloudFront la sirve desde el edge de Bogotá
404                   → en una ruta inexistente
```

**El riesgo del § 7 era real y estaba activo el mismo día:** la última estable de Next es la 16, que
Amplify no soporta. Un `create-next-app` sin versión no habría construido, y el fallo habría
aparecido con seis páginas escritas en vez de con una.

**Lo que el log confirma** (`docs/evidencia/2026-09-05-build-01.txt`, 100 líneas):

| Línea del log                                        | Qué prueba                                      |
| ---------------------------------------------------- | ----------------------------------------------- |
| `Preparing pnpm@10.30.1 for immediate activation...` | corepack respetó el pin de `packageManager`     |
| `Lockfile is up to date, resolution step is skipped` | `--frozen-lockfile` encontró el lock commiteado |
| `+ next 15.5.25` · `▲ Next.js 15.5.25`               | la versión fijada es la que construyó           |
| `✓ Generating static pages (5/5)` · `○ (Static)`     | las páginas salen prerenderizadas               |

**Lo que ese primer log NO decía: la versión de Node.** No aparecía en ninguna de sus 100 líneas —ni
Amplify ni Next la imprimen— y `# No package override configuration found.` solo confirma que el
campo _Live package updates_ de la consola está vacío. O sea que el único ítem del checklist que
quedó abierto era el que más importa, **y no por falta de mirar: la evidencia no existía**.

**Cerrado en el build siguiente, el 2026-09-06:** el `preBuild` corre `node -v` desde entonces y la
respuesta fue **`v22.18.0`**. Node 22, que es lo que `.nvmrc` y `engines` piden y lo que la imagen
AL2023 trae por defecto.

Dos cosas que ese número deja claras y conviene no perder:

- **El entorno local y el de Amplify no son la misma versión exacta** — acá corre `v22.22.0` y allá
  `v22.18.0`. `engines: ">=22 <23"` acepta las dos a propósito: **un pin exacto habría convertido una
  diferencia irrelevante de minor en un build roto**, y lo que importa es el major, que es lo que
  determina el runtime de la función.
- **Sigue sin haber nada que _fuerce_ el 22.** Hoy coincide porque es el default de la imagen. Lo que
  cambió no es la garantía sino la visibilidad: el log lo dice en cada build, así que el día que
  Amplify mueva su default se ve en la primera línea en vez de descubrirse por un fallo raro en
  runtime. Si eso pasa, la corrección es `nvm use 22` en la misma fase.

### Tres avisos del log que son benignos, y por qué

Quedan escritos para que nadie los persiga creyéndolos fallas:

- `! Unable to write cache: ... status code 404` — **es de la _environment cache_, no de la caché de
  build.** Aparece pegado a `# Retrieving environment cache...`, que es otro mecanismo. **Corregido
  el 2026-09-06:** esta línea decía que si el aviso reaparecía en el segundo build era un problema
  real porque «los builds no estarían cacheando», y el segundo build lo refutó — el aviso reapareció
  **y** la caché de build funcionó (`# Retrieved cache`, y Next dejó de decir `No build cache
found`). Eran dos cachés distintas y esta nota las confundía.
- `!Failed to set up process.env.secrets` — no hay secretos en SSM para esta app y hoy no hacen
  falta. Va a reaparecer hasta que se configure alguno.
- `Ignored build scripts: unrs-resolver@1.12.2` — pnpm bloquea los postinstall por defecto. **Se
  deja bloqueado a propósito**: el lint y el chequeo de tipos que `next build` corre pasaron igual,
  así que el resolver nativo no hace falta, y ejecutar menos scripts de terceros en el build es
  preferible. Desbloquearlo sería `pnpm approve-builds`.

### La caché de `node_modules` costaba más de lo que ahorraba — medido y confirmado

`amplify.yml` **no cachea `node_modules`**, y es una decisión con cuatro builds de evidencia
(`docs/evidencia/`), no una omisión:

| Build | Configuración                        | Total      | Restaurar caché | Resto  |
| ----- | ------------------------------------ | ---------- | --------------- | ------ |
| 1     | sin caché (primera vez)              | 40,7 s     | 0,0 s           | 40,6 s |
| 2     | caché **con** `node_modules`         | 70,0 s     | 29,1 s          | 40,9 s |
| 3     | `cache.paths` cambiado en este build | 74,0 s     | 30,4 s          | 43,5 s |
| 4     | caché ya **sin** `node_modules`      | **46,5 s** | **0,8 s**       | 45,7 s |

**La columna «resto» se queda en una banda de 41–46 s en los cuatro.** Toda la diferencia de tiempo
era la restauración de la caché y nada más: instalar los 322 paquetes en frío desde el registry
tarda 5,4 s, y descargar y extraer el artefacto que evita ese trabajo tardaba 29–30 s. Con un
proyecto de este tamaño y desde dentro de AWS, la red al registry es más rápida que la caché.

`.next/cache` **sí se queda, y sirve**: en el build 4 se restaura en 0,8 s, Next no dice
`No build cache found` y la compilación bajó a 3,9 s (contra 4,5 s en frío). El día que el proyecto
tenga muchas más dependencias, esto se vuelve a medir con la misma tabla — no se decide de memoria.

### Un cambio en `cache.paths` tarda DOS builds en verse

Al sacar `node_modules` se predijo que el **build 3** volvería a ~41 s. **Dio 74 s**, y el error
enseñó más que el ahorro. El log lo explica en los dos extremos del mismo build:

- **Guardar la caché pasó de 23,7 s a 0,7 s.** El cambio SÍ había tomado efecto: el artefacto que
  escribió el build 3 ya no llevaba `node_modules`.
- **Restaurarla siguió costando 30,4 s**, porque lo que un build restaura es el artefacto que
  **guardó el build anterior** — y el del build 2 todavía lo tenía adentro.

**`cache.paths` afecta el guardado de este build y la restauración del siguiente**, así que el
efecto sobre el tiempo total nunca se ve en el build donde se cambia. El build 4 lo confirmó
midiendo lo predicho (~45 s contra 46,5 s reales). Quien vuelva a tocar la caché tiene que esperar
**dos** builds antes de sacar conclusiones; con uno solo, la medición dice lo contrario de la
verdad.

### Lo que el build de Amplify SÍ verifica, y lo que no

`next build` corre `Linting and checking validity of types` por su cuenta, así que un error de tipos
o de ESLint **rompe el despliegue**. Lo que Amplify **no** corre es `format:check`: un archivo mal
formateado despliega igual.

**Esa mitad la cubre CI desde el 2026-09-07.** `.github/workflows/gates.yml` corre los cuatro gates
—`typecheck`, `lint`, `format:check`, `build`— sobre cada PR a `main` y cada push a `develop`, con
la versión de pnpm leída de `packageManager` y la de Node de `.nvmrc`, las mismas fuentes que usa
`amplify.yml`. Con eso **W-05 queda completo**.

## 9. El flujo de ramas

`main` es la rama que Amplify construye y despliega. **`develop` es donde se trabaja.**

```
develop  ──(commits del día a día)──▶  PR  ──▶  main  ──▶  despliegue
```

Tres consecuencias, y la primera es la razón de existir del arreglo:

- **Un push ya no despliega.** El despliegue pasa a ser un acto deliberado —mergear un PR— en vez
  de un efecto secundario de guardar. También baja los minutos de build, que es lo único que este
  proyecto le paga a Amplify.
- **El PR es donde corren los gates.** Sin PR, `format:check` no lo corre nadie.
- **`develop` NO se conecta en Amplify.** Conectarla crearía una segunda URL y duplicaría los
  builds, a cambio de nada: para ver un cambio antes de desplegarlo está `pnpm run dev`.

---

## Fuentes

- [Amplify support for Next.js](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html)
  — versiones soportadas y lista de features no soportadas
- [Node.js version support for Next.js apps](https://docs.aws.amazon.com/amplify/latest/userguide/node-version-support-ssr.html)
  — runtimes 20/22/24 y default de la imagen AL2023
- [vercel/next.js — releases](https://github.com/vercel/next.js/releases)
  — 15.5.25 y 16.3.4, ambas del 2026-08-31
- `fittraining-api`: `docs/despliegue/plan-de-despliegue.md` (§ 1 dominio, § 4 web) y
  `docs/web/definicion-web.md` (§ 1 stack, § 5 riesgos, § 6 gates)
