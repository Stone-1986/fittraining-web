/**
 * El ancho de la pagina, en un solo sitio.
 *
 * Parece trivial y es de los componentes que mas ahorran. La alternativa es
 * que cada pagina escriba su propio `max-w-...` a ojo; con cinco paginas ya
 * hay cinco anchos distintos y el sitio se siente descuadrado sin que nadie
 * sepa senalar por que. Esto lo convierte en una decision tomada una vez.
 *
 * EL MARGEN LATERAL ES DEL SISTEMA (§ 04): 56px, que baja a 32px en pantalla
 * estrecha. El canvas pone ese corte en 720px; aqui se usa el `md:` de
 * Tailwind (768px), que es la parada mas cercana de la escala. Inventar un
 * punto de quiebre propio para 48px de diferencia costaria mas de lo que
 * arregla.
 *
 * TRES ANCHOS, cada uno con su motivo:
 *   `prose`  620px — texto largo. Es el limite que fija el sistema (§ 03)
 *            para un parrafo. Antes eran 68ch; se cambia al valor del canvas
 *            para que el documento y el codigo digan el mismo numero.
 *   `wide`   1120px — rejillas de tarjeta y el panel del entrenador.
 *   `full`   sin limite. Es el modo de la landing: el sistema pide bloques a
 *            sangre y solo el margen lateral, sin una columna centrada que
 *            deje aire muerto a los lados en una pantalla grande.
 *
 * Los bloques de imagen y las franjas de plan van a sangre COMPLETA, sin ni
 * siquiera el margen lateral: esos no van dentro de un `Container`.
 */

export function Container({
  size = 'wide',
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: 'prose' | 'wide' | 'full';
}) {
  const width = {
    prose: 'max-w-prose-doc',
    wide: 'max-w-wide',
    full: '',
  }[size];

  return (
    <div
      className={`mx-auto w-full px-8 md:px-14 ${width} ${className}`.trim()}
      {...props}
    />
  );
}
