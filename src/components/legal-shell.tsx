import Link from 'next/link';
import { LEGAL_DOCUMENTS, type TocEntry } from '@/lib/legal';
import styles from './legal-shell.module.css';

/**
 * El marco compartido de TODAS las paginas legales (W-11).
 *
 * POR QUE UN COMPONENTE Y NO UN `layout.tsx`: el menu lateral muestra, bajo
 * el documento abierto, sus propias secciones — y ese indice depende de la
 * VERSION que se este renderizando, que un layout por encima del segmento
 * `[slug]` no conoce. Con un componente, cada pagina le pasa su `toc` y la
 * barra siempre coincide con lo que hay a la derecha.
 *
 * Es una sola pagina para el lector —el menu no se mueve, solo cambia el
 * panel de la derecha— pero cada documento conserva su URL propia y estable.
 * Eso no es un detalle: Play Console pide la URL de la politica de privacidad
 * en concreto, y la app enlaza a un documento concreto en la pantalla de
 * consentimiento. Con anclas sobre una URL unica, las dos cosas quedan
 * colgando del scroll.
 *
 * Sin una linea de JavaScript de cliente: son cinco documentos estaticos.
 */
export function LegalShell({
  slugActivo,
  toc = [],
  children,
}: {
  /** `undefined` en el indice `/legal`, donde no hay documento abierto. */
  slugActivo?: string;
  toc?: TocEntry[];
  children: React.ReactNode;
}) {
  const activo = LEGAL_DOCUMENTS.find((d) => d.slug === slugActivo);

  const nav = (
    <>
      <p className={styles.navTitulo}>Documentos legales</p>
      <ul className={styles.navLista}>
        {LEGAL_DOCUMENTS.map((doc) => {
          const esActivo = doc.slug === slugActivo;
          return (
            <li key={doc.slug}>
              <Link
                href={`/${doc.slug}`}
                className={`${styles.navEnlace} ${esActivo ? styles.navEnlaceActivo : ''}`}
                aria-current={esActivo ? 'page' : undefined}
              >
                {doc.navLabel}
              </Link>
              {esActivo && toc.length > 0 && (
                <ul className={styles.subLista}>
                  {toc.map((entrada) => (
                    <li key={entrada.id}>
                      <a href={`#${entrada.id}`} className={styles.subEnlace}>
                        {entrada.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <div className={styles.page}>
      <a href="#documento" className={styles.skip}>
        Ir al contenido
      </a>

      <header className={styles.topbar}>
        <Link href="/" className={styles.marca}>
          fittraining
        </Link>
      </header>

      <div className={styles.layout}>
        {/* Movil: disclosure nativo que dice donde esta parado el lector. */}
        <details className={styles.navMovil}>
          <summary className={styles.navMovilResumen}>
            {activo ? activo.navLabel : 'Documentos legales'}
          </summary>
          <div className={styles.navMovilCuerpo}>{nav}</div>
        </details>

        <nav className={styles.navEscritorio} aria-label="Documentos legales">
          {nav}
        </nav>

        <main id="documento">{children}</main>
      </div>
    </div>
  );
}
