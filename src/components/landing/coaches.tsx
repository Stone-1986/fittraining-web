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
 * De los tres retratos (400×400) hoy hay UNO. Los otros dos se quedan como
 * hueco rayado y ya no llevan la etiqueta de lo que falta: con un retrato
 * real al lado, «RETRATOS DE ENTRENADORES · 400×400» describia media fila y
 * contradecia la otra media.
 *
 * NINGUNO DICE CUANTOS ENTRENADORES HAY, y es deliberado —el mismo criterio
 * que retiro el avatar «+9»—. Un retrato es una cara, no un recuento; el dia
 * que los tres sean personas, la fila sigue sin afirmar una cifra.
 */
export function CoachesBlock() {
  return (
    <section className="grid border-t border-border md:grid-cols-2">
      {/* LA FOTO DEL BLOQUE, 1200x1400 — la medida de «tarjeta» del sistema
          (§ Imagen), que es vertical porque ocupa media franja y no una banda.

          `alt=""`: es decoracion. Lo que el bloque afirma lo dice el titular
          que tiene al lado, y describir la escena obligaria a un lector de
          pantalla a oir un parrafo para llegar a la misma idea.

          SIN `priority`: esta a media pagina y competiria con el heroe, que
          es el LCP.

          `sizes` SIGUE A LA REJILLA: la seccion es `md:grid-cols-2`, asi que
          desde 768px la foto ocupa media ventana y por debajo la ocupa
          entera. Sin esto Next asume `100vw` y le sirve a un telefono el
          doble de pixeles de los que caben. */}
      <PhotoSlot
        src="/fotos/entrenador.jpeg"
        alt=""
        sizes="(min-width: 768px) 50vw, 100vw"
        className="relative min-h-120"
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

        {/* LOS TRES RETRATOS (400x400), y hoy solo uno es una persona. Los
            otros dos siguen siendo el hueco rayado del sistema, sin nota al
            lado: la nota se retiro cuando llego el primer retrato.

            `overflow-hidden` SOLO EN EL QUE LLEVA FOTO, y hace falta: el
            `rounded-full` recorta el fondo del hueco vacio —un fondo siempre
            se recorta al radio— pero NO recorta un hijo posicionado, y la
            imagen de `PhotoSlot` va `absolute` por `fill`. Sin esa clase el
            retrato sale cuadrado dentro de un borde redondo.

            `sizes="56px"` porque el hueco mide `size-14` y no cambia con la
            ventana. Es lo que evita que Next sirva 384px para 56. */}
        <div className="mt-8 flex flex-wrap items-center gap-3.5">
          <PhotoSlot
            src="/fotos/avatar-1.jpeg"
            alt=""
            sizes="56px"
            className="relative size-14 overflow-hidden rounded-full border border-border-strong"
          />
          {[0, 1].map((i) => (
            <PhotoSlot
              key={i}
              aria-hidden="true"
              className="relative size-14 rounded-full border border-border-strong"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
