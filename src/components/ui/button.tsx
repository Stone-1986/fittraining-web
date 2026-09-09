/**
 * El boton del sistema (canvas § 05).
 *
 * NO LLEVA `'use client'`, y es a proposito. Un `<button>` con estilos no
 * necesita JavaScript: el hover, el foco y el estado presionado son CSS. Solo
 * el archivo que le pase un `onClick` tendra que declararse cliente, y asi el
 * JS que viaja al navegador queda limitado a la pieza que de verdad lo
 * necesita en vez de arrastrar la pagina entera.
 *
 * LA FORMA POR DEFECTO ES LA PASTILLA, en mayusculas, Barlow 600 y tracking
 * .14em. No es decoracion: es lo que hace que un boton se distinga de una
 * insignia y de un enlace en una interfaz que, por decision del sistema, no
 * tiene sombras ni relieve.
 *
 * CINCO VARIANTES. Cuatro salen del canvas y la quinta no:
 *   primary      relleno cian. LA accion. Como mucho una por vista.
 *   secondary    borde cian. La alternativa que sigue siendo importante.
 *   neutral      borde gris. La salida lateral («Soy entrenador»).
 *   link         texto cian con flecha. Accion terciaria, sin caja.
 *   destructive  borra algo de forma que no se deshace.
 *
 * `destructive` NO esta en el canvas y se mantiene igual, con el rojo
 * semantico: el producto tiene una accion destructiva de verdad —eliminar la
 * cuenta, con su propio aviso legal— y presentarla con el mismo cian que
 * «Guardar» es como se cometen accidentes. Cuando el canvas dibuje una, se
 * ajusta a lo que diga.
 *
 * POR QUE NO USA `class-variance-authority` NI `tailwind-merge`: son tres
 * dependencias para elegir entre cinco cadenas de texto. Un objeto plano hace
 * lo mismo, se lee sin documentacion y no anade nada al bundle. Cuando llegue
 * shadcn/ui para el panel traera `cva` consigo y ahi si estara justificado.
 */

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-semibold ' +
  'uppercase tracking-label whitespace-nowrap transition-colors ' +
  'disabled:pointer-events-none';

/**
 * Los estados no son opcionales. El sistema (§ 05) exige que cada variante
 * responda al hover Y al clic, y tenerlos aqui es lo que evita que cada
 * pantalla invente su propio `primary/90`.
 *
 * `active:` es el estado presionado. Va DESPUES de `hover:` en la cadena
 * porque con el dedo o el raton encima los dos coinciden, y gana el ultimo.
 *
 * En las variantes con borde, el hover RELLENA en vez de aclarar el trazo:
 * sobre fondo negro un borde que solo cambia de tono casi no se percibe.
 */
const variants = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover ' +
    'active:bg-primary-pressed ' +
    'disabled:bg-muted disabled:text-disabled-foreground',
  secondary:
    'border-2 border-primary text-primary ' +
    'hover:bg-primary-hover hover:text-primary-foreground ' +
    'active:bg-primary-pressed active:text-primary-foreground ' +
    'disabled:border-border disabled:bg-transparent disabled:text-disabled-foreground',
  neutral:
    'border-2 border-input text-foreground ' +
    'hover:border-subtle-foreground hover:text-title ' +
    'active:bg-border active:border-subtle-foreground ' +
    'disabled:border-border disabled:bg-transparent disabled:text-disabled-foreground',
  link:
    'text-primary underline-offset-4 ' +
    'hover:text-primary-hover hover:underline ' +
    'active:text-primary-pressed ' +
    'disabled:text-disabled-foreground disabled:no-underline',
  destructive:
    'bg-destructive text-destructive-foreground ' +
    'hover:bg-destructive/90 active:bg-destructive/80 ' +
    'disabled:bg-muted disabled:text-disabled-foreground',
} as const;

/**
 * LAS ALTURAS Y EL AREA DE TOQUE.
 *
 * `lg` (48px) y `md` (44px) cumplen el minimo de 44px que fija el sistema
 * (§ 10) y que es tambien el criterio AAA de WCAG 2.5.5.
 *
 * `sm` (36px) NO llega a 44px, y es una excepcion consciente, no un
 * descuido. El propio canvas la crea: define un tamano chico «solo dentro de
 * tablas y paneles» y a la vez pide 44px de alto minimo — se contradice. Se
 * resuelve del lado de la norma exigible: 36px pasa de sobra el minimo AA
 * real (WCAG 2.5.8, 24px), y a cambio una fila de tabla densa no se vuelve
 * inmanejable. Por eso `sm` no debe usarse NUNCA para la accion principal de
 * una pantalla; para eso estan `md` y `lg`.
 *
 * `link` ignora el padding horizontal: un enlace de accion no tiene caja, y
 * un `px` en el separaria el texto de su flecha sin motivo.
 */
const sizes = {
  lg: 'h-12 px-9 text-action-lg',
  md: 'h-11 px-6 text-action',
  sm: 'h-9 px-4 text-label',
} as const;

const linkSizes = {
  lg: 'text-action-lg',
  md: 'text-action',
  sm: 'text-label',
} as const;

/**
 * DOS FORMAS, y la segunda tiene un unico sitio donde va.
 *
 *   pill  la forma por defecto de un boton de accion.
 *   rect  2px de radio y tracking mas corto. RESERVADO a la barra de
 *         navegacion, donde una pastilla compite visualmente con el
 *         logotipo. Fuera de la barra, es `pill`.
 */
const shapes = {
  pill: 'rounded-pill',
  rect: 'rounded-sm tracking-nav',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;
export type ButtonShape = keyof typeof shapes;

type StyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  className?: string;
};

/**
 * Devuelve solo las clases, sin renderizar nada.
 *
 * Existe para el caso que mas se repite en un sitio publico: un ENLACE que
 * tiene que parecer un boton. Un `<Link>` no es un `<button>` —navega en vez
 * de ejecutar— y convertirlo en uno rompe el clic derecho, el «abrir en
 * pestana nueva» y lo que anuncia el lector de pantalla. Con esto el enlace
 * sigue siendo un enlace y solo toma prestada la apariencia:
 *
 *   <Link href="/planes" className={buttonStyles({ variant: 'secondary' })}>
 */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  className = '',
}: StyleOptions = {}) {
  // El enlace de accion no tiene caja: ni alto fijo, ni padding, ni radio.
  const box =
    variant === 'link' ? linkSizes[size] : `${sizes[size]} ${shapes[shape]}`;
  return `${base} ${variants[variant]} ${box} ${className}`.trim();
}

/**
 * `loading` implementa el estado que el canvas describe: «el boton conserva
 * su ancho, cambia el texto y queda no interactivo».
 *
 * El ancho lo conserva quien llama, pasando un texto de longitud parecida
 * («GUARDANDO...» por «GUARDAR»); el componente no puede adivinarlo. Lo que
 * si garantiza es lo que se olvida siempre: `aria-busy`, para que un lector
 * de pantalla anuncie que hay algo en curso, y `disabled`, para que no se
 * pueda enviar dos veces el mismo formulario.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  loading = false,
  className = '',
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
}) {
  // `type="button"` por defecto: el del navegador es `submit`, que dentro de
  // un formulario hace que cualquier boton lo envie sin querer.
  return (
    <button
      type="button"
      className={buttonStyles({ variant, size, shape, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    />
  );
}
