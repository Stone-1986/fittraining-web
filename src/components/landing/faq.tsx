import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { buttonStyles } from '@/components/ui/button';
import { SectionHeading } from '@/components/landing/section-heading';
import { FAQ } from '@/lib/landing-content';

/**
 * EL ACORDEON DE PREGUNTAS FRECUENTES.
 *
 * ES `<details>` NATIVO Y NO LLEVA UNA LINEA DE JAVASCRIPT. No es una
 * proeza: abrir y cerrar un panel es exactamente lo que el elemento hace, y
 * gratis trae el teclado (Enter y Espacio sobre el `<summary>`), el estado
 * anunciado al lector de pantalla y el buscar-en-pagina del navegador. El
 * signo «+ / −» cambia con `group-open:`, que es CSS. El patron esta probado
 * y visible en `/estilo` § 07.
 *
 * `list-none` en el `<summary>` quita el triangulo por defecto del navegador;
 * lo sustituye el signo, que va `aria-hidden` porque `<details>` ya anuncia
 * si esta abierto o cerrado — leerlo ademas como «mas» seria ruido.
 *
 * TRES PREGUNTAS, NO LAS CUATRO DEL CANVAS. La que falta y por que esta
 * escrito en `src/lib/landing-content.ts`, que es donde vive el contenido.
 *
 * LAS DOS RESPUESTAS DE SALUD ENLAZAN AL DOCUMENTO. Estan reescritas en
 * tuteo —la portada tutea, el documento legal va en «usted» y ahi se queda—
 * pero el fondo no puede cambiar, y el enlace es lo que permite comprobarlo.
 */
export function Faq() {
  return (
    <section id="preguntas" className="border-t border-border py-24">
      <Container size="full" className="grid gap-14 md:grid-cols-2">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Antes de registrarte"
        />

        <div>
          {FAQ.map((entry) => (
            <details
              key={entry.question}
              className="group border-t border-border last:border-b"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-lead font-sans font-normal text-foreground">
                {entry.question}
                <span aria-hidden="true" className="text-h4 text-primary">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>

              <p className="max-w-prose-doc pb-5 text-body font-sans font-light text-muted-foreground">
                {entry.answer}
              </p>

              {entry.source && (
                <p className="pb-6">
                  <Link
                    href={entry.source.href}
                    className={buttonStyles({ variant: 'link' })}
                  >
                    {entry.source.label} →
                  </Link>
                </p>
              )}
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
