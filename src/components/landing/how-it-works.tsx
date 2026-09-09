import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/landing/section-heading';
import { STEPS } from '@/lib/landing-content';

/**
 * LOS TRES PASOS.
 *
 * ES UNA LISTA ORDENADA DE VERDAD (`<ol>`), y eso resuelve la cuarta
 * contradiccion que encontramos en el canvas (decision D-3):
 *
 * El canvas pinta «01 02 03» en Archivo 900 con `#1F2A2C`, que sobre el fondo
 * mide 1.32:1 — como texto grande necesitaria 3:1. El primer token del
 * sistema que cumple (`input`, 3.11:1) ya no produce el efecto de numero
 * fantasma que el diseño busca. La salida no es subir el gris: es reconocer
 * que el numero es DECORATIVO Y REDUNDANTE, porque el orden ya lo comunica
 * la lista. Va `aria-hidden`, un lector de pantalla anuncia «1 de 3» de forma
 * nativa y mejor, y con el numero fuera del arbol de accesibilidad WCAG ya no
 * le exige contraste. Por eso `--decorative` existe y por eso NUNCA debe
 * usarse en algo legible.
 *
 * EL TAMAÑO ES `text-h2` (52px) Y NO LOS 44px DEL CANVAS: la escala tiene
 * cinco escalones y añadir uno para este numero la convertiria en siete
 * (decision D-4).
 */
export function HowItWorks() {
  return (
    <section className="border-t border-border py-24">
      <Container size="full">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Tres pasos y estás entrenando"
        />

        {/* `role="list"` porque la rejilla convierte los `<li>` en items de
            grid y Safari deja de anunciarlos como lista sin el. La lista es
            justamente lo que sustituye al numero «01» que va aria-hidden. */}
        <ol role="list" className="grid-cards mt-14 list-none">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className={`border-t-2 pt-6 ${i === 0 ? 'border-primary' : 'border-border'}`}
            >
              <p
                aria-hidden="true"
                className="font-heading text-h2 font-black text-decorative"
              >
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3.5 text-h4 font-bold">{step.title}</h3>
              <p className="mt-2.5 text-body font-sans font-light text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
