import Image, { type ImageProps } from 'next/image';

/**
 * EL HUECO DE FOTO (sistema § 08), con o sin foto dentro.
 *
 * No es un apaño: el canvas lo define como parte del sistema —un bloque con
 * el patron de rayas y la etiqueta monoespaciada de lo que falta, con su
 * tamaño previsto—. Tenerlo como componente evita que cada pantalla dibuje
 * su propio placeholder gris y que el dia de las fotos haya que buscarlos:
 * se cambia esto y ya. Ese dia ya se puede empezar, uno a uno — el rayado
 * SIGUE PINTADO POR DEBAJO de la imagen y hace de fondo mientras carga, asi
 * que un hueco a medio llegar nunca es un rectangulo vacio.
 *
 * LOS DOS DEGRADADOS SON CLASES GLOBALES (`.scrim-side`, `.scrim-bottom`) y
 * no props de color, porque un degradado es color y el color solo vive en
 * `globals.css` (regla § 1). Aqui solo se elige cual.
 *
 * EL SISTEMA PROHIBE TEXTO DIRECTAMENTE SOBRE UNA FOTO: siempre un degradado
 * de proteccion en medio. Por eso `children` se pinta en una capa `relative`
 * POR ENCIMA del scrim, nunca debajo, y por eso el scrim va POR ENCIMA de la
 * imagen — el orden de las tres capas es la regla, no una casualidad.
 *
 * ES UN PRIMITIVO: no sabe que es fittraining. Recibe la etiqueta ya escrita
 * y, cuando llegue, la imagen ya elegida. No pide sus propios datos y NUNCA
 * conocera la URL de un ejercicio: eso llega por `src/lib/api/` (regla § 4).
 */

const scrims = {
  /** Lateral: el texto vive a la izquierda. Es el del heroe. */
  side: 'scrim-side',
  /** Inferior: el texto se apoya abajo. Es el de la tarjeta de plan. */
  bottom: 'scrim-bottom',
  /** Sin degradado: el hueco es solo una superficie, sin texto encima. */
  none: '',
} as const;

/**
 * O HAY FOTO O HAY ETIQUETA, y el tipo lo impone: son los dos estados del
 * mismo hueco y no existe el intermedio. Un `label` junto a un `src` seria
 * la nota de produccion de una foto que ya llego.
 *
 * `sizes` ES OBLIGATORIO CUANDO HAY FOTO, a proposito. Con `fill` y sin
 * `sizes`, Next asume `100vw` y le sirve el archivo de 2400px a un telefono:
 * el fallo mas caro de `next/image` y el mas silencioso, porque la pantalla
 * se ve bien. Hacerlo opcional era dejar la puerta abierta a olvidarlo.
 */
type PhotoContent =
  | {
      /** La imagen. Import estatico desde `public/`, o URL ya validada. */
      src: ImageProps['src'];
      /**
       * Vacio si la foto es decorativa —el heroe, el cierre—; descriptivo si
       * la foto ES el contenido. Que sea obligatorio obliga a decidirlo.
       */
      alt: string;
      /** Cuanto espacio ocupa el hueco. Ej. `(min-width: 768px) 50vw, 100vw`. */
      sizes: string;
      /** Solo en la imagen LCP. En las demas compite con la que si importa. */
      priority?: boolean;
      /**
       * EL PUNTO DE LA FOTO QUE NO SE PUEDE PERDER, como `object-position`.
       * Por defecto el centro, que es lo que hace `object-cover`.
       *
       * Existe porque `object-cover` recorta por el lado que sobra, y en un
       * hueco tan alto como el heroe —760px sobre un telefono de 390— el
       * recorte horizontal se come el 36% por cada lado. Medido con la
       * primera foto: al centro se le corta el cuerpo a la atleta, a la
       * derecha se le corta la cabeza, y al 70% entra entera. No es un ajuste
       * fino: es la diferencia entre que se vea una persona o un torso.
       *
       * `align` NO sirve para esto — solo alinea la etiqueta del hueco vacio.
       */
      focus?: string;
      label?: never;
    }
  | {
      src?: never;
      alt?: never;
      sizes?: never;
      priority?: never;
      focus?: never;
      /**
       * Que foto falta y en que tamaño, en monoespaciada. Va `aria-hidden`:
       * es una nota de produccion, no contenido — el dia que llegue la
       * imagen su sitio lo ocupa el `alt`, y esta etiqueta desaparece.
       */
      label?: string;
    };

export function PhotoSlot({
  src,
  alt,
  sizes,
  priority,
  focus,
  label,
  scrim = 'none',
  align = 'left',
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  scrim?: keyof typeof scrims;
  /**
   * Alinea LA ETIQUETA del hueco vacio, no la foto. Para encuadrar la foto
   * esta `focus`, que es otra cosa y se decide mirando la imagen.
   */
  align?: 'left' | 'right';
} & PhotoContent) {
  return (
    // NO LLEVA `relative` PROPIO, y esto costo encontrarlo: la caja la pone
    // QUIEN COLOCA el hueco, con una clase de posicion o con un alto. Cuando
    // el componente traia `relative` y la pantalla pasaba `absolute inset-0`,
    // las dos utilidades chocaban —misma especificidad— y ganaba la que Tailwind
    // emite mas abajo en la hoja, que es `relative`. El hueco quedaba en el
    // flujo con alto CERO y la foto, que va con `fill`, desaparecia sin error:
    // ni un gate lo veia, porque no hay nada roto en el HTML.
    //
    // INVARIANTE: sin caja no hay foto. `absolute inset-0` para un fondo a
    // sangre; `relative` mas un alto (`min-h-120`, `size-14`) para un hueco
    // que ocupa su sitio en el flujo.
    <div className={`photo-slot ${className}`.trim()} {...props}>
      {src && (
        // `fill` y no ancho/alto: el hueco ya tiene su tamaño —lo pone la
        // pantalla que lo coloca— y la foto se recorta a el. `object-cover`
        // recorta, asi que el encuadre tiene que respetar las proporciones
        // del sistema (§ Imagen); si no, se pierde lo que importa de la foto.
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={focus ? { objectPosition: focus } : undefined}
        />
      )}

      {scrim !== 'none' && (
        <div
          className={`${scrims[scrim]} absolute inset-0`}
          aria-hidden="true"
        />
      )}

      {label && (
        <p
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-6 bottom-5 font-mono text-label tracking-meta text-meta-foreground ${
            align === 'right' ? 'text-right' : ''
          }`.trim()}
        >
          {label}
        </p>
      )}

      {children && <div className="relative">{children}</div>}
    </div>
  );
}
