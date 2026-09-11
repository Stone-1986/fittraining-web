# /design-sync — notas de fittraining-web

Proyecto de Claude Design: `fittraining` (`projectId` en `config.json`).
Forma `package`: no hay Storybook.

## Cómo está montado, y por qué

- **Este repo es una app de Next, no una librería.** No hay `dist/` que
  convertir, así que `build-pkg.mjs` fabrica uno en `.design-sync/.cache/pkg/`
  (gitignored): `index.js` (esbuild sobre `entry.ts`), `types/` (tsc
  `--emitDeclarationOnly`, con los alias `@/` reescritos a rutas relativas),
  `styles.css` (Tailwind de la app sobre `tailwind.css`) y `fonts/`.
- **Orden obligatorio:** `pnpm run build` ANTES de `build-pkg.mjs`. Las fuentes
  (Archivo y Barlow) salen de `.next/static/css` y `.next/static/media`: son
  los woff2 que `next/font` auto-hospeda. Sin build, el script falla a
  propósito. `buildCmd` ya encadena los dos.
- `build-pkg.mjs` carga esbuild desde `.ds-sync/node_modules`: primero se
  copian los scripts del skill a `.ds-sync/` y se instalan sus dependencias.
- **Qué entra lo decide `entry.ts`.** Fuera: `LegalShell` (lee `src/lib/legal.ts`,
  que usa `node:fs`).
- **`next/link` y `next/image` van por adaptadores** (`shims/`), vía alias de
  esbuild. Fuera de Next no hay router ni `/_next/image`. El de imagen esconde
  la foto si falla, así que queda el rayado de `.photo-slot`.
- **Tailwind solo emite lo que ve escrito.** `tailwind.css` escanea
  `src/components` y `previews/`, más un vocabulario cerrado (`@source inline`)
  para el JSX que escribe el agente. `base` apunta a un directorio vacío para
  que no escanee el resto del repo. **Si `conventions.md` nombra una clase,
  esa clase tiene que estar en ese vocabulario**: compruébalo con un grep
  sobre `ds-bundle/_ds_bundle.css`.
- **La tarjeta de preview fuerza `body{background:#fff}`.** Por eso cada
  preview lleva su propio `bg-background`, escrito dentro del ejemplo y no en
  un helper: el `.prompt.md` copia el JSX literal y el agente lo reutiliza.
- `dtsPropsFor` en `config.json` para `Button` (el extractor tiraba
  `disabled`/`onClick`/`type`, que vienen de los atributos nativos),
  `SiteFooter` (su tipo `LegalDocument` no viaja) y `PhotoSlot` (tipos de
  imagen de Next).
- `.design-sync/` está excluido de `tsconfig.json` y de ESLint (las previews
  importan `fittraining`, un paquete que solo existe en la caché). Prettier sí
  lo formatea.
- Playwright para el render check: la versión es la que pinea el Chromium de
  `~/.cache/ms-playwright/`. Hoy `chromium-1243` → `playwright@1.63.0`,
  instalado en `.ds-sync/` con `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`.

## Hallazgos sobre el sistema (no arreglados aquí)

- **`CardTitle` no se puede agrandar con `className`.** Concatena
  `text-h4 ${className}`, y en la hoja compilada (la de la app también)
  `.text-h4` va después de `.text-h2`, `.text-h3`, `.text-display` y
  `.text-body`, así que gana. Hacia abajo (`text-lead`, `text-ui`,
  `text-label`) sí funciona. El comentario del componente enseña
  `className="text-h4"`, que funciona solo porque es el valor por defecto.
  `conventions.md` se lo advierte al agente.

## Render warns conocidos

- Ninguno abierto. `SectionHeading` daba `[GRID_OVERFLOW]` (el h2 de 52px es
  más ancho que una celda); se resolvió con `cardMode: column`.

## Riesgos de un re-sync

- **La lista de documentos de `previews/SiteFooter.tsx` es una copia** de
  `LEGAL_DOCUMENTS` (`src/lib/legal.ts`). Si se publica un documento o cambia
  una versión, actualízala a mano.
- **Las fotos no viajan.** Las secciones de la landing apuntan a `/fotos/…`;
  en Claude Design se ve el rayado. Si algún día se quieren, hay que decidir
  cómo alojarlas: hoy el adaptador de imagen solo hace que el fallo sea limpio.
- **El vocabulario de `tailwind.css` es una lista a mano.** Un token nuevo en
  `globals.css` no llega a los diseños hasta que se añade ahí.
- **`build-pkg.mjs` depende del formato de `next/font`** en `.next/static/css`
  (`@font-face` con `/_next/static/media/...` y `.__variable_*{--font-*}`).
  Si una versión de Next lo cambia, el script falla con un mensaje claro en
  vez de mandar diseños sin fuente.
- `dtsPropsFor` es texto a mano: si cambian las props de `Button`, `SiteFooter`
  o `PhotoSlot`, actualízalo o el agente verá el contrato viejo.
