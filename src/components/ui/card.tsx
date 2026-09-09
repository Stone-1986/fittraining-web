/**
 * La superficie del sistema: un bloque que se apoya sobre el fondo.
 *
 * Se separa en `Card` / `CardTitle` / `CardBody` en vez de recibir props
 * `titulo` y `texto` por una razon practica: el dia que una tarjeta necesite
 * una imagen, un pie o dos botones, con partes se compone y con props hay
 * que anadir una prop mas cada vez, hasta acabar con un componente de once
 * parametros que nadie entiende. Se compone, no se configura.
 *
 * NO LLEVA SOMBRA NI ESQUINAS REDONDEADAS, y las dos cosas son decision del
 * sistema, no gusto:
 *   - Sin sombra (§ 01, «bloques a sangre»): la profundidad la dan el borde
 *     de 1px y el degradado. Una sombra negra sobre fondo negro no se ve, y
 *     mantenerla obligaria a inventar un token que solo sirve para eso.
 *   - Sin radio (§ 04): «0 en bloques y tarjetas». Antes era `rounded-lg`.
 *     El sistema nuevo solo redondea la pastilla del boton y el avatar.
 */

export function Card({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border border-border bg-card ${className}`.trim()}
      {...props}
    />
  );
}

/**
 * `as` permite elegir el nivel del encabezado. No es un detalle cosmetico:
 * los niveles de <h1> a <h6> son el indice con el que un lector de pantalla
 * recorre la pagina, asi que dependen de DONDE esta la tarjeta, no de como
 * se ve. Por defecto <h3>, que es lo habitual dentro de una seccion.
 *
 * El tamano va aparte, en `className`, y esa separacion es justamente la
 * regla: `<CardTitle as="h2" className="text-h4">` es perfectamente legitimo
 * —jerarquia de documento por un lado, escala visual por otro—. El tamano
 * por defecto es `text-h4` (22px), que es el que el canvas da a un titulo de
 * bloque.
 */
export function CardTitle({
  as: Tag = 'h3',
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h2' | 'h3' | 'h4';
}) {
  return (
    <Tag
      className={`font-heading font-bold text-h4 ${className}`.trim()}
      {...props}
    />
  );
}

/**
 * 24px de interior, que es lo que el sistema llama `lg` y reserva para el
 * «interior de tarjeta compacta» (§ 04).
 */
export function CardBody({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 ${className}`.trim()} {...props} />;
}
