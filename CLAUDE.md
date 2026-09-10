# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## Qué es esto

**fittraining-web** es la web pública y el futuro panel del entrenador de
fittraining. Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4,
desplegado en **AWS Amplify Hosting**.

La API vive en un repo aparte (`fitmess-api`, en `../fitmess-api`) y este repo
la consume **por HTTP**, nunca por ruta relativa entre repos.

El idioma del producto es **español** y **tutea** al usuario. Los cinco
documentos legales son la excepción: están publicados en «usted» y se quedan
así.

---

## Reglas del proyecto

Reglas absolutas que aplican en toda sesión. **Leer antes de cualquier trabajo
de implementación:**

- [**Rules — Frontend**](.claude/rules/rulesFrontend.md) — tokens, frontera
  servidor/cliente, ubicación de archivos, la puerta de la API, idioma y tono,
  imagen, movimiento, accesibilidad, testing, gates, orquestación y git

El _porqué_ de las reglas de diseño, con ejemplos y contraste medido, está en
[`docs/sistema-de-diseno.md`](docs/sistema-de-diseno.md).

Si los dos documentos se contradicen, manda `rulesFrontend.md`.

### El sistema de diseño tiene tres fuentes, y no dicen lo mismo

| Fuente                          | Qué es                               | Manda en              |
| ------------------------------- | ------------------------------------ | --------------------- |
| `docs/sistema_diseño/*.dc.html` | El canvas. La intención visual       | Qué debe verse        |
| `src/app/globals.css`           | Los tokens. La traducción a código   | Qué se puede escribir |
| `/estilo`                       | La guía viva. El sistema funcionando | La verificación       |

El canvas es una **maqueta**: un HTML suelto con hexadecimales incrustados y
las fuentes enlazadas desde Google. Nadie copia un valor del canvas a un
componente — se copia al token, y el componente pide el token.

Hay **tres sitios donde `globals.css` se aparta del canvas a propósito**,
porque el canvas incumplía WCAG (el borde de los campos, el gris de los
metadatos y el alto del botón chico). Están explicadas en
`rulesFrontend.md § Accesibilidad` y la corrección manda sobre la maqueta.

---

## Comandos

```bash
pnpm install
pnpm run dev            # servidor de desarrollo → localhost:3000
pnpm run gates          # LOS CINCO GATES → outputs/gates.json (única fuente de números)
pnpm run gates:check    # ¿gates.json está fresco y en verde? (no corre nada)
pnpm run screenshot     # abre la web en Chromium y captura / a 320, 390 y 1440
                        # → outputs/capturas/. Acepta rutas y --anchos=,--alto=
                        # Es el verificador de los criterios `[navegador]`

pnpm run typecheck      # tsc --noEmit — el ciclo corto mientras se trabaja
pnpm run lint           # ESLint (sin --fix; es el gate). Incluye la regla
                        # del sistema de diseño: eslint-rules/design-system.mjs
pnpm run format         # Prettier --write
pnpm run format:check   # Prettier --check (es el gate)
pnpm run build          # next build
pnpm run test           # Vitest, una pasada
pnpm run test:watch     # Vitest en watch
pnpm run test:cov       # Vitest con cobertura (es el gate)
pnpm run test <patron>  # Un archivo suelto: filtro POSICIONAL de Vitest.
                        # NUNCA --testPathPattern: es de Jest, Vitest lo
                        # ignora en silencio y corre la suite entera
```

**`pnpm run gates` es lo que hay que correr antes de dar algo por terminado.**
Escribe `outputs/gates.json`, que es la única fuente de números del proceso:
ningún agente transcribe un porcentaje a un reporte, lo referencia por su
`timestamp`.

---

## Arquitectura

```
docs/
  sistema_diseño/          ← EL CANVAS: el sistema y la landing, como maqueta
  sistema-de-diseno.md     ← el porqué de las reglas
src/
  app/
    globals.css            ← EL sistema de diseño en código. Único sitio con
                             colores, y también con la escala tipográfica,
                             los radios, el tracking y el movimiento
    layout.tsx             ← next/font, metadata canónica
    page.tsx               ← portada (todavía de verificación; la landing es W-10)
    estilo/page.tsx        ← guía viva del sistema (no indexada)
    (legal)/               ← los cinco documentos legales, cero JS de cliente
  components/
    ui/                    ← primitivos: Button, Card, Container
    legal-shell.tsx        ← marco de las páginas legales
  content/legal/           ← el markdown de los documentos. NUNCA se borra una versión
  lib/
    legal.ts               ← catálogo y render de los documentos
    api/                   ← (futuro) la única puerta a fitmess-api
scripts/
  gates.mjs                ← corre los gates y escribe outputs/gates.json
  screenshot.mjs           ← levanta el build y captura la pantalla de verdad
eslint-rules/
  design-system.mjs        ← la regla que hace de `lint` el guardián del
                             sistema de diseño (colores, escalas, radios)
```

- **Estilos:** Tailwind v4 con tokens en `@theme`. Dos excepciones, ambas
  justificadas en las reglas: `legal-shell.module.css` y las cuatro clases
  globales de `globals.css` (`.scrim-side`, `.scrim-bottom`, `.photo-slot`,
  `.grid-cards`)
- **Fondo oscuro siempre.** No hay modo claro, así que un `dark:` en un
  componente es un error, no una duda
- **Tipografía:** Archivo (display) + Barlow (texto), auto-hospedadas con
  `next/font`
- **Componentes de servidor por defecto.** `'use client'` va en la hoja del
  árbol, nunca en una página
- **Sin gestor de estado.** URL + Server Components + `useState`
- **El sistema de diseño lo comprueba `lint`.** Un color literal, la paleta de
  fábrica de Tailwind, un `text-[21px]`, un `dark:` o una sombra son **error**,
  no advertencia. Se cae el build y se cae la CI

---

## Agentes y flujo de trabajo

Tres subagentes en `.claude/agents/`, en cadena secuencial:

| Agente          | Hace                                            | Herramientas                       |
| --------------- | ----------------------------------------------- | ---------------------------------- |
| `implementador` | Escribe el código contra el plan                | Read, Write, Edit, Bash            |
| `qa`            | Escribe tests, valida cobertura y accesibilidad | Read, Write, Edit, Bash            |
| `lider-tecnico` | Revisa contra las reglas y decide               | Read, Write (**sin Bash ni Edit**) |

Que el Líder Técnico no tenga `Edit` ni `Bash` es deliberado: un revisor que
puede arreglar, arregla en vez de enseñar, y la corrección no queda escrita en
ninguna instrucción.

### Skills

| Skill          | Cuándo                                                                                |
| -------------- | ------------------------------------------------------------------------------------- |
| `/planificar`  | Fase 1 — convierte un ítem (W-XX) en `outputs/plan.md`. **Para en checkpoint humano** |
| `/implementar` | Fase 2 — orquesta la cadena sobre un plan aprobado. Máximo 3 ciclos                   |
| `/commit`      | Commits estandarizados. La **única** excepción a «git lo opera el humano»             |

Para un cambio de una línea, **no** uses el flujo de agentes: cuesta más que
hacerlo.

### Hooks

`.claude/settings.json` registra tres:

- `PostToolUse` (Write\|Edit) → **`format-on-write.sh`**: formatea con Prettier
  lo que se acaba de escribir. `format:check` es un gate, y un error de formato
  costaría una vuelta entera de la cadena por algo que no es un defecto
- `SubagentStart` → **`subagent-start.sh`**: marca la hora de arranque
- `SubagentStop` → **`subagent-stop.sh`**: el `implementador` no puede terminar
  si `pnpm run gates:check` falla; el `qa` y el `lider-tecnico` no pueden
  terminar si su artefacto no es más nuevo que su arranque

**Los hooks se cargan al iniciar la sesión.** Tras editar `settings.json`,
reiniciar o revisarlos con `/hooks`.

---

## El principio que sostiene todo lo demás

> **Un gate que no corre es indistinguible de uno que pasa.**
> Un artefacto que no se escribió es indistinguible de uno que sí.

Por eso ningún agente reporta trabajo completo sin confirmarlo **contra el
disco**, y por eso esa regla es un hook y no un párrafo: en el repo de la API
la misma regla estaba escrita en prosa y aun así nueve agentes reportaron
trabajo que no habían hecho. Ninguno se detectó por sus reportes.

---

## Antes de tocar versiones

**`next` y `eslint-config-next` están pinneados a `15.5.25` a propósito:
Amplify no soporta Next 16.** Leer `docs/despliegue-amplify.md` antes de subir
cualquiera de las dos, y antes de usar streaming, Edge middleware o ISR
on-demand — que Amplify tampoco soporta.

## Ramas

`main` es lo que Amplify despliega. **El trabajo va en `develop`** y llega a
`main` por PR. Un push a `develop` no despliega: corre los gates en CI. El
despliegue ocurre al mergear el PR.
