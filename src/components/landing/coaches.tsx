import { PhotoSlot } from '@/components/ui/photo-slot';
import { SectionHeading } from '@/components/landing/section-heading';

/**
 * EL BLOQUE DE ENTRENADORES: media pantalla de foto, media de texto.
 *
 * VA A SANGRE COMPLETA, sin `Container`: es una de las «franjas» que el
 * sistema § 01 describe —bloques a sangre separados por una linea de 1px— y
 * meterla en una columna centrada dejaria aire muerto a los lados.
 *
 * DOS COSAS DEL CANVAS QUE NO SE DIBUJAN, y las dos por el mismo motivo:
 *   - «VER TODOS →» no tiene destino. No hay pagina de entrenadores en W-10,
 *     asi que el enlace no se pinta en vez de llevar a un 404.
 *   - El avatar «+9» afirma que hay doce entrenadores. Hoy no hay ninguno
 *     dado de alta, asi que seria una cifra falsa — el mismo problema que la
 *     insignia «POPULAR», y se resuelve igual: fuera hasta que sea cierta.
 *
 * Los tres retratos son huecos de foto (400×400) y son decorativos:
 * `aria-hidden`, con la etiqueta de lo que falta escrita al lado en texto.
 */
export function CoachesBlock() {
  return (
    <section className="grid border-t border-border md:grid-cols-2">
      <PhotoSlot
        aria-hidden="true"
        label="FOTO · ENTRENADOR CON ATLETA, 1200×1400"
        className="min-h-120"
      />

      <div className="flex flex-col justify-center bg-card px-8 py-20 md:px-14">
        <SectionHeading
          eyebrow="Entrenadores"
          title="Detrás de cada plan hay alguien que responde"
        />

        <p className="mt-5 max-w-130 text-lead font-sans font-light text-muted-foreground">
          Los planes no son plantillas genéricas: cada uno lo publica un
          entrenador que sigue el progreso de sus atletas inscritos.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3.5">
          {[0, 1, 2].map((i) => (
            <PhotoSlot
              key={i}
              aria-hidden="true"
              className="size-14 rounded-full border border-border-strong"
            />
          ))}
          <p className="font-mono text-label tracking-meta text-meta-foreground">
            RETRATOS DE ENTRENADORES · 400×400
          </p>
        </div>
      </div>
    </section>
  );
}
