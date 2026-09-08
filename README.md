# fittraining-web

Web pública y panel del entrenador de **fittraining**. Next.js 15 (App Router) + React 19 +
TypeScript + Tailwind, desplegado en **AWS Amplify Hosting**.

La API vive en un repo aparte (`fitmess-api`, en `../fitmess-api`) y este repo la consume por
HTTP; nunca por ruta relativa entre repos.

## Comandos

```bash
pnpm install
pnpm run dev           # servidor de desarrollo
pnpm run gates         # LOS CINCO GATES (lo mismo que exige CI) -> outputs/gates.json
pnpm run gates:check   # ¿gates.json está fresco y en verde? (no corre nada)
pnpm run typecheck     # tsc --noEmit
pnpm run lint          # ESLint
pnpm run format        # Prettier --write
pnpm run test          # Vitest
pnpm run test:cov      # Vitest con cobertura
pnpm run build         # next build
```

## Trabajar en este repo con Claude Code

`CLAUDE.md` y `.claude/` traen el montaje del proyecto: tres subagentes en
cadena (`implementador` → `qa` → `lider-tecnico`), las reglas absolutas en
`.claude/rules/rulesFrontend.md`, y tres skills — `/planificar`,
`/implementar` y `/commit`.

## Sistema de diseño

Los colores, la tipografía, los radios y las convenciones de código están en
**`docs/sistema-de-diseno.md`**, y se pueden ver funcionando en **`/estilo`**
(`pnpm run dev` → http://localhost:3000/estilo).

La regla corta, que resume el resto: **ningún archivo escribe un color.** Todo
sale de los tokens de `src/app/globals.css`, y los componentes nombran roles
(`bg-primary`) en lugar de colores (`bg-green-700`).

## Antes de tocar versiones

**`next` y `eslint-config-next` están pinneados a `15.5.25` a propósito: Amplify no soporta
Next 16.** Leer `docs/despliegue-amplify.md` antes de subir cualquiera de las dos, y antes de
usar streaming, Edge middleware o ISR on-demand — que Amplify tampoco soporta.

## Ramas

`main` es lo que Amplify despliega; **el trabajo va en `develop`** y llega a `main` por PR. Un push
a `develop` no despliega: corre los gates en CI. El despliegue ocurre al mergear el PR.

## Estado

Fase 1 — las seis páginas públicas. Hoy solo está la página de verificación del despliegue (W-02).
El inventario de trabajo (`backlog-web.md`) y las definiciones todavía viven en el repo de la API,
en `docs/web/`, y se mudan acá cuando este repo esté desplegado.
