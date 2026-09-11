/**
 * LO QUE SE SINCRONIZA CON CLAUDE DESIGN, y nada mas.
 *
 * No es un barril de la app (la regla § 5 los prohibe en `src/`): es la
 * entrada de un paquete que solo existe para `/design-sync`. La app no lo
 * importa nunca y `build-pkg.mjs` lo compila aparte, a `.design-sync/.cache/`.
 *
 * FUERA A PROPOSITO:
 *   - `LegalShell`: lee el catalogo legal de `src/lib/legal.ts`, que usa
 *     `node:fs`. No puede correr en un navegador.
 *
 * Anadir un componente es anadir una linea aqui y su preview en `previews/`.
 */
export { Button, buttonStyles } from '@/components/ui/button';
export type {
  ButtonVariant,
  ButtonSize,
  ButtonShape,
} from '@/components/ui/button';
export { Card, CardTitle, CardBody } from '@/components/ui/card';
export { Container } from '@/components/ui/container';
export { PhotoSlot } from '@/components/ui/photo-slot';

export { SiteHeader } from '@/components/site/site-header';
export { SiteFooter } from '@/components/site/site-footer';

export { SectionHeading } from '@/components/landing/section-heading';
export { Hero } from '@/components/landing/hero';
export { HowItWorks } from '@/components/landing/how-it-works';
export { CoachesBlock } from '@/components/landing/coaches';
export { Faq } from '@/components/landing/faq';
export { ClosingCta } from '@/components/landing/closing-cta';
