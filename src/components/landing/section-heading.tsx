/**
 * EL PAR ROTULO + TITULAR con que abre cada seccion de la portada.
 *
 * Se extrae porque se repite CUATRO veces —planes, como funciona,
 * entrenadores y preguntas—, por encima de la tercera repeticion a partir de
 * la cual la regla § 5 permite abstraer.
 *
 * DOS DECISIONES QUE PARECEN DE ESTILO Y SON DE ACCESIBILIDAD:
 *   - El rotulo cian es un `<p>`, no un encabezado. Es una etiqueta de
 *     seccion, y meterlo en la jerarquia de `h1`...`h6` llenaria el indice
 *     del lector de pantalla de titulos que no lo son.
 *   - El titular es siempre `<h2>`: la portada tiene un unico `<h1>` —el del
 *     heroe— y todas las secciones cuelgan de el sin saltos de nivel. El
 *     TAMAÑO se elige con la clase, que es una decision distinta. Baja a
 *     `text-h3` en pantalla estrecha porque una palabra larga a 52px no
 *     cabe en 320px y desbordaria la pagina en horizontal.
 *
 * MAYUSCULAS: el rotulo va en versalitas con `uppercase` y el texto se
 * escribe en caja normal. Asi el lector de pantalla no deletrea «P-L-A-N-E-S»
 * y el buscador no ve un grito.
 */
export function SectionHeading({
  eyebrow,
  title,
  className = '',
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-label font-sans font-semibold uppercase tracking-eyebrow text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-prose-doc text-h3 font-extrabold md:text-h2">
        {title}
      </h2>
    </div>
  );
}
