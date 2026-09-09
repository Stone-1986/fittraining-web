import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Lee los tokens del sistema desde `globals.css`.
 *
 * POR QUE EXISTE, que no es obvio: la guia viva de `/estilo` enseña el valor
 * de cada token —«primary es #28E0C8»— y ese valor tenia que estar escrito a
 * mano en la pagina. Eso creaba dos problemas, y el segundo es el caro:
 *
 *   1. La guia podia MENTIR. Si alguien cambiaba el cian en `globals.css` y
 *      no se acordaba de la pagina, la guia seguia enseñando el color viejo
 *      con toda naturalidad. Una guia que puede desincronizarse es
 *      documentacion, y la de este repo se sostiene sobre no serlo.
 *
 *   2. Metia VEINTE HEXADECIMALES en un archivo de `src/`, y la unica
 *      comprobacion que tiene la regla «ningun archivo escribe un color» es
 *      un `grep` por `#`. Con la guia escrita a mano ese grep devolvia veinte
 *      falsos positivos, y un control que grita en falso veinte veces deja de
 *      correrse. Perder el control valia mas que la comodidad de la tabla.
 *
 * Se lee en tiempo de BUILD, no de ejecucion: `/estilo` es una pagina
 * estatica, asi que esto corre una vez en `next build` y lo que llega al
 * navegador es HTML con los valores ya dentro. No hay lectura de disco en
 * produccion.
 *
 * NO resuelve `var(...)`. Los roles de `@theme inline` apuntan a otro token
 * (`--color-primary: var(--primary)`) y devolverlos sin resolver seria
 * enseñar «var(--primary)» como si fuera un color. Se descartan: quien
 * pregunta por un valor quiere el literal.
 */

const GLOBALS_CSS = join(process.cwd(), 'src', 'app', 'globals.css');

/**
 * Extrae las declaraciones `--nombre: valor;` de una hoja de estilos.
 *
 * Se separa de la lectura del disco a proposito: asi la logica —que es la
 * parte que puede equivocarse— se prueba con cadenas y sin tocar el sistema
 * de archivos.
 */
export function parseTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();

  for (const [, name, rawValue] of css.matchAll(
    /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi,
  )) {
    const value = rawValue.trim();

    // Un alias (`var(--otro)`) no es un valor: se descarta.
    if (value.startsWith('var(')) continue;

    // Gana la PRIMERA declaracion. `:root` va antes que `@theme` en el
    // archivo, y es la que tiene los valores literales de la paleta.
    if (!tokens.has(name)) tokens.set(name, value);
  }

  return tokens;
}

/**
 * Devuelve el valor literal de un token, en mayusculas si es un hexadecimal.
 *
 * Las mayusculas son por legibilidad de la tabla: `#28E0C8` se compara de un
 * vistazo con el canvas mejor que `#28e0c8`, y en CSS se escribe en minuscula
 * porque es lo que deja Prettier.
 *
 * Si el token no existe, DEVUELVE UN AVISO VISIBLE en vez de una cadena
 * vacia. Un hueco en blanco en la tabla se lee como «este token no tiene
 * color»; «(falta --x)» se lee como lo que es, un error que hay que arreglar.
 */
export function formatToken(tokens: Map<string, string>, name: string): string {
  const value = tokens.get(name);
  if (value === undefined) return `(falta ${name})`;
  return /^#[0-9a-f]{3,8}$/i.test(value) ? value.toUpperCase() : value;
}

/** Lee y parsea `src/app/globals.css`. Corre en tiempo de build. */
export function readDesignTokens(): Map<string, string> {
  return parseTokens(readFileSync(GLOBALS_CSS, 'utf8'));
}
