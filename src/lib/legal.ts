import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

/**
 * Catalogo de documentos legales publicados (W-11).
 *
 * ESTE REPO ES EL DUENO DEL TEXTO. No es una preferencia: es la decision D-8
 * de EPICA-01, escrita en el catalogo del backend
 * (`legal-documents.catalog.ts`) y reafirmada en `definicion-web.md § 4`.
 * El backend es dueno solo de QUE VERSIONES acepta.
 *
 * SI SE PUBLICA UNA VERSION NUEVA hay que tocar tres cosas, en este orden:
 *   1. agregar `src/content/legal/<slug>/<version>.md` en este repo;
 *   2. mover `currentVersion` de abajo;
 *   3. agregar la version al `LEGAL_DOCUMENT_VERSIONS` del backend.
 * Si (3) falta, la API responde 422 en el primer intento de aceptacion —
 * un fallo ruidoso e inmediato, que es la razon por la que `definicion-web
 * § 4` decidio NO construir un gate que compare las dos listas.
 *
 * LAS VERSIONES VIEJAS NO SE BORRAN NUNCA. Una fila de `legal_acceptances`
 * apuntando a `1.1.0` tiene que poder resolverse a su texto exacto anos
 * despues: ese archivo es la prueba de que la persona acepto ESTE contenido.
 */
export interface LegalDocument {
  /** Segmento de URL. Fijado en `definicion-web.md § 3` — no se renombra. */
  slug: string;
  /** Nombre corto para el menu lateral. */
  navLabel: string;
  /** Titulo completo, para el <title> y los metadatos. */
  title: string;
  /** Una linea que dice para que sirve, visible bajo el nombre en el indice. */
  summary: string;
  /** Version vigente hoy. Es la que sirve la URL sin version. */
  currentVersion: string;
}

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  {
    slug: 'politica-de-privacidad',
    navLabel: 'Política de privacidad',
    title: 'Política de Tratamiento de Datos Personales',
    summary:
      'Qué datos recogemos, para qué, quién los ve y cómo ejercer sus derechos.',
    currentVersion: '1.1.0',
  },
  {
    slug: 'terminos',
    navLabel: 'Términos y condiciones',
    title: 'Términos y Condiciones de Uso',
    summary:
      'Las reglas del servicio: roles, planes, cuenta y responsabilidades.',
    currentVersion: '1.1.0',
  },
  {
    slug: 'consentimiento-deportivo',
    navLabel: 'Consentimiento deportivo',
    title: 'Consentimiento Informado Deportivo',
    summary:
      'Los riesgos del entrenamiento físico y qué declara usted al aceptarlos.',
    currentVersion: '1.1.0',
  },
  {
    slug: 'consentimiento-datos-de-salud',
    navLabel: 'Datos de salud',
    title: 'Consentimiento para el Tratamiento de Datos Sensibles de Salud',
    summary:
      'La autorización aparte que exige la ley para el esfuerzo y las sensaciones.',
    currentVersion: '1.1.0',
  },
  {
    slug: 'aviso-de-eliminacion-de-cuenta',
    navLabel: 'Eliminación de cuenta',
    title: 'Aviso de Eliminación de Cuenta',
    summary:
      'Qué se borra, qué se conserva y por cuánto tiempo al eliminar su cuenta.',
    currentVersion: '1.0.0',
  },
];

const CONTENT_ROOT = join(process.cwd(), 'src/content/legal');

export function findDocument(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((d) => d.slug === slug);
}

/** Todas las versiones publicadas de un documento, de la mas nueva a la mas vieja. */
export function listVersions(slug: string): string[] {
  return readdirSync(join(CONTENT_ROOT, slug))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort(compareSemverDesc);
}

/**
 * Ordena versiones semanticas de la mas nueva a la mas vieja.
 *
 * SE EXPORTA SOLO PARA PODER PROBARLA, y eso es deliberado: hoy ningun
 * documento tiene mas de una version publicada, asi que `listVersions` nunca
 * llega a llamar al comparador y el contenido real no puede ejercitarlo. La
 * regla que protege —que `1.10.0` es MAS NUEVA que `1.9.0`, cosa que el orden
 * alfabetico invierte— solo se romperia el dia que un documento llegue a la
 * decena, es decir el dia en que nadie estaria mirando esto.
 */
export function compareSemverDesc(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pb[i] ?? 0) !== (pa[i] ?? 0)) return (pb[i] ?? 0) - (pa[i] ?? 0);
  }
  return 0;
}

export interface TocEntry {
  id: string;
  text: string;
}

export interface RenderedDocument {
  html: string;
  /** Los encabezados `##` del documento, para el sub-menu de la barra lateral. */
  toc: TocEntry[];
}

/**
 * Convierte el markdown de una version a HTML.
 *
 * LO PRIMERO QUE HACE ES BORRAR LOS COMENTARIOS HTML, y no es cosmetico: la
 * cabecera de cada `.md` lleva notas internas —por que la 1.0.0 no se
 * publica, contra que codigo se verifico el texto, que hallazgo cierra— que
 * NO deben salir a la web. `marked` deja pasar el HTML crudo tal cual, asi
 * que sin este paso se publicarian enteras dentro del documento legal.
 */
export function renderDocument(
  slug: string,
  version: string,
): RenderedDocument {
  const raw = readFileSync(join(CONTENT_ROOT, slug, `${version}.md`), 'utf-8');
  const withoutComments = raw.replace(/<!--[\s\S]*?-->/g, '');

  const toc: TocEntry[] = [];
  const used = new Set<string>();

  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const plain = text.replace(/<[^>]+>/g, '');
    const id = uniqueSlug(plain, used);
    // Solo los `##` van al menu: los `#` son el titulo del documento y los
    // `###` son subdivisiones de una seccion (4.1, 4.2...) que harian el
    // menu mas largo que util.
    if (depth === 2) toc.push({ id, text: plain });
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };

  const html = marked.parse(withoutComments, {
    renderer,
    gfm: true,
    async: false,
  });

  return { html, toc };
}

function uniqueSlug(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'seccion';

  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}
