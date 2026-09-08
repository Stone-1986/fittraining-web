import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LegalShell } from '@/components/legal-shell';
import styles from '@/components/legal-shell.module.css';
import {
  LEGAL_DOCUMENTS,
  findDocument,
  listVersions,
  renderDocument,
} from '@/lib/legal';

/**
 * UNA VERSION CONCRETA Y CONGELADA de un documento legal
 * (`/politica-de-privacidad/1.1.0`).
 *
 * NO ES UNA COMODIDAD, ES LA PRUEBA. Cuando una persona acepta, la base
 * guarda `legal_acceptances.documentVersion = '1.1.0'` y NADA MAS — el texto
 * no se guarda. Si dentro de tres anios se publica la 1.2.0 y alguien
 * reclama, hay que poder mostrar exactamente que decia la 1.1.0 que esa
 * persona acepto. Esta ruta es lo que convierte esa cadena en un documento.
 *
 * Por eso un `.md` de `src/content/legal/` NO SE BORRA NUNCA aunque su
 * version ya no sea la vigente, y por eso los propios documentos se citan
 * entre si con la URL versionada y no con la corta.
 *
 * RELACION CON EL BUCKET DEL PLAN DE DESPLIEGUE (`plan-de-despliegue.md §
 * 3`): ese plan puso las copias inmutables en `media.fittraining.app`, que
 * es el paso 4 y viene detras de Lightsail. Esta ruta cubre la misma
 * necesidad desde ya y cumple el mismo requisito de fondo —no depender de
 * que la instancia de la API siga existiendo—, porque Amplify sirve por CDN
 * y es independiente del backend. Cuando el bucket exista, conviven o esta
 * ruta redirige alla; el markdown sigue siendo la fuente en los dos casos.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_DOCUMENTS.flatMap((doc) =>
    listVersions(doc.slug).map((version) => ({ slug: doc.slug, version })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}): Promise<Metadata> {
  const { slug, version } = await params;
  const doc = findDocument(slug);
  if (!doc) return {};

  const esVigente = version === doc.currentVersion;

  return {
    title: `${doc.title} ${version} — fittraining`,
    description: doc.summary,
    // La vigente apunta al canonico de la URL corta para no competir consigo
    // misma; una version retirada no se indexa, pero sigue siendo accesible
    // para cualquiera que llegue con el enlace de su propia aceptacion.
    ...(esVigente
      ? { alternates: { canonical: `/${doc.slug}` } }
      : { robots: { index: false, follow: true } }),
  };
}

export default async function PaginaLegalVersionada({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}) {
  const { slug, version } = await params;
  const doc = findDocument(slug);
  if (!doc) notFound();

  const { html, toc } = renderDocument(doc.slug, version);
  const esVigente = version === doc.currentVersion;

  return (
    <LegalShell slugActivo={doc.slug} toc={toc}>
      {!esVigente && (
        <p className={styles.avisoVersion}>
          Está viendo la <strong>versión {version}</strong>, que ya no es la
          vigente. Se conserva sin cambios porque es el texto que aceptaron
          quienes lo hicieron mientras estuvo en vigor.{' '}
          <Link href={`/${doc.slug}`}>Ver la versión vigente</Link>.
        </p>
      )}
      <article
        className={styles.prosa}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <footer className={styles.pie}>
        <p>
          Enlace permanente a esta versión: fittraining.app/{doc.slug}/{version}
          . No cambia cuando se publica una versión nueva.
        </p>
      </footer>
    </LegalShell>
  );
}
