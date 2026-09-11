#!/usr/bin/env node
/**
 * Abre la web en un navegador de verdad y guarda una captura por ancho.
 *
 * POR QUE EXISTE. Los cinco gates no ven una pantalla. Durante W-10 la foto
 * del heroe estuvo semanas sin dibujarse —`PhotoSlot` traia `relative`, la
 * pantalla le pasaba `absolute inset-0`, ganaba `relative` y el hueco quedaba
 * con alto cero— y los cinco gates estaban en verde todo ese tiempo: no habia
 * nada roto en el HTML, ni en los tipos, ni en los tests. Aparecio en el
 * primer minuto de tener un navegador utilizable.
 *
 * Por eso los criterios de aceptacion marcados `[navegador]` se comprueban
 * con esto y no razonando. Un criterio verificado «por analisis» es un
 * criterio sin verificar; solo que suena mejor.
 *
 *   pnpm run screenshot                      # `/` a 320, 390 y 1440
 *   pnpm run screenshot /estilo /legal       # varias rutas
 *   pnpm run screenshot / --anchos=390,1900  # otros anchos
 *   pnpm run screenshot / --alto=5200        # pagina entera, no solo el pliegue
 *
 * NO INSTALA NADA. Usa el Chromium que Playwright ya dejo en la cache del
 * sistema; si no esta, dice como conseguirlo y se va con codigo 1.
 *
 * ESCRIBE EN `outputs/capturas/`, que esta gitignored: una captura es
 * evidencia de un momento, no del repositorio. Cada corrida sobreescribe.
 */
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'outputs', 'capturas');

/** Los tres anchos que decide el sistema, y el porque de cada uno. */
const DEFAULT_WIDTHS = [
  320, // el telefono mas estrecho que se sigue usando; donde desborda primero
  390, // el telefono real de la mayoria
  1440, // el escritorio con el que se dibujo el canvas
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * El binario de Chromium, o `null`.
 *
 * Se busca en la cache de Playwright porque es la que ya existe en este
 * entorno. `CHROME_PATH` permite apuntar a otro sin tocar el script.
 */
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(cache)) return null;
  for (const dir of readdirSync(cache).sort().reverse()) {
    for (const candidate of [
      join(cache, dir, 'chrome-linux64', 'chrome'),
      join(cache, dir, 'chrome-linux', 'chrome'),
      join(cache, dir, 'chrome-linux', 'headless_shell'),
    ]) {
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

/** Un puerto libre de verdad: lo dice el sistema operativo, no una suposicion. */
function freePort() {
  return new Promise((ok, err) => {
    const srv = createServer();
    srv.on('error', err);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => ok(port));
    });
  });
}

async function waitUntilUp(url, ms = 60_000) {
  const limit = Date.now() + ms;
  while (Date.now() < limit) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // todavia no escucha
    }
    await sleep(300);
  }
  return false;
}

function die(msg) {
  console.error(`screenshot: ${msg}`);
  process.exit(1);
}

/** `/legal/terminos` → `legal-terminos`; `/` → `portada`. */
function slug(route) {
  const s = route.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-');
  return s || 'portada';
}

const args = process.argv.slice(2);
const routes = args.filter((a) => !a.startsWith('--'));
const widths = (
  args.find((a) => a.startsWith('--anchos='))?.split('=')[1] ?? ''
)
  .split(',')
  .map(Number)
  .filter(Boolean);
const height = Number(
  args.find((a) => a.startsWith('--alto='))?.split('=')[1] ?? 900,
);

const chrome = findChrome();
if (!chrome) {
  die(
    'no encuentro Chromium. Se instala con `npx playwright install chromium`,\n' +
      'y en Ubuntu necesita ademas `sudo apt-get install -y libnss3 libnspr4 libasound2`.\n' +
      'Si ya lo tienes en otro sitio, exporta CHROME_PATH.',
  );
}

// UN BUILD VIEJO DA UNA CAPTURA QUE MIENTE, y no se distingue de una buena.
// Se reutiliza la comprobacion que ya existe en vez de inventar otra.
try {
  execFileSync('node', [join(ROOT, 'scripts', 'gates.mjs'), '--check'], {
    cwd: ROOT,
    stdio: 'pipe',
  });
} catch {
  die(
    'los gates no estan frescos, asi que `.next` no corresponde al codigo de\n' +
      'ahora y la captura mostraria otra version. Corre `pnpm run gates` antes.',
  );
}

const port = await freePort();
const server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(port)], {
  cwd: ROOT,
  stdio: 'ignore',
});

try {
  const base = `http://localhost:${port}`;
  if (!(await waitUntilUp(base))) die('el servidor no respondio en 60s');

  mkdirSync(OUT, { recursive: true });
  const escritas = [];

  for (const route of routes.length ? routes : ['/']) {
    for (const width of widths.length ? widths : DEFAULT_WIDTHS) {
      const file = join(OUT, `${slug(route)}-${width}.png`);
      execFileSync(
        chrome,
        [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--hide-scrollbars',
          `--window-size=${width},${height}`,
          `--screenshot=${file}`,
          // Sin esto la captura sale antes de que las imagenes carguen, y una
          // foto que no llego es indistinguible de una que no se dibuja.
          '--virtual-time-budget=15000',
          `${base}${route}`,
        ],
        { stdio: 'pipe' },
      );
      escritas.push(file.replace(`${ROOT}/`, ''));
    }
  }

  console.log(`\n${escritas.length} capturas en outputs/capturas/:`);
  for (const f of escritas) console.log(`  ${f}`);
  console.log(
    '\nAbrelas. Un criterio `[navegador]` no se cierra sin mirarlas.\n',
  );
} finally {
  server.kill('SIGTERM');
}
