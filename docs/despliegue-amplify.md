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

- [ ] Amplify construye el repo con `next@15.5.25` y **pnpm vía corepack**
- [ ] El sitio responde sobre `*.amplifyapp.com`
- [ ] El runtime de la función es Node 22 (lo elige el major del build — § 2)
- [ ] El log de build no trae advertencias de versión no soportada
- [ ] `pnpm run gates` pasa en local (typecheck, lint, format:check, build)

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
