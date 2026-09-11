/**
 * `next/image` FUERA DE NEXT, solo para el paquete de Claude Design.
 *
 * El `<Image>` de verdad reescribe `src` a `/_next/image?url=...`, un
 * optimizador que solo existe en el servidor de Next. En Claude Design esa
 * URL es un 404, asi que aqui la foto se pide tal cual. Reproduce el HTML que
 * Next emite con `fill` —el `<img>` absoluto a todo el hueco— para que
 * `PhotoSlot`, que es el componente real, recorte igual que en la web.
 *
 * `build-pkg.mjs` lo sustituye por `next/image` con un alias de esbuild. La
 * app nunca lo ve.
 */
import { forwardRef, type CSSProperties, type ImgHTMLAttributes } from 'react';

type StaticImport = { src: string; width?: number; height?: number };

export type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string | StaticImport;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
};

const FILL: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  color: 'transparent',
};

const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    fill,
    priority,
    quality: _quality,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    unoptimized: _unoptimized,
    style,
    onError,
    ...rest
  },
  ref,
) {
  return (
    <img
      ref={ref}
      src={typeof src === 'string' ? src : src.src}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={fill ? { ...FILL, ...style } : style}
      // UNA FOTO QUE NO CARGA SE ESCONDE, y debajo queda el rayado de
      // `.photo-slot` — el mismo estado que el hueco tiene mientras carga.
      // Pasa siempre con las rutas `/fotos/...` de la web, que en Claude
      // Design no existen: sin esto el navegador pinta su icono de imagen
      // rota encima del rayado.
      onError={(event) => {
        event.currentTarget.style.visibility = 'hidden';
        onError?.(event);
      }}
      {...rest}
    />
  );
});

export default Image;
