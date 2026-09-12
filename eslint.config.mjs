import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import { designSystem } from './eslint-rules/design-system.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Desactiva las reglas de ESLint que chocan con Prettier. Va ULTIMO: si no,
  // las reglas de formato de next/typescript lo pisan y `lint` y `format:check`
  // se contradicen entre si.
  ...compat.extends('prettier'),

  // --- EL SEXTO GATE: el sistema de diseño -------------------------------
  //
  // Hasta aqui, los cinco gates pasaban con un hexadecimal escrito a mano
  // dentro de un componente: la regla 1 era la unica que dependia de que una
  // persona la mirase. Esto la convierte en un error de `pnpm run lint`, y
  // por tanto en algo que rompe el build y la CI.
  //
  // Solo sobre `src/`: es donde vive la interfaz. La configuracion, los
  // scripts y este mismo archivo no pintan nada.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'design-system': designSystem },
    rules: { 'design-system/no-untokenized-style': 'error' },
  },

  // Los tests SI pueden nombrar un color, y hace falta que puedan: el de
  // `design-tokens` comprueba que `--primary` sigue valiendo `#28e0c8`, que
  // es justamente la garantia de que la guia viva no miente. Prohibirselo
  // obligaria a escribir el test sin poder decir contra que compara.
  //
  // No debilita el gate: un test no se renderiza. Lo que la regla protege es
  // lo que llega al navegador.
  {
    files: ['src/**/*.test.{ts,tsx}'],
    rules: { 'design-system/no-untokenized-style': 'off' },
  },

  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      // `/design-sync`: el empaquetado para Claude Design. No es la app —las
      // previews importan de un paquete `fittraining` que solo existe en
      // `.design-sync/.cache/`— y los otros dos directorios son el
      // convertidor y su salida, regenerados en cada sync.
      '.design-sync/**',
      '.ds-sync/**',
      'ds-bundle/**',
    ],
  },
];

export default eslintConfig;
