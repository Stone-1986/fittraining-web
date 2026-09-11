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
      {/* LA FOTO DEL HEROE.
          `alt=""` a proposito: es decoracion. Lo que esta pagina dice lo dice
          el <h1> que va encima; describir la foto aqui obligaria a un lector
          de pantalla a oir un parrafo antes de llegar al titular.

          `priority` porque es la imagen LCP — la mas grande y la primera que
          se ve. Es la unica de la portada que lo lleva: marcar mas de una
          anula el efecto.

          `focus="70% 20%"` PORQUE LA FOTO ES APAISADA Y EL HUECO NO LO ES.
          `object-cover` recorta por el lado que sobra, y aqui sobra por los dos
          —por el ancho en un telefono, por el alto en un escritorio— asi que
          hacen falta los dos numeros y cada uno resuelve un recorte distinto.

          EL 70% HORIZONTAL ES PARA EL TELEFONO. A 390x760 solo cabe una franja
          vertical de 718px del original, el 30% del ancho. Centrada cae en la
          pared vacia y parte a la atleta: media cara contra el borde derecho.
          Al 70% entra completa, con la mano adelantada dentro del cuadro.

          EL 20% VERTICAL ES PARA LA VENTANA ANCHA, y salio de verlo en el
          navegador. Cuanto mas ancha es la ventana, mas alto se recorta: a
          1900px se pierden 440 de los 1400 y centrados son 220 por arriba —
          pero LA CABEZA EMPIEZA EN EL PIXEL 156, asi que el centro la decapita.
          Con el 20% el corte de arriba baja a 88px, y a 2560px de ventana a
          138: la cabeza aguanta con margen hasta donde llega un monitor real.
          Lo que se pierde a cambio son las piernas, que es lo que hay que
          perder.

          LA FOTO ANTERIOR PEDIA LO CONTRARIO —su encuadre bueno era el centro—
          asi que este numero se mira POR IMAGEN y no se hereda: cambiar la
          foto obliga a volver a recortar y a corregir este comentario. */}
      <PhotoSlot
        src="/fotos/heroe.jpg"
        alt=""
        sizes="100vw"
        priority
        focus="70% 20%"
        scrim="side"
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
