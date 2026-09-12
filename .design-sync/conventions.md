# Cómo construir con fittraining

## Montaje

- **Fondo oscuro siempre.** `styles.css` pinta el `<body>` con `--background` (negro carbón), texto `--foreground` y Barlow 300. Si montas dentro de un contenedor que no es el body, ponle `bg-background text-foreground font-sans`. No hay modo claro: nunca `dark:` ni fondos blancos.
- **Sin provider.** Todo está en `window.Fittraining`: `Button`, `buttonStyles`, `Card`, `CardTitle`, `CardBody`, `Container`, `PhotoSlot`, `SectionHeading`, `SiteHeader`, `SiteFooter`, `Hero`, `HowItWorks`, `CoachesBlock`, `Faq`, `ClosingCta`.
- **Fotos:** `PhotoSlot` con `src` (URL) + `alt` + `sizes`; sin foto, `label="FOTO DE PLAN · 1200×1400"` y se ve el rayado del sistema. `Hero`, `CoachesBlock` y `ClosingCta` apuntan a `/fotos/…`, que aquí no existe: salen con el rayado, y es correcto.

## Estilo: utilidades de Tailwind con los tokens del sistema, y solo esas

La hoja está precompilada. Una clase fuera de este vocabulario (`bg-neutral-800`, `text-[21px]`, `shadow-lg`, `rounded-lg`) no tiene CSS y sale sin estilo.

| Familia     | Clases                                                                                                                                                                                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Superficie  | `bg-background` (lienzo), `bg-card` (bloque), `bg-muted` (superficie alta), `bg-primary-soft` (insignia)                                                                                                                                                                                  |
| Texto       | `text-title` (solo titulares), `text-foreground`, `text-muted-foreground` (párrafos), `text-subtle-foreground`, `text-meta-foreground` (metadatos), `text-disabled-foreground`                                                                                                            |
| Acento      | `bg-primary`, `text-primary`, `border-primary`, `hover:bg-primary-hover`. El cian **es `primary`**; `accent` es un gris de hover, nunca el cian                                                                                                                                           |
| Estado      | `text-success`, `text-warning`, `text-destructive`, `text-info`: siempre con texto o icono, nunca solo el color                                                                                                                                                                           |
| Bordes      | `border border-border` (separa), `border-border-strong`, `border-input` (límite de un control), `border-t`, `border-l-4`                                                                                                                                                                  |
| Tipo        | `text-display`, `text-h2`, `text-h3`, `text-h4`, `text-lead`, `text-body`, `text-ui`, `text-label`; `font-heading` (Archivo, titulares) / `font-sans` (Barlow) / `font-mono` (metadatos); `font-light` … `font-black`; `tracking-eyebrow`, `tracking-label`, `tracking-meta`; `uppercase` |
| Forma       | `rounded-none` (por defecto), `rounded-pill`, `rounded-full` (avatar). Sin sombras: la profundidad es el borde de 1px                                                                                                                                                                     |
| Maquetación | escala de 4px (`p-*` de 0 a 32; `m-*` y `gap-*` de 0 a 24), `flex`, `grid`, `grid-cols-{1,2,3,4,6,12}`, prefijos `md:` y `lg:`, `max-w-prose-doc` (620px), `max-w-wide` (1120px) y `.grid-cards`, la rejilla del sistema                                                                  |

Para lo que no esté, usa las variables de `:root` en línea: `style={{ color: 'var(--muted-foreground)' }}`.

## Reglas que el sistema no negocia

- Español, **tuteo**, frases cortas, cifras concretas («12 semanas»). Sin emoji ni exclamaciones. Mayúsculas solo en botones, etiquetas y metadatos: escribe el texto en caja normal y deja que `uppercase` lo haga.
- **Un solo `Button variant="primary"` por vista.** Un enlace que navega es `<a className={buttonStyles({ variant: 'secondary' })}>`, no un `<button>`. `size="sm"` solo en tablas.
- Un `h1` por página. El nivel y el tamaño se eligen por separado (`<h2 className="text-h4">`). En `CardTitle`, `as` cambia el nivel; **no lo agrandes con `className`**: su `text-h4` gana a `text-h3`, `text-h2`, `text-display` y `text-body`.
- Texto sobre foto: siempre `PhotoSlot` con `scrim="side"` o `scrim="bottom"`.
- Cada sección abre con `SectionHeading` (rótulo cian + `h2`) y se separa con `border-t border-border`, no con tarjetas flotantes.

## Dónde está la verdad

`styles.css` importa `_ds_bundle.css`: ahí están los tokens (`:root`) y todas las clases. La API y los ejemplos de cada pieza: `components/<grupo>/<Nombre>/<Nombre>.d.ts` y `.prompt.md`.

## Ejemplo

```jsx
const { Container, SectionHeading, Card, CardBody, CardTitle, Button } =
  window.Fittraining;

<section className="border-t border-border bg-background py-24">
  <Container size="full">
    <SectionHeading eyebrow="Planes" title="Elige cómo quieres entrenar" />
    <div className="grid-cards mt-14">
      <Card>
        <CardBody>
          <CardTitle>Fuerza en casa</CardTitle>
          <p className="mt-2.5 text-body font-sans font-light text-muted-foreground">
            Cuerpo completo con mancuernas y tu propio peso.
          </p>
          <p className="mt-5 font-mono text-label uppercase tracking-meta text-meta-foreground">
            12 semanas · 4 sesiones
          </p>
          <Button className="mt-6" variant="secondary">
            Ver el plan
          </Button>
        </CardBody>
      </Card>
    </div>
  </Container>
</section>;
```
