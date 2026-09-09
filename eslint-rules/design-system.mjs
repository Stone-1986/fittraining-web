/**
 * EL SISTEMA DE DISEÑO, COMPROBADO POR LA MÁQUINA.
 *
 * No es un sexto gate: `outputs/gates.json` sigue teniendo cinco. Esto va
 * DENTRO de `lint`, que es lo que le da su fuerza — rompe `pnpm run lint`,
 * rompe `next build` y rompe la CI, sin añadir un paso que alguien pueda
 * saltarse.
 *
 * Hasta ahora los cinco gates pasaban perfectamente con un `#28e0c8` escrito
 * a mano dentro de un componente. La regla 1 era la única del repo que
 * dependía de que alguien mirase: el `grep` de `/implementar` y la revisión
 * del Líder Técnico. Un control humano que hay que acordarse de correr es,
 * con el tiempo, indistinguible de no tenerlo.
 *
 * NO ES UNA DEPENDENCIA NUEVA. Es un plugin local de ESLint 9, plano y sin
 * `create-eslint-rule` ni utilidades de terceros: una tabla de patrones y un
 * visitante que mira las cadenas del AST. Instalar un paquete para esto sería
 * exactamente la decisión de arquitectura que las reglas obligan a escalar.
 *
 * QUÉ MIRA Y QUÉ NO, que es lo importante para no confiarse:
 *
 *   SÍ  las cadenas de `.ts` y `.tsx` — que es donde vive `className`, que es
 *       donde se escapa el 100 % de lo que hemos visto escaparse.
 *
 *   NO  el CSS. ESLint no lo lee. `globals.css` es el sitio legítimo de los
 *       colores, así que ahí no hay nada que vigilar; la que sí queda sin
 *       gate es `legal-shell.module.css`, que hoy consume tokens y no
 *       declara ni un color. Cubrirla exigiría Stylelint, es decir una
 *       dependencia, y por una sola hoja no compensa.
 *
 *   NO  el texto visible (`JSXText`). Un párrafo que dice «el borde mide 2px»
 *       es contenido, no estilo. Vigilarlo daría falsos positivos en la guía
 *       viva, que es precisamente la página que más habla del sistema.
 */

/**
 * Los patrones, del error más caro al más barato.
 *
 * Cada uno cita la sección de `rulesFrontend.md` que lo prohíbe: un mensaje
 * de lint que no dice qué regla se violó obliga a buscarla, y entonces no se
 * busca.
 */
const PATTERNS = [
  {
    id: 'arbitrary-color',
    // VA ANTES que `color-literal` a proposito. Los dos verian el `#` de un
    // `bg-[#28e0c8]`, pero el arreglo es distinto y el mensaje debe decir
    // cual: una clase arbitraria se cambia por un token (`bg-primary`),
    // mientras que un color suelto en un objeto de estilos hay que MOVERLO a
    // globals.css. Si ganara el patron generico, el mensaje mandaria al sitio
    // equivocado.
    test: /-\[(?:#|rgb|hsl|oklch|oklab|color-mix|var\(--color)/i,
    message:
      'Color arbitrario en una clase. Usa el token (bg-primary, text-muted-foreground…); el color solo vive en globals.css — regla § 1',
  },
  {
    id: 'color-literal',
    // Exactamente 3, 4, 6 u 8 dígitos: `\b` evita que `#accesibilidad`
    // dispare por sus cuatro primeras letras, que son hexadecimales válidas.
    test: /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(/i,
    message:
      'Color literal fuera de globals.css. Los componentes nombran roles (bg-primary, text-muted-foreground), no colores — regla § 1',
  },
  {
    id: 'tailwind-palette',
    // Exige el sufijo numérico (`-500`), que es lo que distingue la paleta de
    // fábrica de un token nuestro: `text-primary` pasa, `text-teal-400` no.
    test: /\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|caret|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
    message:
      'Paleta de fábrica de Tailwind. El sistema tiene sus propios tokens en globals.css — regla § 1',
  },
  {
    id: 'arbitrary-scale',
    // Solo las propiedades que el sistema TOKENIZA. Un `w-[58%]` es una
    // proporción de dato, no una medida de la escala, y tiene que poder
    // escribirse; un `text-[21px]` es exactamente lo que la escala existe
    // para evitar.
    test: /\b(?:text|tracking|leading|rounded|font|shadow|duration|ease)-\[/,
    message:
      'Valor suelto donde el sistema tiene escala. Usa el token (text-lead, tracking-label, rounded-pill…) — regla § 1',
  },
  {
    id: 'dark-variant',
    // `dark:[a-z[]` y no `dark:` a secas: sin eso, una mención en prosa
    // —«no hay ni una clase dark: en el repo»— sale como acierto.
    test: /\bdark:[a-z[]/,
    message:
      'No hay modo claro, así que no hay un segundo tema al que aplicarse. Un dark: es siempre un error — regla § 1',
  },
  {
    id: 'removed-token',
    test: /\b(?:bg|text|border|ring|from|via|to)-warm\b/,
    message:
      'El token `warm` no existe: el sistema 1.0 tiene un solo acento. Para la acción es `primary` — regla § 1',
  },
  {
    id: 'off-system-radius',
    // El sistema reparte el radio por tipo de pieza: 0 en bloques y tarjetas,
    // sm (2px) en el botón de la barra, pill en el de acción, full en avatar.
    // No hay escalón intermedio.
    test: /\brounded-(?:[tblrse]{1,2}-)?(?:md|lg|xl|2xl|3xl)\b/,
    message:
      'Radio fuera del sistema. Solo rounded-none, rounded-sm, rounded-pill y rounded-full — regla § 1',
  },
  {
    id: 'shadow',
    test: /\bshadow-(?:2xs|xs|sm|md|lg|xl|2xl)\b/,
    message:
      'El sistema no tiene sombras: la profundidad la dan el borde de 1px y el degradado — regla § 1',
  },
];

/**
 * Devuelve el primer patrón que la cadena incumple, o `null`.
 *
 * Se exporta —y es lo único que se exporta aparte del plugin— para que
 * `design-system.test.mjs` pueda probar los patrones con cadenas, sin montar
 * un `RuleTester` ni un proyecto de TypeScript falso. La lógica que puede
 * equivocarse son los patrones; el visitante del AST son seis líneas.
 */
export function findViolation(text) {
  for (const pattern of PATTERNS) {
    const match = text.match(pattern.test);
    if (match) return { pattern, found: match[0] };
  }
  return null;
}

const noUntokenizedStyle = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prohíbe escribir colores, tamaños y radios fuera del sistema de diseño de globals.css',
    },
    schema: [],
  },

  create(context) {
    function check(node, text) {
      const violation = findViolation(text);
      if (!violation) return;

      context.report({
        node,
        message: `${violation.pattern.message}. Encontrado: «${violation.found}»`,
      });
    }

    return {
      // Cubre `className="..."`, los objetos de variantes de los primitivos y
      // cualquier cadena suelta. Es donde vive todo lo que se escapa.
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      // Los `className={`... ${x} ...`}` que concatenan clases.
      TemplateElement(node) {
        check(node, node.value.raw);
      },
    };
  },
};

export const designSystem = {
  meta: { name: 'fittraining-design-system' },
  rules: { 'no-untokenized-style': noUntokenizedStyle },
};
