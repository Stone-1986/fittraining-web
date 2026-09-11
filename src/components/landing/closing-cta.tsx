import { buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PhotoSlot } from '@/components/ui/photo-slot';

/**
 * EL CIERRE: la franja a sangre con la ultima llamada a la accion.
 *
 * AQUI VA EL UNICO BOTON PRIMARIO DE LA PAGINA. El sistema admite como mucho
 * uno por vista —«si todo es cian, nada lo es»—, asi que el de la barra y el
 * del heroe llevan la variante de borde y el relleno se reserva para este.
 *
 * ES INERTE (revision 2 del plan, que sustituye a D-1): dice «Crear mi
 * cuenta», como el canvas, pero es un `<span>` y no un `<a>` porque la
 * pantalla de registro todavia no existe. Marcado con `[sin-destino]`, igual
 * que el del heroe y los tres de la barra.
 *
 * TAMPOCO SE DIBUJA «SOY ENTRENADOR», por la misma razon que «VER TODOS →»
 * del bloque de entrenadores: no lleva a ninguna parte.
 *
 * EL VELO SOBRE LA FOTO usa el token de fondo con opacidad
 * (`bg-background/80`) y no un color suelto — es el mismo recurso que ya usa
 * el boton destructivo con `bg-destructive/90`. El canvas pinta 0.82; 0.80 es
 * la parada de la escala y la diferencia no se ve.
 *
 * El tamaño del titular es `text-h2` (52px) y no los 62px del canvas: la
 * escala tiene cinco escalones y no se le añade uno para una pantalla
 * (decision D-4).
 */
export function ClosingCta() {
  return (
    <section className="relative border-t border-border">
      {/* Es la foto MAS CLARA de las tres candidatas —luminancia media 37 de
          255 frente a 13 del heroe— y aqui eso es una ventaja, no un defecto:
          el velo de abajo tapa el 80% y solo deja pasar el 20%. Una toma
          oscura bajo ese velo no se veria.

          Sin `priority`: esta al final de la pagina y competiria con el
          heroe, que es el LCP. */}
      <PhotoSlot
        src="/fotos/cierre.jpg"
        alt=""
        sizes="100vw"
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-background/80" aria-hidden="true" />

      <Container size="full" className="relative py-28 text-center">
        <h2 className="text-h3 font-black md:text-h2">Empieza esta semana</h2>

        {/* EL PARRAFO LO DICTA EL HUMANO, y su version actual es del
            2026-09-10. La anterior decia «...y ten tu primera sesion hoy
            mismo», y se cambio por FALSA, no por estilo: los Terminos § 6
            fijan la cadena Pendiente → Aprobada → consentimientos → Activa, y
            quien aprueba la inscripcion es el entrenador. Registrarte hoy no
            te da una sesion hoy; te da una solicitud pendiente. De las tres
            puertas que describe `definicion-web.md § 3` —crear la cuenta,
            inscribirse a un plan, ejecutar sesiones— la frase prometia
            justamente la que no esta abierta.

            SIGUE DICIENDO «UN PLAN» y la pagina de planes todavia no existe:
            eso esta anotado en `docs/sistema-de-diseno.md § 8` y se resuelve
            con esa pantalla, no reescribiendo esto. */}
        <p className="mx-auto mt-5 max-w-130 text-lead font-sans font-light text-muted-foreground">
          Elige un plan, crea tu cuenta y empieza en cuanto tu entrenador
          apruebe tu inscripción.
        </p>

        {/* [sin-destino] Cuando exista `/registro`, este `<span>` pasa a
            `<Link href="/registro">` y se le quita `pointer-events-none` —
            que esta para que el hover del sistema no prometa un clic que
            todavia no hace nada. */}
        <p className="mt-10">
          <span
            className={buttonStyles({
              variant: 'primary',
              size: 'lg',
              className: 'pointer-events-none',
            })}
          >
            Crear mi cuenta
          </span>
        </p>
      </Container>
    </section>
  );
}
