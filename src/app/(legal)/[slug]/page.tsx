import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LegalShell } from '@/components/legal-shell';
import styles from '@/components/legal-shell.module.css';
import { LEGAL_DOCUMENTS, findDocument, renderDocument } from '@/lib/legal';

/**
 * La VERSION VIGENTE de un documento legal, en su URL corta y estable
 * (`/politica-de-privacidad`, `/terminos`, ...). Las rutas las fijo
 * `definicion-web.md § 3` y no se renombran: la de la politica es la que se
 * declara en Play Console (P0-02) y la que citan los otros documentos.
 *
 * CUIDADO AL AGREGAR RUTAS NUEVAS AL SITIO. Este `[slug]` vive en la RAIZ,
 * asi que compite con cualquier ruta de un solo segmento. Lo que lo hace
 * seguro es `dynamicParams = false`: Next solo sirve los slugs que devuelve
 * `generateStaticParams`, y todo lo demas es 404. Ademas un segmento
 * estatico (`/legal`, y manana `/auth/...`) siempre gana sobre uno dinamico.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_DOCUMENTS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDocument(slug);
  if (!doc) return {};

  return {
    title: `${doc.title} — fittraining`,
    description: doc.summary,
    alternates: { canonical: `/${doc.slug}` },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = findDocument(slug);
  if (!doc) notFound();

  const { html, toc } = renderDocument(doc.slug, doc.currentVersion);

  return (
    <LegalShell activeSlug={doc.slug} toc={toc}>
      <article
        className={styles.prose}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <footer className={styles.footer}>
        <p>
          Está viendo la versión vigente ({doc.currentVersion}). Su enlace
          permanente, que no cambiará cuando se publique una versión nueva, es{' '}
          <Link href={`/${doc.slug}/${doc.currentVersion}`}>
            fittraining.app/{doc.slug}/{doc.currentVersion}
          </Link>
          .
        </p>
      </footer>
    </LegalShell>
  );
}
