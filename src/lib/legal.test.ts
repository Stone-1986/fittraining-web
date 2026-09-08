import { describe, expect, it } from 'vitest';
import {
  LEGAL_DOCUMENTS,
  compareSemverDesc,
  findDocument,
  listVersions,
  renderDocument,
} from './legal';

/**
 * El unico test verdaderamente urgente del repo es el primero de
 * `renderDocument`. No es una prueba de formato: si el borrado de comentarios
 * se rompe, las notas internas de la cabecera de cada `.md` —por que la 1.0.0
 * no se publica, contra que codigo se verifico el texto— se publican dentro
 * de un documento legal, y nadie se entera porque la pagina sigue
 * construyendo y desplegando sin error.
 *
 * Los demas cubren las dos funciones con logica de verdad (`listVersions` y
 * el generador de anclas). El resto de `legal.ts` son datos.
 */

describe('renderDocument', () => {
  it('NO publica los comentarios HTML internos del markdown', () => {
    // Se prueba contra los cinco documentos reales y no contra un markdown de
    // laboratorio: el riesgo esta en el contenido que se publica, y un fixture
    // solo probaria la expresion regular contra si misma.
    for (const doc of LEGAL_DOCUMENTS) {
      for (const version of listVersions(doc.slug)) {
        const { html } = renderDocument(doc.slug, version);
        expect(
          html,
          `${doc.slug}/${version} filtro un comentario`,
        ).not.toContain('<!--');
      }
    }
  });

  it('da a cada encabezado un id unico y estable para enlazarlo', () => {
    const { html, toc } = renderDocument(
      'politica-de-privacidad',
      LEGAL_DOCUMENTS[0].currentVersion,
    );

    expect(toc.length).toBeGreaterThan(0);

    const ids = toc.map((entry) => entry.id);
    expect(new Set(ids).size, 'hay anclas duplicadas').toBe(ids.length);

    // El ancla del menu tiene que existir en el documento, o el enlace lleva
    // a ninguna parte sin fallar de forma visible.
    for (const id of ids) {
      expect(html, `falta el ancla ${id}`).toContain(`id="${id}"`);
    }
  });

  it('solo lleva los `##` al menu lateral', () => {
    const { toc } = renderDocument('terminos', '1.1.0');
    // Los `#` son el titulo del documento y los `###` son subdivisiones; si
    // alguno se colara, el menu seria mas largo que util.
    const titulo = toc.find((e) => e.text.startsWith('Términos'));
    expect(titulo).toBeUndefined();
  });
});

describe('listVersions', () => {
  it('ordena de la mas nueva a la mas vieja comparando numeros, no texto', () => {
    // El orden alfabetico pondria "1.9.0" por encima de "1.10.0". Hoy ningun
    // documento ha llegado a la decena, y por eso mismo el fallo entraria sin
    // que nadie lo note.
    const versions = listVersions('politica-de-privacidad');
    const asNumbers = versions.map((v) => v.split('.').map(Number));

    for (let i = 1; i < asNumbers.length; i++) {
      const [prevMajor, prevMinor, prevPatch] = asNumbers[i - 1];
      const [major, minor, patch] = asNumbers[i];
      const prev = prevMajor * 1e6 + prevMinor * 1e3 + prevPatch;
      const curr = major * 1e6 + minor * 1e3 + patch;
      expect(prev).toBeGreaterThan(curr);
    }
  });

  it('devuelve la version vigente de cada documento del catalogo', () => {
    // Si el `.md` de la version vigente no existe, la pagina revienta en
    // build. Esto lo convierte en un fallo con nombre.
    for (const doc of LEGAL_DOCUMENTS) {
      expect(
        listVersions(doc.slug),
        `${doc.slug} no tiene el archivo de su version vigente`,
      ).toContain(doc.currentVersion);
    }
  });
});

describe('findDocument', () => {
  it('encuentra por slug y devuelve undefined si no existe', () => {
    expect(findDocument('terminos')?.slug).toBe('terminos');
    expect(findDocument('no-existe')).toBeUndefined();
  });
});

describe('compareSemverDesc', () => {
  it('trata las versiones como numeros y no como texto', () => {
    // ESTE es el caso que justifica la funcion: ordenando como texto, "1.9.0"
    // quedaria por encima de "1.10.0" y la pagina serviria como vigente una
    // version retirada. Pasa el dia que un documento llega a la decena.
    expect(['1.9.0', '1.10.0', '1.2.0'].sort(compareSemverDesc)).toEqual([
      '1.10.0',
      '1.9.0',
      '1.2.0',
    ]);
  });

  it('compara major, luego minor, luego patch', () => {
    expect(compareSemverDesc('2.0.0', '1.99.99')).toBeLessThan(0);
    expect(compareSemverDesc('1.2.0', '1.1.9')).toBeLessThan(0);
    expect(compareSemverDesc('1.1.2', '1.1.1')).toBeLessThan(0);
  });

  it('considera iguales dos versiones identicas', () => {
    expect(compareSemverDesc('1.1.0', '1.1.0')).toBe(0);
  });

  it('completa con cero los segmentos que faltan', () => {
    // `1.1` es equivalente a `1.1.0`, no un error. Sin el `?? 0` esto daria
    // NaN y el `sort` dejaria el arreglo en un orden arbitrario y silencioso.
    expect(compareSemverDesc('1.1', '1.1.0')).toBe(0);
    expect(compareSemverDesc('1.2', '1.1.5')).toBeLessThan(0);
    // El segmento ausente es justo el que decide: '1.1.5' gana a '1.1'.
    expect(compareSemverDesc('1.1.5', '1.1')).toBeLessThan(0);
    expect(compareSemverDesc('1.1', '1.1.5')).toBeGreaterThan(0);
  });
});
