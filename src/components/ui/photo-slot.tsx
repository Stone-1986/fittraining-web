/**
 * EL HUECO DE FOTO, mientras no hay fotos (sistema § 08).
 *
 * No es un apaño: el canvas lo define como parte del sistema —un bloque con
 * el patron de rayas y la etiqueta monoespaciada de lo que falta, con su
 * tamaño previsto—. Tenerlo como componente evita que cada pantalla dibuje
 * su propio placeholder gris y que el dia de las fotos haya que buscarlos:
 * se cambia esto y ya.
 *
 * LOS DOS DEGRADADOS SON CLASES GLOBALES (`.scrim-side`, `.scrim-bottom`) y
 * no props de color, porque un degradado es color y el color solo vive en
 * `globals.css` (regla § 1). Aqui solo se elige cual.
 *
 * EL SISTEMA PROHIBE TEXTO DIRECTAMENTE SOBRE UNA FOTO: siempre un degradado
 * de proteccion en medio. Por eso `children` se pinta en una capa `relative`
 * POR ENCIMA del scrim, nunca debajo.
 *
 * ES UN PRIMITIVO: no sabe que es fittraining. Recibe la etiqueta ya escrita.
 */

const scrims = {
  /** Lateral: el texto vive a la izquierda. Es el del heroe. */
  side: 'scrim-side',
  /** Inferior: el texto se apoya abajo. Es el de la tarjeta de plan. */
  bottom: 'scrim-bottom',
  /** Sin degradado: el hueco es solo una superficie, sin texto encima. */
  none: '',
} as const;

export function PhotoSlot({
  label,
  scrim = 'none',
  align = 'left',
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Que foto falta y en que tamaño, en monoespaciada. Va `aria-hidden`: es
   * una nota de produccion, no contenido — el dia que llegue la imagen su
   * sitio lo ocupa un `alt`.
   */
  label?: string;
  scrim?: keyof typeof scrims;
  align?: 'left' | 'right';
}) {
  return (
    <div className={`photo-slot relative ${className}`.trim()} {...props}>
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
