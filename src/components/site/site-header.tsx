import Link from 'next/link';
import { buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

/**
 * LA BARRA DEL SITIO PUBLICO.
 *
 * Vive en `components/site/` y no en `components/ui/` a proposito: conoce el
 * dominio —la marca, las secciones de la portada— y la regla § 3 prohibe que
 * un primitivo sepa que es fittraining.
 *
 * CERO JAVASCRIPT DE CLIENTE, tambien en movil. El menu estrecho es un
 * `<details>` nativo, el mismo patron que `legal-shell` ya usa: se abre con
 * el teclado, funciona sin JS y no arrastra un solo byte al navegador. Un
 * desplegable con estado seria el unico `'use client'` de toda la web
 * publica, y por una lista de cinco elementos.
 *
 * LOS CINCO ELEMENTOS DEL CANVAS, Y CUALES NAVEGAN (revision 2 del plan de
 * W-10, que sustituye a la decision D-1):
 *
 *   Inicio          enlace a `/`, en cian por ser la seccion activa
 *   Planes          INERTE — la pagina de planes no existe todavia
 *   Preguntas       enlace al ancla `#preguntas`, que si esta en la portada
 *   Iniciar sesion  INERTE — separado por una linea vertical a su izquierda
 *   REGISTRARME     INERTE — boton de borde cian, `secondary` + `rect`
 *
 * QUE SIGNIFICA «INERTE» AQUI Y POR QUE NO ES UN ENLACE DESACTIVADO: se
 * dibuja con el aspecto del canvas pero es un `<span>`, no un `<a>`. Ninguno
 * puede llevar a un 404, que es la regla que no cambia. Es el mismo recurso
 * que ya usa «¿Eres entrenador? Publica tu plan» en el heroe.
 *
 * Los tres sitios estan marcados con `[sin-destino]`: el dia que existan
 * `/planes`, `/iniciar-sesion` y `/registro`, `grep -rn '\[sin-destino\]'
 * src/` los encuentra todos y cada `<span>` pasa a `<Link href=...>`.
 *
 * POR QUE EL BOTON DE LA BARRA NO ES EL RELLENO CIAN: el sistema admite como
 * mucho UN boton primario por vista, y en esta pantalla ese es el del cierre.
 * Aqui va la variante de borde con `shape="rect"`, que es exactamente como el
 * canvas dibuja el boton de la barra — una pastilla rellena competiria con el
 * logotipo justo al lado.
 */

/**
 * La lista, con el destino de cada elemento en un solo sitio. `href: null`
 * es lo que marca lo inerte: la pieza se pinta, pero no navega.
 */
const NAV = [
  { href: '/', label: 'Inicio', section: 'inicio' },
  // [sin-destino] Cuando exista `/planes`, el href entra aqui.
  { href: null, label: 'Planes', section: 'planes' },
  { href: '#preguntas', label: 'Preguntas', section: 'preguntas' },
] as const;

/** Las clases del texto de navegacion, iguales navegue o no. */
const navText = 'text-ui font-sans font-medium';

export function SiteHeader({
  active,
}: {
  /** La seccion en la que esta parado el lector. Hoy siempre `inicio`. */
  active?: (typeof NAV)[number]['section'];
}) {
  // Se renderiza dos veces —barra ancha y menu estrecho— desde una sola
  // lista: dos copias escritas a mano se desincronizan en el primer cambio.
  const links = NAV.map((item) => {
    const isActive = item.section === active;
    const color = isActive ? 'text-primary' : 'text-foreground';

    // Lo inerte no lleva hover: un cambio de color al pasar el raton promete
    // que se puede pulsar, y todavia no se puede.
    if (item.href === null) {
      return (
        <span key={item.label} className={`${navText} ${color}`}>
          {item.label}
        </span>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={`${navText} ${color} transition-colors hover:text-primary-hover`}
      >
        {item.label}
      </Link>
    );
  });

  // [sin-destino] Cuando exista `/iniciar-sesion`, este `<span>` pasa a
  // `<Link>`. La linea vertical solo aparece en la barra ancha (`md:`): en
  // la columna del menu estrecho un borde izquierdo no separa nada.
  const signIn = (
    <span
      className={`${navText} text-subtle-foreground md:border-l md:border-border-strong md:pl-6`}
    >
      Iniciar sesión
    </span>
  );

  // [sin-destino] Cuando exista `/registro`, este `<span>` pasa a `<Link>` y
  // se le quita `pointer-events-none`.
  //
  // POR QUE ESA CLASE: `buttonStyles()` trae el hover y el estado presionado
  // del sistema, y un boton que se rellena de cian al pasar el raton promete
  // que se puede pulsar. Anularlos uno a uno seria inventar una variante; con
  // `pointer-events-none` la pieza deja de responder al puntero de una vez, y
  // es la misma utilidad que el propio boton usa cuando esta desactivado.
  const signUp = (
    <span
      className={buttonStyles({
        variant: 'secondary',
        shape: 'rect',
        className: 'pointer-events-none',
      })}
    >
      Registrarme
    </span>
  );

  return (
    <header className="relative">
      <Container
        size="full"
        className="flex flex-wrap items-center justify-between gap-8 py-6"
      >
        {/* EL LOGOTIPO, a las medidas del canvas y no a las de la escala.
            Usaba `text-h4` (22px) y `text-label` (12px) porque eran los
            escalones mas cercanos; el canvas lo dibuja a 26 y 9. Un logotipo
            no elige tamano segun la jerarquia de la pagina —tiene el suyo—,
            asi que ahora sale de `text-brand-mark` y `text-brand-tag`. En el
            PIE el canvas lo pinta mas pequeno y alli si es `text-h4`. */}
        <Link href="/" className="flex flex-col gap-0.5">
          <span className="font-heading text-brand-mark font-black text-title">
            FIT<span className="text-primary">TRAINING</span>
          </span>
          <span className="text-brand-tag font-sans font-medium uppercase tracking-brand text-meta-foreground">
            Planes de entrenamiento
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-8 md:flex"
        >
          {links}
          {signIn}
          {signUp}
        </nav>

        {/* Movil: `<details>` nativo. Sin estado, sin JS, con teclado. */}
        <details className="group md:hidden">
          <summary className="flex h-11 cursor-pointer list-none items-center gap-2 text-ui font-sans font-medium uppercase tracking-label text-foreground">
            Menú
            <span aria-hidden="true" className="text-h4 text-primary">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <nav
            aria-label="Principal"
            className="mt-4 flex flex-col items-start gap-5 border-t border-border pt-5"
          >
            {links}
            {signIn}
            {signUp}
          </nav>
        </details>
      </Container>
    </header>
  );
}
