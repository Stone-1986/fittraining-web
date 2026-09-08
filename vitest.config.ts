import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Configuracion de la suite unitaria.
 *
 * ENTORNO `jsdom` PARA TODO, aunque hoy los unicos tests sean de funciones
 * puras: el dia que el QA escriba el primer test de componente no tiene que
 * tocar esta configuracion, y correr una funcion pura bajo jsdom no cuesta
 * nada medible en una suite de este tamano.
 *
 * COBERTURA MEDIDA POR ARCHIVO (`perFile: true`), no sobre el promedio. Es la
 * leccion mas cara del repo de la API: con el promedio, un archivo en 0% pasa
 * escondido detras de los demas, y asi sobrevivio dos epicas un interceptor
 * con un bug que envolvia TODAS las respuestas. Con `perFile`, un archivo sin
 * tests hace fallar el gate por si solo y el error lo nombra.
 *
 * POR QUE `include` SOLO CUBRE `src/lib/`: es donde vive la logica que se
 * puede probar barato y donde un fallo es silencioso. Los componentes son
 * hoy presentacion sin ramas —renderizan props— y exigirles 80% produciria
 * tests que solo confirman que React funciona. Cuando el panel traiga
 * formularios y estado, `include` crece y el umbral llega con ellos. Un gate
 * que obliga a escribir tests vacios se acaba desactivando; este no.
 */
export default defineConfig({
  // JSX sin `@vitejs/plugin-react`: ese plugin exige Vite 8 y Vitest 5 trae
  // Vite 7, asi que instalarlo dejaba un peer roto. Para una suite de tests no
  // aporta nada que esto no cubra —su valor real es el Fast Refresh del
  // servidor de desarrollo, que aqui no existe—, y una dependencia menos es
  // una incompatibilidad menos que arrastrar.
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // `eslint-rules/` entra en el `include` a proposito, y es la unica cosa
    // fuera de `src/` que la suite corre: ahi vive el sexto gate —la regla de
    // ESLint que comprueba el sistema de diseno— y una regla de lint sin
    // tests es un gate que nadie ha probado que atrape nada.
    //
    // NO entra en `coverage.include`, que sigue siendo solo `src/lib/`: el
    // umbral del 80% esta pensado para la logica de la app, y arrastrar una
    // herramienta de build a esa medicion mezcla dos cosas distintas.
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'eslint-rules/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}'],
      thresholds: {
        // `perFile` vive DENTRO de `thresholds`, no al lado: fuera, TypeScript
        // lo rechaza y —lo importante— la medicion volveria al promedio.
        perFile: true,
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 75,
      },
    },
  },
});
