#!/usr/bin/env node
/**
 * EMPAQUETA LOS COMPONENTES COMO SI FUERAN UNA LIBRERIA PUBLICADA.
 *
 * `/design-sync` convierte un paquete —su `dist/`, sus `.d.ts`, su CSS— al
 * formato de Claude Design. Este repo es una app de Next y no publica ningun
 * paquete, asi que este script lo fabrica, con las mismas herramientas de la
 * app y sin tocar `src/`:
 *
 *   index.js     esbuild sobre `entry.ts`. React queda fuera (lo pone el
 *                convertidor) y `next/link` y `next/image` se sustituyen por
 *                los adaptadores de `shims/`, porque fuera de Next no hay
 *                router ni optimizador de imagen.
 *   types/       `tsc --emitDeclarationOnly` sobre los mismos archivos. Son el
 *                contrato de props que lee el agente de Claude Design.
 *   styles.css   `tailwind.css` compilado por el Tailwind de la app, mas las
 *                fuentes que `next/font` auto-hospeda.
 *   fonts/       los .woff2 que `next build` descarga de Google. Se toman de
 *                `.next/`, asi que ES OBLIGATORIO correr `pnpm run build`
 *                antes: sin build no hay fuentes, y todo diseno saldria en
 *                la tipografia de reserva sin que nada avisara.
 *
 * Todo sale a `.design-sync/.cache/pkg/`, que esta en .gitignore.
 *
 * Uso: pnpm run build && node .design-sync/build-pkg.mjs
 */
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';

const HERE = import.meta.dirname;
const ROOT = resolve(HERE, '..');
const OUT = join(HERE, '.cache', 'pkg');
const NEXT_CSS = join(ROOT, '.next', 'static', 'css');

function fail(msg) {
  console.error(`build-pkg: ${msg}`);
  process.exit(1);
}

if (!existsSync(NEXT_CSS)) {
  fail(
    'no existe .next/static/css — corre `pnpm run build` antes (de ahi salen las fuentes)',
  );
}
const esbuildPkg = join(ROOT, '.ds-sync', 'package.json');
if (!existsSync(esbuildPkg)) {
  fail(
    'no existe .ds-sync/ — copia los scripts de /design-sync e instala sus dependencias',
  );
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'fonts'), { recursive: true });

// --- 1. index.js -----------------------------------------------------------
const { build } = createRequire(esbuildPkg)('esbuild');
await build({
  entryPoints: [join(HERE, 'entry.ts')],
  outfile: join(OUT, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  // El tsconfig de la app dice `jsx: preserve` porque compila Next; aqui hay
  // que emitir JS de verdad.
  jsx: 'automatic',
  tsconfig: join(ROOT, 'tsconfig.json'),
  external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
  alias: {
    'next/link': join(HERE, 'shims', 'next-link.tsx'),
    'next/image': join(HERE, 'shims', 'next-image.tsx'),
  },
  logLevel: 'warning',
});

// --- 2. types/ -------------------------------------------------------------
// Los archivos a declarar son los que nombra `entry.ts`; tsc sigue sus
// imports y declara tambien lo que ellos usan (`src/lib/landing-content`...).
const entrySrc = readFileSync(join(HERE, 'entry.ts'), 'utf8');
const specifiers = [
  ...new Set([...entrySrc.matchAll(/from '@\/([^']+)'/g)].map((m) => m[1])),
];
const files = specifiers.map((s) => {
  const hit = ['.tsx', '.ts']
    .map((ext) => join(ROOT, 'src', s + ext))
    .find(existsSync);
  if (!hit) fail(`entry.ts nombra @/${s} y no existe en src/`);
  return hit;
});

const tsconfigDts = join(HERE, '.cache', 'tsconfig.dts.json');
writeFileSync(
  tsconfigDts,
  JSON.stringify(
    {
      extends: relative(dirname(tsconfigDts), join(ROOT, 'tsconfig.json')),
      compilerOptions: {
        noEmit: false,
        declaration: true,
        emitDeclarationOnly: true,
        incremental: false,
        rootDir: relative(dirname(tsconfigDts), join(ROOT, 'src')),
        outDir: relative(dirname(tsconfigDts), join(OUT, 'types')),
        plugins: [],
      },
      include: [],
      files: files.map((f) => relative(dirname(tsconfigDts), f)),
    },
    null,
    2,
  ),
);
try {
  execFileSync(join(ROOT, 'node_modules', '.bin', 'tsc'), ['-p', tsconfigDts], {
    cwd: ROOT,
    stdio: 'inherit',
  });
} catch {
  fail('tsc no pudo emitir las declaraciones');
}

// Los .d.ts salen con los alias `@/` de la app, que fuera del tsconfig no
// resuelven: se reescriben a rutas relativas dentro de types/.
const typesDir = join(OUT, 'types');
function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
for (const f of walk(typesDir).filter((p) => p.endsWith('.d.ts'))) {
  const src = readFileSync(f, 'utf8');
  const out = src.replace(/(['"])@\/([^'"]+)\1/g, (_, q, spec) => {
    let rel = relative(dirname(f), join(typesDir, spec));
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return `${q}${rel}${q}`;
  });
  if (out !== src) writeFileSync(f, out);
}
// El indice de tipos es `entry.ts` con los mismos alias reescritos.
writeFileSync(
  join(typesDir, 'index.d.ts'),
  entrySrc.replace(/'@\/([^']+)'/g, "'./$1'"),
);

// --- 3. fonts/ -------------------------------------------------------------
// `next/font` escribe los @font-face con familias limpias («Archivo»,
// «Barlow») y expone `--font-archivo` / `--font-barlow` en una clase
// `.__variable_*` que `layout.tsx` pone en <html>. Fuera de Next no hay
// <html> con esa clase, asi que las variables pasan a `:root`.
const fontFaces = [];
const fontVars = [];
for (const name of readdirSync(NEXT_CSS).filter((n) => n.endsWith('.css'))) {
  const css = readFileSync(join(NEXT_CSS, name), 'utf8');
  for (const [rule] of css.matchAll(/@font-face\{[^}]*\}/g)) {
    fontFaces.push(
      rule.replace(/url\(\/_next\/static\/media\/([^)]+)\)/g, (_, file) => {
        copyFileSync(
          join(ROOT, '.next', 'static', 'media', file),
          join(OUT, 'fonts', file),
        );
        return `url(./fonts/${file})`;
      }),
    );
  }
  for (const [, decl] of css.matchAll(
    /\.__variable_[a-z0-9]+\{(--font-[a-z]+:[^}]+)\}/g,
  )) {
    fontVars.push(`${decl};`);
  }
}
if (!fontFaces.length || fontVars.length < 2) {
  fail(
    'no encontre las fuentes de next/font en .next/static/css — ¿el build esta al dia?',
  );
}

// --- 4. styles.css ---------------------------------------------------------
// Tailwind se carga desde la dependencia de la app (`@tailwindcss/postcss`),
// y postcss desde la suya: pnpm no lo expone en la raiz.
const requireApp = createRequire(join(ROOT, 'package.json'));
const tailwind = requireApp('@tailwindcss/postcss');
const postcss = createRequire(requireApp.resolve('@tailwindcss/postcss'))(
  'postcss',
);
const emptyBase = join(HERE, '.cache', 'tw-base');
mkdirSync(emptyBase, { recursive: true });
const twEntry = join(HERE, 'tailwind.css');
const { css } = await postcss([
  tailwind({ base: emptyBase, optimize: false }),
]).process(readFileSync(twEntry, 'utf8'), { from: twEntry });
writeFileSync(
  join(OUT, 'styles.css'),
  [
    '/* fittraining — generado por .design-sync/build-pkg.mjs. No editar. */',
    ...fontFaces,
    `:root{${fontVars.join('')}}`,
    css,
  ].join('\n'),
);

// --- 5. package.json -------------------------------------------------------
const appPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
writeFileSync(
  join(OUT, 'package.json'),
  JSON.stringify(
    {
      name: 'fittraining',
      version: appPkg.version,
      private: true,
      module: 'index.js',
      types: 'types/index.d.ts',
      style: 'styles.css',
    },
    null,
    2,
  ),
);

const kb = (p) => `${(statSync(p).size / 1024).toFixed(0)} KB`;
console.error(
  `build-pkg: ${relative(ROOT, OUT)} — index.js ${kb(join(OUT, 'index.js'))}, ` +
    `styles.css ${kb(join(OUT, 'styles.css'))}, ${fontFaces.length} @font-face, ` +
    `${specifiers.length} modulos declarados`,
);
