import { buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { SiteHeader } from '@/components/site/site-header';

/**
 * EL HEROE DE LA PORTADA.
 *
 * MONTA LA BARRA DENTRO, y no es una comodidad: el canvas dibuja la foto del
 * heroe pasando POR DETRAS de la barra, asi que la capa de imagen tiene que
 * envolverla. El contenedor es un `<div>` y no un `<section>` justo por eso —
 * un `<header>` dentro de un `<section>` pierde su papel de banner en el
 * arbol de accesibilidad, y el sitio se queda sin landmark de cabecera.
 *
 * LA FOTO NO LLEVA TEXTO ENCIMA SIN PROTECCION (sistema § 08): entre la
 * imagen y el titular va `.scrim-side`, el degradado lateral, porque el
 * texto vive a la izquierda. Las dos capas son decorativas y van
 * `aria-hidden`.
 *
 * QUE NO SE DIBUJA: los cuatro puntos de paginacion del canvas. Serian un
 * carrusel, es decir el unico JavaScript de cliente de toda la web publica —
 * y ademas no hay cuatro fotos que rotar; no hay ninguna.
 *
 * EL BOTON PRINCIPAL ES INERTE (revision 2 del plan, que sustituye a D-1):
 * dice «Crear mi cuenta», que es lo que el producto va a ofrecer, y se dibuja
 * como el canvas — pero es un `<span>`, no un `<a>`, porque la pantalla de
 * registro todavia no existe y nada de esta portada puede llevar a un 404.
 * Marcado con `[sin-destino]`, igual que los tres de la barra.
 */
export function Hero() {
  return (
    <div className="relative flex min-h-190 flex-col overflow-hidden">
      <PhotoSlot
        aria-hidden="true"
        scrim="side"
        align="right"
        label="FOTO HÉROE · ATLETA ENTRENANDO, TONO OSCURO, 2400×1400"
        className="absolute inset-0"
      />

      <SiteHeader active="inicio" />

      <div className="relative flex flex-1 items-center pt-10 pb-24">
        <Container size="full">
          <div className="max-w-165">
            {/* La escala del sistema, con una parada intermedia en movil:
                «Entrena» a 96px mide mas que un telefono de 320px y desborda
                en horizontal. Los dos tamaños son tokens; lo unico que
                decide el punto de quiebre es cual se usa. */}
            <h1 className="text-h2 font-black sm:text-display">
              Entrena con
              <br />
              <span className="text-primary">un plan real</span>
            </h1>

            {/* La barra cian del canvas mide 3px y aqui son 4 (`border-l-4`):
                3 no esta en la escala de 4px del sistema y la diferencia es
                imperceptible. Decision D-5 del plan. */}
            <p className="mt-8 max-w-115 border-l-4 border-primary pl-5 text-lead font-sans font-light text-muted-foreground">
              Planes creados por entrenadores certificados, con seguimiento
              semana a semana de tu progreso.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              {/* [sin-destino] Cuando exista `/registro`, este `<span>` pasa
                  a `<Link href="/registro">` y se le quita
                  `pointer-events-none` — que esta para que el hover del
                  sistema no prometa un clic que todavia no hace nada. */}
              <span
                className={buttonStyles({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'pointer-events-none',
                })}
              >
                Crear mi cuenta
              </span>

              {/* AQUI IBA «¿Eres entrenador? Publica tu plan», y se retiro
                  por decision del humano (2026-09-09).

                  Su historia explica por que no conviene reponerla sin
                  pensarlo: nacio del canvas, sobrevivio a D-1 como texto sin
                  enlace porque la pantalla de publicacion no existe, y el
                  Lider Tecnico tuvo que subir a bloqueante su subrayado —un
                  `border-b` bajo un texto de accion promete la misma pantalla
                  inexistente, solo que con CSS en vez de con un href—. Una
                  frase que invita a hacer algo sin sitio donde hacerlo cuesta
                  mas de lo que aporta.

                  El dia que exista la pantalla del entrenador, esto vuelve
                  como enlace de verdad, no como texto. */}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
