import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell } from '@/components/legal-shell';
import styles from '@/components/legal-shell.module.css';
import { LEGAL_DOCUMENTS } from '@/lib/legal';

/**
 * Indice de `/legal` — el unico enlace que necesita la landing (W-10) y el
 * pie de cualquier pagina para llegar a los cinco documentos.
 *
 * Cada entrada lleva una linea que dice PARA QUE SIRVE el documento, no solo
 * su nombre: quien llega buscando "como borro mi cuenta" no deberia tener
 * que abrir cuatro textos legales para descubrir cual es el suyo.
 */
export const metadata: Metadata = {
  title: 'Documentos legales — fittraining',
  description:
    'Política de privacidad, términos y condiciones y consentimientos de fittraining.',
  alternates: { canonical: '/legal' },
};

export default function IndiceLegal() {
  return (
    <LegalShell>
      <div className={styles.indice}>
        <h1>Documentos legales</h1>
        <p>
          Estos son los documentos que rigen el uso de fittraining. Cada uno
          tiene su propia dirección permanente y se conserva sin cambios una vez
          publicado.
        </p>
        <ul className={styles.indiceLista}>
          {LEGAL_DOCUMENTS.map((doc) => (
            <li key={doc.slug} className={styles.indiceItem}>
              <Link href={`/${doc.slug}`}>
                <span className={styles.indiceNombre}>{doc.title}</span>
                <span className={styles.indiceResumen}>{doc.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </LegalShell>
  );
}
