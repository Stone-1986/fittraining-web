import Link from 'next/link';
import type { LegalDocument } from '@/lib/legal';
import { Container } from '@/components/ui/container';

/**
 * EL PIE DEL SITIO PUBLICO.
 *
 * RECIBE LOS DOCUMENTOS POR PROP y no los pide el. Es la regla § 3: un
 * componente de dominio no busca sus propios datos. Ademas tiene un efecto
 * practico — `src/lib/legal.ts` lee del disco con `node:fs`, y que el pie
 * dependiera de eso lo ataria al servidor sin necesidad.
 *
 * LOS CINCO ENLACES NO ESTAN ESCRITOS A MANO. Salen del mismo catalogo que
 * las paginas legales, asi que el dia que se publique un documento nuevo
 * aparece aqui solo. Escribirlos a mano es como se acaba con un pie que
 * enlaza a un documento retirado.
 */
export function SiteFooter({
  documents,
}: {
  documents: readonly LegalDocument[];
}) {
  return (
    <footer className="border-t border-border">
      <Container
        size="full"
        className="flex flex-wrap items-start justify-between gap-8 py-13"
      >
        <div>
          <p className="font-heading text-h4 font-black text-title">
            FIT<span className="text-primary">TRAINING</span>
          </p>
          <p className="mt-2.5 text-ui font-sans font-light text-meta-foreground">
            Plataforma de entrenamiento deportivo
          </p>
        </div>

        <nav aria-label="Documentos legales">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {documents.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={`/${doc.slug}`}
                  className="text-ui font-sans text-subtle-foreground transition-colors hover:text-primary-hover"
                >
                  {doc.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
