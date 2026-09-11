#!/usr/bin/env node
/**
 * Corre los cinco gates del repo y escribe el resultado en `outputs/gates.json`.
 *
 * POR QUE UN JSON Y NO SOLO LA SALIDA POR PANTALLA. Este archivo es la UNICA
 * fuente de numeros del proceso: ningun agente transcribe un porcentaje ni un
 * conteo a su reporte, los referencia por el `timestamp` de aqui. La razon es
 * medida, y viene del repo de la API: las dos unicas discrepancias registradas
 * entre lo que reporto un agente y la realidad fueron errores de
 * transcripcion, y los mismos comandos se corrian hasta tres veces por ciclo.
 * Si el numero lo escribe la herramienta, no hay nada que transcribir.
 *
 * MODO `--check`: no corre nada. Responde a una sola pregunta —¿este JSON es
 * posterior a todo lo que se toco, y esta en verde?— y es lo que ejecuta el
 * hook `SubagentStop` para que un agente no pueda declararse terminado sobre
 * gates que no corrio o que corrio antes de su ultimo cambio.
 *
 *   node scripts/gates.mjs           # corre los gates y escribe el JSON
 *   node scripts/gates.mjs --check   # ¿el JSON esta fresco y en verde?
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'outputs', 'gates.json');

/**
 * El orden importa: de lo mas barato a lo mas caro. Si los tipos no compilan,
 * no tiene sentido esperar dos minutos a un build que va a fallar igual.
 */
const GATES = [
  { name: 'typecheck', cmd: 'pnpm run typecheck' },
  { name: 'lint', cmd: 'pnpm run lint' },
  { name: 'format', cmd: 'pnpm run format:check' },
  { name: 'test', cmd: 'pnpm run test:cov' },
  { name: 'build', cmd: 'pnpm run build' },
];

/**
 * Lo que invalida un `gates.json`: si algo de aqui es mas nuevo, hay que
 * recorrer. La lista es lo que cambia el VEREDICTO de alguno de los cinco, y
 * cada entrada esta por un gate concreto:
 *
 *   src, package.json                  los cinco
 *   scripts                            el propio corredor
 *   tsconfig.json                      typecheck
 *   eslint.config.mjs, eslint-rules    lint — y `eslint-rules` ademas corre
 *                                      en la suite, asi que tambien es test
 *   .prettierrc, .prettierignore       format
 *   vitest.config.ts                   test (umbrales, `include`)
 *   next.config.ts, public             build — una foto nueva cambia la salida
 *
 * LO QUE NO SE VIGILA, A PROPOSITO: la prosa de `docs/` y `.claude/`. La
 * comprueba `format:check`, que corre sobre el repo entero, asi que en teoria
 * un markdown mal formateado deja `gates.json` mintiendo. En la practica el
 * hook `PostToolUse` pasa Prettier a todo lo que se escribe, y meter `docs/`
 * aqui obligaria a recorrer los cinco gates —45 segundos— por corregir una
 * frase. Es un intercambio elegido, no un olvido.
 */
const WATCHED = [
  'src',
  'scripts',
  'eslint-rules',
  'public',
  'package.json',
  'tsconfig.json',
  'eslint.config.mjs',
  'vitest.config.ts',
  'next.config.ts',
  '.prettierrc',
  '.prettierignore',
];

function newestMtime(path, newest = 0) {
  let s;
  try {
    s = statSync(path);
  } catch {
    return newest;
  }
  if (s.isFile()) return Math.max(newest, s.mtimeMs);
  for (const entry of readdirSync(path)) {
    newest = newestMtime(join(path, entry), newest);
  }
  return newest;
}

function check() {
  let report;
  try {
    report = JSON.parse(readFileSync(OUT, 'utf-8'));
  } catch {
    fail(
      'No existe outputs/gates.json. Corre `pnpm run gates` antes de reportar.',
    );
  }

  const written = new Date(report.timestamp).getTime();
  const touched = WATCHED.reduce(
    (acc, p) => newestMtime(join(ROOT, p), acc),
    0,
  );

  if (touched > written) {
    fail(
      `outputs/gates.json es ANTERIOR al ultimo cambio del codigo ` +
        `(gates: ${report.timestamp}, codigo: ${new Date(touched).toISOString()}). ` +
        'Vuelve a correr `pnpm run gates`: el reporte describe una version que ya no existe.',
    );
  }

  if (!report.all_passed) {
    const rojos = report.gates
      .filter((g) => !g.passed)
      .map((g) => g.name)
      .join(', ');
    fail(
      `Los gates estan en ROJO (${rojos}). No se puede reportar trabajo completo.`,
    );
  }

  console.log(
    `gates OK — ${report.timestamp} · ${report.gates.length}/5 en verde`,
  );
}

function fail(msg) {
  console.error(`gates --check: ${msg}`);
  process.exit(1);
}

function coverageSummary() {
  // El resumen lo escribe el propio Vitest; se copia tal cual y no se recalcula.
  try {
    const raw = JSON.parse(
      readFileSync(join(ROOT, 'coverage', 'coverage-summary.json'), 'utf-8'),
    );
    const t = raw.total;
    return {
      lines: t.lines.pct,
      statements: t.statements.pct,
      functions: t.functions.pct,
      branches: t.branches.pct,
    };
  } catch {
    return null;
  }
}

function run() {
  const started = new Date().toISOString();
  const results = [];

  for (const gate of GATES) {
    process.stdout.write(`\n▶ ${gate.name}\n`);
    const t0 = Date.now();
    let passed = true;
    let output = '';
    try {
      output = execSync(`${gate.cmd} 2>&1`, { cwd: ROOT, encoding: 'utf-8' });
      process.stdout.write(output);
    } catch (err) {
      passed = false;
      output = `${err.stdout ?? ''}${err.stderr ?? ''}`;
      process.stdout.write(output);
    }
    results.push({
      name: gate.name,
      command: gate.cmd,
      passed,
      duration_ms: Date.now() - t0,
      // Solo la cola: el JSON es para consultar el veredicto, no para leer
      // logs. Si algo falla, el log completo esta en la terminal.
      tail: passed ? null : output.trim().split('\n').slice(-25).join('\n'),
    });
  }

  const report = {
    timestamp: new Date().toISOString(),
    started_at: started,
    all_passed: results.every((r) => r.passed),
    coverage: coverageSummary(),
    gates: results,
  };

  mkdirSync(join(ROOT, 'outputs'), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

  const verdict = report.all_passed ? 'TODOS EN VERDE' : 'HAY GATES EN ROJO';
  console.log(`\n${'─'.repeat(60)}`);
  for (const r of results) {
    console.log(
      `  ${r.passed ? '✓' : '✗'} ${r.name.padEnd(10)} ${r.duration_ms} ms`,
    );
  }
  console.log(`${'─'.repeat(60)}\n${verdict} → outputs/gates.json\n`);

  process.exit(report.all_passed ? 0 : 1);
}

process.argv.includes('--check') ? check() : run();
