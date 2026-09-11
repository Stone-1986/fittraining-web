import Link from 'next/link';
import type { Metadata } from 'next';
import { Button, buttonStyles } from '@/components/ui/button';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { formatToken, readDesignTokens } from '@/lib/design-tokens';

/**
 * LA GUIA VIVA DEL SISTEMA DE DISENO.
 *
 * No es documentacion: es el sistema funcionando. Cada muestra de abajo usa
 * los mismos tokens y los mismos componentes que las paginas de verdad, asi
 * que no puede quedarse desactualizada — si alguien rompe el boton, se ve
 * roto aqui.
 *
 * ES EL ESPEJO DEL CANVAS `docs/sistema_diseno/`. Las secciones llevan la
 * misma numeracion a proposito: cuando alguien discuta un detalle, el canvas
 * y esta pagina se abren al lado y se comparan sin traducir nada.
 *
 * PARA QUE SIRVE EN LA PRACTICA, que es lo que justifica su existencia:
 *   - Ver todo junto revela las incoherencias que por separado no se notan.
 *     Un radio que no pega, un gris de mas, dos cianes que compiten.
 *   - Cuando haya que decidir «que boton uso aqui», la respuesta se mira, no
 *     se recuerda.
 *   - Es donde se comprueba de una pasada que ningun estado se comunica solo
 *     con color, en vez de ir pantalla por pantalla.
 *
 * MANDA CERO JAVASCRIPT AL NAVEGADOR, igual que las paginas legales, y eso
 * es deliberado: si la guia del sistema necesitara `'use client'` para
 * enseñar sus propios componentes, seria la prueba de que los componentes
 * exigen cliente sin motivo.
 *
 * NO SE INDEXA (`robots: index: false`). Es una herramienta interna que vive
 * en produccion por comodidad —siempre disponible, siempre al dia— pero no
 * tiene nada que hacer en un buscador.
 *
 * SEGURIDAD DE LA RUTA: `/estilo` es un segmento estatico y por tanto gana
 * siempre contra el `[slug]` dinamico de los documentos legales, que vive en
 * la raiz. No hay colision. Es la misma razon por la que `/legal` funciona.
 */
export const metadata: Metadata = {
  title: 'Sistema de diseño — fittraining',
  robots: { index: false, follow: false },
};

/* --------------------------------------------------------------------------
 * LOS DATOS DE LA GUIA
 *
 * Van en constantes y no escritos a mano en el JSX por una razon concreta:
 * una tabla de veinte tokens escrita a mano se desincroniza en cuanto alguien
 * añade el vigesimo primero. Aqui se añade una fila y ya.
 *
 * El contraste NO se escribe a ojo: son los numeros medidos contra el fondo
 * real de cada token. Si se cambia un color, se vuelven a medir — es la
 * regla § 1 de rulesFrontend.md, y esta columna es donde se nota si no se
 * hizo.
 * ------------------------------------------------------------------------- */

const SURFACES = [
  {
    cls: 'bg-background',
    token: 'background',
    use: 'El lienzo. Todo se apoya aquí.',
  },
  {
    cls: 'bg-card',
    token: 'card',
    use: 'Superficie sobre el lienzo.',
  },
  {
    cls: 'bg-muted',
    token: 'muted',
    use: 'Superficie alta: cabecera de tabla, hover.',
  },
  {
    cls: 'bg-border',
    token: 'border',
    use: 'Separador. Decorativo, sin requisito.',
  },
  {
    cls: 'bg-border-strong',
    token: 'border-strong',
    use: 'Separador con más presencia.',
  },
  {
    cls: 'bg-input',
    token: 'input',
    use: 'Límite de lo que se opera. 3.11:1 (WCAG 1.4.11).',
  },
  {
    cls: 'bg-decorative',
    token: 'decorative',
    // Es el unico token del sistema cuya ficha lleva una advertencia, y esta
    // aqui justamente para eso: un token que solo vive en el CSS es un token
    // que alguien reutilizara mal. Mide 1.32:1 — no es un descuido, es lo que
    // produce el efecto de numero fantasma de «Cómo funciona», y por eso ese
    // numero va aria-hidden dentro de un <ol> que ya comunica el orden.
    use: 'SOLO DECORATIVO. 1.32:1: nunca para texto que informe de algo.',
  },
] as const;

const BRAND = [
  {
    cls: 'bg-primary',
    token: 'primary',
    use: 'LA acción. El canvas lo llama «acento».',
  },
  {
    cls: 'bg-primary-hover',
    token: 'primary-hover',
    use: 'Hover. También el anillo de foco.',
  },
  {
    cls: 'bg-primary-pressed',
    token: 'primary-pressed',
    use: 'Presionado.',
  },
  {
    cls: 'bg-primary-soft',
    token: 'primary-soft',
    use: 'Fondo de insignia, con cian encima.',
  },
] as const;

const TEXT_LEVELS = [
  {
    cls: 'text-title',
    token: 'title',
    ratio: '19.48:1',
    use: 'Titulares y texto sobre el botón cian. Solo ahí.',
  },
  {
    cls: 'text-foreground',
    token: 'foreground',
    ratio: '16.36:1',
    use: 'Cuerpo fuerte. El texto por defecto.',
  },
  {
    cls: 'text-muted-foreground',
    token: 'muted-foreground',
    ratio: '9.08:1',
    use: 'Cuerpo secundario, párrafos de apoyo.',
  },
  {
    cls: 'text-subtle-foreground',
    token: 'subtle-foreground',
    ratio: '6.72:1',
    use: 'Terciario: navegación inactiva.',
  },
  {
    cls: 'text-meta-foreground',
    token: 'meta-foreground',
    ratio: '5.02:1',
    use: 'Metadatos monoespaciados.',
  },
  {
    cls: 'text-disabled-foreground',
    token: 'disabled-foreground',
    ratio: '3.29:1',
    use: 'Deshabilitado. Exento por WCAG 1.4.3.',
  },
] as const;

const SEMANTIC = [
  {
    cls: 'text-success',
    token: 'success',
    ratio: '10.78:1',
    label: 'sesión registrada',
  },
  {
    cls: 'text-warning',
    token: 'warning',
    ratio: '11.61:1',
    label: 'plan por vencer',
  },
  {
    cls: 'text-destructive',
    token: 'destructive',
    ratio: '6.41:1',
    label: 'dato inválido',
  },
  {
    cls: 'text-info',
    token: 'info',
    ratio: '8.60:1',
    label: 'nota del entrenador',
  },
] as const;

const TYPE_SCALE = [
  {
    cls: 'text-display font-black',
    name: 'text-display',
    spec: 'Archivo 900 · 96 / .95 / -.02em',
    sample: 'Entrena con un plan real',
  },
  {
    cls: 'text-h2 font-extrabold',
    name: 'text-h2',
    spec: 'Archivo 800 · 52 / 1.05',
    sample: 'Tres pasos y estás entrenando',
  },
  {
    cls: 'text-h3 font-black',
    name: 'text-h3',
    spec: 'Archivo 900 · 34 / 1',
    sample: 'RUNNING',
  },
  {
    cls: 'text-h4 font-bold',
    name: 'text-h4',
    spec: 'Archivo 700 · 22 / 1.2',
    sample: 'Elige tu plan',
  },
  {
    cls: 'text-lead font-sans font-light text-muted-foreground',
    name: 'text-lead',
    spec: 'Barlow 300 · 21 / 1.5',
    sample:
      'Planes creados por entrenadores certificados, con seguimiento semana a semana.',
  },
  {
    cls: 'text-body font-sans font-light text-muted-foreground',
    name: 'text-body',
    spec: 'Barlow 300 · 17 / 1.55',
    sample:
      // El especimen decia «Cuatro tipos, con duracion, nivel y sesiones por
      // semana a la vista». Se cambia por decision del Lider Tecnico, y el
      // criterio importa mas que el texto: un especimen ensena tambien un
      // MODELO DE REDACCION, esta en caja listo para copiarse, y /estilo es
      // la pagina que el equipo abre para decidir como se escribe. Esa frase
      // sobrevivio a la seccion de planes en tres sitios distintos siguiendo
      // esa misma ruta. El canvas manda en la FORMA, nunca en los hechos —
      // mismo criterio con el que se retiraron el «+9» y la insignia
      // «POPULAR»—, y de un especimen lo que hay que conservar es la
      // longitud (69 caracteres frente a 67), no el contenido.
      'Ves la duración, el nivel y las sesiones por semana antes de decidir.',
  },
  {
    cls: 'text-ui font-sans font-medium',
    name: 'text-ui',
    spec: 'Barlow 500 · 15 / 1.2',
    sample: 'Planes · Entrenadores · Precios · Preguntas',
  },
  {
    cls: 'text-label font-sans font-semibold uppercase tracking-eyebrow text-primary',
    name: 'text-label',
    spec: 'Barlow 600 · 12 / .32em',
    sample: 'Cómo funciona',
  },
  // LOS DOS DE MARCA NO SON ESCALONES DE LECTURA, y por eso van al final y
  // separados: la escala de arriba ordena la jerarquia del documento, y un
  // logotipo no participa de ella — tiene proporciones fijas por definicion.
  // Estan aqui por la misma razon que `decorative` esta en la tabla de
  // superficies: un token que solo vive en el CSS es un token que alguien
  // reutilizara mal, y `brand-tag` (9px) es el mas apetecible del sistema
  // para quien busque «algo pequenito».
  {
    cls: 'font-heading text-brand-mark font-black',
    name: 'text-brand-mark',
    spec: 'MARCA · Archivo 900 · 26 / 1 / .02em',
    sample: 'FITTRAINING',
  },
  {
    cls: 'text-brand-tag font-sans font-medium uppercase tracking-brand text-meta-foreground',
    name: 'text-brand-tag',
    spec: 'MARCA · Barlow 500 · 9 / .42em — SOLO el logotipo',
    sample: 'Planes de entrenamiento',
  },
] as const;

const SPACING = [
  { w: 'w-1', name: '4 · xs', use: 'Separación dentro de una etiqueta.' },
  { w: 'w-2', name: '8 · sm', use: 'Chips y puntos de paginación.' },
  { w: 'w-4', name: '16 · md', use: 'Botones entre sí, rejillas de tarjeta.' },
  { w: 'w-6', name: '24 · lg', use: 'Interior de tarjeta compacta.' },
  { w: 'w-8', name: '32 · xl', use: 'Columnas de una rejilla de contenido.' },
  { w: 'w-14', name: '56 · 2xl', use: 'Margen lateral de página.' },
  { w: 'w-24', name: '96 · 3xl', use: 'Aire vertical entre secciones.' },
] as const;

const MOTION = [
  {
    value: '160 ms',
    name: 'Hover',
    use: 'Color y borde. Curva ease-out. Es el valor por defecto de toda transición.',
  },
  {
    value: '240 ms',
    name: 'Entrada',
    use: 'Paneles y acordeones: solo opacidad y 8px de desplazamiento.',
  },
  {
    value: '6 s',
    name: 'Carrusel',
    use: 'Cambio automático con fundido. Se detiene al pasar el cursor.',
  },
  {
    value: 'Nunca',
    name: 'Prohibido',
    use: 'Rebotes, escalados en hover, parallax y cualquier cosa de más de 400 ms.',
  },
] as const;

/* --------------------------------------------------------------------------
 * PIEZAS LOCALES DE LA GUIA
 *
 * Viven en este archivo y no en `components/ui/` a proposito: solo sirven
 * para maquetar esta pagina. Subirlas a `ui/` seria crear un primitivo que
 * usa un unico sitio, que es la abstraccion prematura que prohibe la regla
 * § 5 (no abstraer antes de la tercera repeticion).
 * ------------------------------------------------------------------------- */

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-16">
      <p className="text-label font-sans font-semibold uppercase tracking-eyebrow text-primary">
        {n}
      </p>
      <h2 className="mt-4 text-h2 font-extrabold">{title}</h2>
      <div className="mt-11">{children}</div>
    </section>
  );
}

/** El rótulo monoespaciado de metadato: 12px, tracking .08em, gris apagado. */
function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-label tracking-meta text-meta-foreground">
      {children}
    </span>
  );
}

/**
 * EL SUBTITULO DE UNA SECCION DE LA GUIA, y el sitio donde vive la excepcion
 * que lo justifica — porque si no se escribe aqui, no la encuentra nadie.
 *
 * VA EN MAYUSCULAS Y ES UN ENCABEZADO, y § 6 dice «mayusculas completas solo
 * en botones, etiquetas y metadatos. Nunca en un titular». No se contradicen:
 * el NIVEL lo decide la jerarquia del documento y el ASPECTO lo deciden las
 * clases. Son dos decisiones distintas, y § Accesibilidad ya lo dice para el
 * caso simetrico —un `<h2 className="text-h4">` es correcto—. Esto es un `h3`
 * porque cuelga del `h2` de su seccion, y se dibuja con `text-label` porque
 * lo que rotula es una tabla de muestras, no un tramo de lectura: es una
 * etiqueta que ademas ordena.
 *
 * Se extrae en vez de repetir la clase cuatro veces por lo mismo que `Grid`
 * —§ 5 permite abstraer a partir de la tercera repeticion— y porque una
 * excepcion copiada cuatro veces se acaba corrigiendo en tres.
 */
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-11 text-label font-sans font-medium uppercase tracking-label text-subtle-foreground">
      {children}
    </h3>
  );
}

/**
 * La rejilla del sistema, envuelta para no repetir la clase en cada seccion.
 *
 * La regla vive en `globals.css` como `.grid-cards`; esto solo le pone
 * nombre en el JSX. Se extrae porque se repite en nueve secciones — muy por
 * encima de la tercera repeticion a partir de la cual la regla § 5 permite
 * abstraer.
 */
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid-cards">{children}</div>;
}

export default function EstiloPage() {
  // Se lee una vez, en el build. Ver `src/lib/design-tokens.ts`.
  const tokens = readDesignTokens();
  const value = (token: string) => formatToken(tokens, `--${token}`);

  return (
    <Container size="wide" className="pb-24">
      {/* --- Portada ------------------------------------------------------ */}
      <header className="pt-18 pb-14">
        <p className="font-heading text-h4 font-black text-title">
          FIT<span className="text-primary">TRAINING</span>
        </p>
        <p className="mt-1 text-label font-sans font-medium uppercase tracking-brand text-meta-foreground">
          Planes de entrenamiento
        </p>
        <h1 className="mt-8 text-h2 font-black">Sistema de diseño</h1>
        <p className="mt-5 max-w-prose-doc text-lead font-sans font-light text-muted-foreground">
          Las reglas visuales de fittraining: color, tipografía, espaciado,
          componentes y estados. Esta página no describe el sistema — lo usa.
          Todo lo que ve aquí sale de los mismos tokens que las páginas reales.
        </p>
        <p className="mt-6">
          <Meta>
            VERSIÓN 1.0 · ESPEJO DE docs/sistema_diseño/ · CERO JS DE CLIENTE
          </Meta>
        </p>
      </header>

      {/* --- 01 Fundamentos ----------------------------------------------- */}
      <Section
        n="01 · Fundamentos"
        title="Cuatro decisiones que no se negocian"
      >
        <Grid>
          {[
            [
              'Fondo oscuro siempre',
              'La interfaz vive sobre negro carbón. No hay modo claro, y por eso no hay ni una clase «dark:» en el repo. La foto es la que aporta luz.',
            ],
            [
              'Un solo acento',
              'El cian marca lo accionable y el dato clave. Si todo es cian, nada lo es: como mucho un botón primario por vista.',
            ],
            [
              'Titulares pesados',
              'Archivo 800/900 en tamaños grandes. El contraste de peso hace la jerarquía, no el color.',
            ],
            [
              'Bloques a sangre',
              'Las secciones se separan con una línea de 1px. Ni tarjetas flotantes ni sombras: no existe un token de sombra.',
            ],
          ].map(([title, body], i) => (
            <div
              key={title}
              className={`border-t-2 pt-5 ${i === 0 ? 'border-primary' : 'border-border'}`}
            >
              <h3 className="text-h4 font-bold">{title}</h3>
              <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </Grid>
      </Section>

      {/* --- 02 Color ------------------------------------------------------ */}
      <Section n="02 · Color" title="Paleta">
        <p className="max-w-prose-doc text-body font-sans font-light text-muted-foreground">
          Cada muestra lleva su contraste medido contra el fondo real. Cambiar
          un color obliga a volver a medirlo — si esta columna no se actualiza,
          la regla no se cumplió.
        </p>

        <SubHeading>Superficies y límites</SubHeading>
        <div className="mt-4">
          <Grid>
            {SURFACES.map((s) => (
              <Card key={s.token}>
                <div className={`h-24 ${s.cls}`} />
                <CardBody className="border-t border-border">
                  <p className="text-ui font-sans font-semibold text-title">
                    {s.token}
                  </p>
                  <p className="mt-2">
                    <Meta>{value(s.token)}</Meta>
                  </p>
                  <p className="mt-2 text-body font-sans font-light text-muted-foreground">
                    {s.use}
                  </p>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </div>

        <SubHeading>
          Marca — el canvas lo llama «acento»; el código, «primary»
        </SubHeading>
        <div className="mt-4">
          <Grid>
            {BRAND.map((s) => (
              <Card key={s.token}>
                <div className={`h-24 ${s.cls}`} />
                <CardBody className="border-t border-border">
                  <p className="text-ui font-sans font-semibold text-title">
                    {s.token}
                  </p>
                  <p className="mt-2">
                    <Meta>{value(s.token)}</Meta>
                  </p>
                  <p className="mt-2 text-body font-sans font-light text-muted-foreground">
                    {s.use}
                  </p>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </div>

        <SubHeading>Texto — cinco niveles, no dos</SubHeading>
        <div className="mt-4 border border-border">
          {TEXT_LEVELS.map((t) => (
            <div
              key={t.token}
              className="grid gap-2 border-b border-border p-5 last:border-b-0 md:grid-cols-[16rem_7rem_1fr] md:items-baseline"
            >
              <p className={`text-lead font-sans ${t.cls}`}>{t.token}</p>
              <Meta>{t.ratio}</Meta>
              <p className="text-body font-sans font-light text-muted-foreground">
                {t.use}
              </p>
            </div>
          ))}
        </div>

        <SubHeading>
          Semánticos — solo para estado, nunca decorativos
        </SubHeading>
        <p className="mt-3 max-w-prose-doc text-body font-sans font-light text-muted-foreground">
          Ninguno aparece solo: WCAG 1.4.1 prohíbe comunicar algo únicamente con
          color, así que el punto siempre va con su texto al lado. Es el
          requisito, no un adorno.
        </p>
        <div className="mt-4">
          <Grid>
            {SEMANTIC.map((s) => (
              <Card key={s.token}>
                <CardBody>
                  <p className={`text-ui font-sans font-medium ${s.cls}`}>
                    <span aria-hidden="true">● </span>
                    {s.label}
                  </p>
                  <p className="mt-3">
                    <Meta>
                      {s.token} · {s.ratio}
                    </Meta>
                  </p>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </div>

        <div className="mt-11 grid gap-6 md:grid-cols-2">
          <Card>
            <CardBody>
              <p className="text-label font-sans font-semibold uppercase tracking-label text-success">
                Sí
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-body font-sans font-light text-muted-foreground">
                <li>
                  Cian para el botón principal, el enlace y el dato del plan.
                </li>
                <li>Blanco puro solo en titulares y sobre el botón cian.</li>
                <li>Semánticos en insignias y mensajes de validación.</li>
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-label font-sans font-semibold uppercase tracking-label text-destructive">
                No
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-body font-sans font-light text-muted-foreground">
                <li>Degradados de dos tintes de marca ni cian sobre cian.</li>
                <li>
                  Texto cian sobre superficie clara o sobre foto sin scrim.
                </li>
                <li>Colores nuevos fuera de esta tabla.</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* --- 03 Tipografia ------------------------------------------------- */}
      <Section n="03 · Tipografía" title="Dos familias, un monoespaciado">
        <Grid>
          <Card>
            <CardBody>
              <p className="font-heading text-h3 font-black text-title">
                Archivo
              </p>
              <p className="mt-3">
                <Meta>DISPLAY · 700 / 800 / 900</Meta>
              </p>
              <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                Titulares, números grandes y etiquetas de plan. Nunca por debajo
                de 20px: a tamaño pequeño un peso 900 se empasta.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="font-sans text-h3 font-normal text-title">Barlow</p>
              <p className="mt-3">
                <Meta>TEXTO E INTERFAZ · 300 / 400 / 500 / 600</Meta>
              </p>
              <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                Párrafos en 300, interfaz en 500, botones y etiquetas en 600.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="font-mono text-h4 text-title">ui-monospace</p>
              <p className="mt-3">
                <Meta>METADATOS · 12px · tracking .08em</Meta>
              </p>
              <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                Semanas, sesiones, versiones. Siempre en gris apagado. No se
                auto-hospeda: usa la del sistema, que ya está instalada.
              </p>
            </CardBody>
          </Card>
        </Grid>

        <div className="mt-11 border border-border">
          {TYPE_SCALE.map((t) => (
            <div
              key={t.name}
              className="grid gap-4 border-b border-border p-5 last:border-b-0 md:grid-cols-[14rem_1fr] md:items-center"
            >
              <div>
                <Meta>{t.name}</Meta>
                <p className="mt-1">
                  <Meta>{t.spec}</Meta>
                </p>
              </div>
              <p className={t.cls}>{t.sample}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-prose-doc text-body font-sans font-light text-subtle-foreground">
          Regla de ancho de línea: un párrafo no pasa de 620px, que es lo que
          devuelve{' '}
          <code className="font-mono text-label">
            Container size=&quot;prose&quot;
          </code>
          . Los titulares llevan{' '}
          <code className="font-mono text-label">text-wrap: balance</code> y los
          párrafos <code className="font-mono text-label">pretty</code>; los dos
          están puestos globalmente, no hay que acordarse.
        </p>
      </Section>

      {/* --- 04 Espaciado -------------------------------------------------- */}
      <Section n="04 · Espaciado y rejilla" title="Escala de 4">
        <div className="space-y-3">
          {SPACING.map((s) => (
            <div key={s.name} className="flex items-center gap-5">
              <span className="w-28 shrink-0">
                <Meta>{s.name}</Meta>
              </span>
              <span className={`h-4 shrink-0 bg-primary ${s.w}`} />
              <span className="text-ui font-sans font-light text-subtle-foreground">
                {s.use}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-11">
          <Grid>
            <Card>
              <CardBody>
                <CardTitle>Rejilla</CardTitle>
                <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                  12 columnas, canal de 24px, margen lateral de 56px que baja a
                  32px en pantalla estrecha. Los bloques de imagen y las franjas
                  de plan van a sangre completa: esos no entran en un Container.
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Puntos de quiebre</CardTitle>
                <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                  Las rejillas se declaran con{' '}
                  <code className="font-mono text-label text-foreground">
                    repeat(auto-fit, minmax(320px, 1fr))
                  </code>
                  : cuatro columnas en escritorio, dos en tableta, una en móvil,
                  sin huecos huérfanos y sin escribir un solo breakpoint.
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Radios</CardTitle>
                <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                  Cuatro, y se reparten por tipo de pieza: 0 en bloques y
                  tarjetas, 2px en el botón rectangular de la barra, pastilla en
                  el botón de acción, círculo en el avatar. Sin sombras.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="flex h-11 items-center border border-border-strong px-4 text-label text-subtle-foreground">
                    0
                  </span>
                  <span className="flex h-11 items-center rounded-sm border border-border-strong px-4 text-label text-subtle-foreground">
                    2px
                  </span>
                  <span className="flex h-11 items-center rounded-pill border border-border-strong px-4 text-label text-subtle-foreground">
                    pastilla
                  </span>
                  <span className="flex size-11 items-center justify-center rounded-full border border-border-strong text-label text-subtle-foreground">
                    50%
                  </span>
                </div>
              </CardBody>
            </Card>
          </Grid>
        </div>
      </Section>

      {/* --- 05 Botones ---------------------------------------------------- */}
      <Section n="05 · Botones" title="Jerarquía y estados">
        <p className="max-w-prose-doc text-body font-sans font-light text-muted-foreground">
          Un solo botón primario por vista. Mayúsculas, Barlow 600, tracking
          .14em y 44px de alto mínimo. Pase el cursor y tabule sobre ellos: el
          hover, el estado presionado y el anillo de foco son los del sistema,
          no una captura.
        </p>

        <div className="mt-11 space-y-8">
          {(
            [
              [
                'primary',
                'Relleno cian. LA acción de la pantalla.',
                'Crear cuenta',
              ],
              [
                'secondary',
                'Borde cian. La alternativa importante.',
                'Ver planes',
              ],
              ['neutral', 'Borde gris. La salida lateral.', 'Soy entrenador'],
              ['link', 'Texto con flecha. Acción terciaria.', 'Ver plan →'],
              [
                'destructive',
                'Borra algo que no se deshace. No está en el canvas: lo pide el producto.',
                'Eliminar cuenta',
              ],
            ] as const
          ).map(([variant, note, label]) => (
            <div key={variant} className="border-t border-border pt-6">
              <p className="text-ui font-sans font-semibold text-title">
                {variant}
              </p>
              <p className="mt-1 text-body font-sans font-light text-muted-foreground">
                {note}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button variant={variant}>{label}</Button>
                <Button variant={variant} disabled>
                  {label}
                </Button>
                <Button variant={variant} loading>
                  Guardando…
                </Button>
              </div>
              <p className="mt-3">
                <Meta>NORMAL · DESHABILITADO · CARGANDO</Meta>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-11">
          <Grid>
            <Card>
              <CardBody>
                <CardTitle>Tamaños</CardTitle>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Button size="lg">Grande</Button>
                  <Button size="md">Medio</Button>
                  <Button size="sm">Chico</Button>
                </div>
                <p className="mt-4 text-body font-sans font-light text-muted-foreground">
                  Grande solo en héroe y cierre. Chico solo dentro de tablas y
                  paneles: es el único que no llega a 44px, y por eso nunca
                  lleva la acción principal de una pantalla.
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Botón rectangular</CardTitle>
                <div className="mt-4">
                  <Button variant="secondary" shape="rect" size="sm">
                    Registrarme
                  </Button>
                </div>
                <p className="mt-4 text-body font-sans font-light text-muted-foreground">
                  Reservado a la barra de navegación, donde la pastilla compite
                  con el logotipo. Fuera de la barra, es pastilla.
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Enlace con aspecto de botón</CardTitle>
                <div className="mt-4">
                  <Link
                    href="/legal"
                    className={buttonStyles({ variant: 'secondary' })}
                  >
                    Documentos legales
                  </Link>
                </div>
                <p className="mt-4 text-body font-sans font-light text-muted-foreground">
                  Un enlace que navega sigue siendo un enlace y solo toma
                  prestada la apariencia con buttonStyles(). Convertirlo en
                  botón rompería el clic derecho y el lector de pantalla.
                </p>
              </CardBody>
            </Card>
          </Grid>
        </div>
      </Section>

      {/* --- 07 Componentes ------------------------------------------------ */}
      <Section n="07 · Componentes" title="Piezas del producto">
        <Grid>
          {/* Tarjeta de plan: foto + scrim + contenido abajo */}
          <Card>
            <p className="border-b border-border px-5 py-4">
              <Meta>TARJETA DE PLAN</Meta>
            </p>
            <div className="photo-slot relative flex min-h-72 flex-col justify-end p-6">
              <div
                className="scrim-bottom absolute inset-0"
                aria-hidden="true"
              />
              <div className="relative">
                <h3 className="text-h3 font-black">RUNNING</h3>
                <p className="mt-3 text-label font-sans font-medium uppercase tracking-label text-primary">
                  12 semanas · 4 ses/sem
                </p>
                <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                  De cero a diez kilómetros con carga progresiva.
                </p>
                <p className="mt-5 text-action font-sans font-semibold uppercase tracking-label text-primary">
                  Ver plan →
                </p>
              </div>
            </div>
          </Card>

          {/* Insignias y etiquetas */}
          <Card>
            <p className="border-b border-border px-5 py-4">
              <Meta>INSIGNIAS Y ETIQUETAS</Meta>
            </p>
            <CardBody className="flex flex-wrap items-center gap-3">
              <span className="bg-primary px-3 py-1.5 text-label font-sans font-semibold uppercase tracking-eyebrow text-primary-foreground">
                Popular
              </span>
              <span className="bg-primary-soft px-3 py-1.5 text-label font-sans font-semibold uppercase tracking-label text-primary">
                Inscrito
              </span>
              <span className="rounded-pill border border-border-strong px-4 py-1.5 text-ui font-sans font-normal text-foreground">
                principiante
              </span>
              <span className="rounded-pill border border-border-strong px-4 py-1.5 text-ui font-sans font-normal text-foreground">
                4 ses/sem
              </span>
            </CardBody>
          </Card>

          {/* Acordeon: <details> nativo, cero JS */}
          <Card>
            <p className="border-b border-border px-5 py-4">
              <Meta>ACORDEÓN · &lt;details&gt; NATIVO, CERO JS</Meta>
            </p>
            <CardBody>
              {[
                [
                  '¿Necesito equipo en casa?',
                  'No. Las ocho semanas están diseñadas con peso corporal.',
                ],
                [
                  '¿Puedo cambiar de plan?',
                  'Sí, en cualquier momento. Tu progreso no se pierde.',
                ],
              ].map(([q, a]) => (
                <details key={q} className="group border-t border-border">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lead font-sans font-normal text-foreground">
                    {q}
                    <span
                      className="text-h4 text-primary group-open:hidden"
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <span
                      className="hidden text-h4 text-primary group-open:inline"
                      aria-hidden="true"
                    >
                      −
                    </span>
                  </summary>
                  <p className="pb-4 text-body font-sans font-light text-muted-foreground">
                    {a}
                  </p>
                </details>
              ))}
            </CardBody>
          </Card>

          {/* Progreso */}
          <Card>
            <p className="border-b border-border px-5 py-4">
              <Meta>PROGRESO Y DATOS</Meta>
            </p>
            <CardBody>
              <div className="flex justify-between">
                <Meta>SEMANA 7 DE 12</Meta>
                <Meta>58%</Meta>
              </div>
              {/* `role="img"` con `aria-label`: la barra es una imagen de datos,
                  y sin nombre accesible un lector de pantalla solo anuncia dos
                  divs vacios. El porcentaje ya esta arriba en texto, asi que el
                  color no es el unico canal. */}
              <div
                className="mt-3 h-1.5 bg-border"
                role="img"
                aria-label="Progreso del plan: semana 7 de 12, 58 por ciento"
              >
                <div className="h-1.5 w-[58%] bg-primary" />
              </div>
              <p className="mt-5 text-body font-sans font-light text-muted-foreground">
                El dato va en texto además de en la barra. Un porcentaje que
                solo existe como longitud no se puede leer en voz alta.
              </p>
            </CardBody>
          </Card>

          {/* Tabla */}
          <Card>
            <p className="border-b border-border px-5 py-4">
              <Meta>TABLA</Meta>
            </p>
            <CardBody>
              <table className="w-full border border-border text-left">
                <thead className="bg-muted">
                  <tr className="text-label font-sans font-semibold uppercase tracking-label text-subtle-foreground">
                    <th className="p-3 font-semibold">Plan</th>
                    <th className="border-l border-border p-3 font-semibold">
                      Semanas
                    </th>
                    <th className="border-l border-border p-3 font-semibold">
                      Ses/sem
                    </th>
                  </tr>
                </thead>
                <tbody className="text-ui font-sans text-foreground">
                  {[
                    ['Running', '12', '4'],
                    ['Híbrido', '16', '5'],
                  ].map(([plan, weeks, sessions]) => (
                    <tr key={plan} className="border-t border-border">
                      <td className="p-3">{plan}</td>
                      <td className="tabular border-l border-border p-3">
                        {weeks}
                      </td>
                      <td className="tabular border-l border-border p-3">
                        {sessions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-body font-sans font-light text-muted-foreground">
                Las cifras llevan la clase{' '}
                <code className="font-mono text-label">tabular</code>: sin ella
                bailan de fila en fila y la columna deja de compararse de un
                vistazo.
              </p>
            </CardBody>
          </Card>

          {/* Formulario */}
          <Card>
            <p className="border-b border-border px-5 py-4">
              <Meta>CAMPO Y VALIDACIÓN</Meta>
            </p>
            <CardBody className="space-y-6">
              <div>
                <label
                  htmlFor="muestra-correo"
                  className="text-label font-sans font-medium uppercase tracking-label text-subtle-foreground"
                >
                  Correo
                </label>
                <input
                  id="muestra-correo"
                  type="email"
                  defaultValue="correo@ejemplo.com"
                  className="mt-2 block w-full border border-input bg-card p-4 text-ui text-foreground placeholder:text-disabled-foreground focus:border-primary"
                />
                <p className="mt-2 text-ui font-sans font-light text-meta-foreground">
                  La etiqueta va siempre fuera del campo.
                </p>
              </div>
              <div>
                <label
                  htmlFor="muestra-error"
                  className="text-label font-sans font-medium uppercase tracking-label text-destructive"
                >
                  Con error
                </label>
                <input
                  id="muestra-error"
                  type="email"
                  defaultValue="correo@ejemplo"
                  aria-invalid="true"
                  aria-describedby="muestra-error-ayuda"
                  className="mt-2 block w-full border border-destructive bg-card p-4 text-ui text-foreground"
                />
                {/* El mensaje no es solo rojo: lo enlaza `aria-describedby`,
                    asi que un lector de pantalla lo anuncia al enfocar. El
                    color por si solo incumpliria WCAG 1.4.1. */}
                <p
                  id="muestra-error-ayuda"
                  className="mt-2 text-ui font-sans text-destructive"
                >
                  Falta el dominio del correo.
                </p>
              </div>
            </CardBody>
          </Card>
        </Grid>
      </Section>

      {/* --- 08 Imagen ----------------------------------------------------- */}
      <Section n="08 · Imagen" title="La foto es la única textura">
        <p className="max-w-prose-doc text-body font-sans font-light text-muted-foreground">
          Nunca va texto directamente sobre una foto: siempre un degradado de
          protección en medio. Las dos formas son clases globales, porque un
          degradado es color y el color solo vive en globals.css.
        </p>
        <div className="mt-11">
          <Grid>
            <div className="photo-slot relative min-h-64 border border-border">
              <div className="scrim-side absolute inset-0" aria-hidden="true" />
              <p className="absolute bottom-5 left-5">
                <Meta>.scrim-side · HÉROE</Meta>
              </p>
            </div>
            <div className="photo-slot relative min-h-64 border border-border">
              <div
                className="scrim-bottom absolute inset-0"
                aria-hidden="true"
              />
              <p className="absolute bottom-5 left-5">
                <Meta>.scrim-bottom · TARJETA</Meta>
              </p>
            </div>
            <Card>
              <CardBody>
                <CardTitle>Reglas de foto</CardTitle>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-body font-sans font-light text-muted-foreground">
                  <li>Escenas reales de entrenamiento, luz dura, tono frío.</li>
                  <li>Siempre un degradado de protección antes del texto.</li>
                  <li>Héroe 2400×1400, tarjeta 1200×1400, retrato 400×400.</li>
                  <li>Sin filtros de color de marca sobre la piel.</li>
                  <li>Nunca texto sobre la zona más clara de la imagen.</li>
                </ul>
                <p className="mt-4">
                  <Meta>
                    MIENTRAS NO HAYA FOTOS, VA .photo-slot CON LA ETIQUETA DE LO
                    QUE FALTA
                  </Meta>
                </p>
              </CardBody>
            </Card>
          </Grid>
        </div>
      </Section>

      {/* --- 09 Movimiento ------------------------------------------------- */}
      <Section n="09 · Movimiento" title="Discreto y corto">
        <Grid>
          {MOTION.map((m) => (
            <Card key={m.name}>
              <CardBody>
                <Meta>{m.name.toUpperCase()}</Meta>
                <p className="mt-3 text-h3 font-extrabold">{m.value}</p>
                <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                  {m.use}
                </p>
              </CardBody>
            </Card>
          ))}
        </Grid>
        <p className="mt-6 max-w-prose-doc text-body font-sans font-light text-subtle-foreground">
          Quien pide menos movimiento en su sistema operativo lo recibe: hay un
          bloque{' '}
          <code className="font-mono text-label">prefers-reduced-motion</code>{' '}
          global que anula toda animación, para no depender de que cada
          componente futuro se acuerde.
        </p>
      </Section>

      {/* --- 10 Accesibilidad ---------------------------------------------- */}
      <Section n="10 · Accesibilidad" title="Mínimos obligatorios">
        <Grid>
          {[
            [
              'Contraste 4.5:1',
              'Texto normal sobre su fondo real, incluida la foto ya oscurecida. Titulares grandes y límites de control, 3:1. Los números están medidos en la sección 02.',
            ],
            [
              'Foco visible',
              'Anillo de 2px en cian claro con 3px de separación, puesto una vez en globals.css para todo el sitio. Nunca se anula con outline: none.',
            ],
            [
              'Área de toque 44px',
              'Alto mínimo de una acción. El tamaño chico (36px) existe solo para tablas densas y nunca lleva la acción principal.',
            ],
            [
              'Nunca solo color',
              'Los estados llevan texto o icono además del color: «sesión registrada», no solo el punto verde. Es WCAG 1.4.1, no una preferencia.',
            ],
          ].map(([title, body], i) => (
            <div
              key={title}
              className={`border-t-2 pt-5 ${i === 0 ? 'border-primary' : 'border-border'}`}
            >
              <h3 className="text-h4 font-bold">{title}</h3>
              <p className="mt-3 text-body font-sans font-light text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </Grid>
      </Section>

      {/* --- 11 Tono ------------------------------------------------------- */}
      <Section n="11 · Tono y contenido" title="Cómo escribimos">
        <Grid>
          <Card>
            <CardBody>
              <CardTitle>Reglas</CardTitle>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-body font-sans font-light text-muted-foreground">
                <li>
                  Español y tuteo en el producto. Frases cortas, en presente.
                </li>
                <li>
                  Los documentos legales son la excepción: van en «usted», como
                  ya están publicados.
                </li>
                <li>
                  Mayúsculas completas solo en botones, etiquetas y metadatos.
                </li>
                <li>
                  Cifras concretas: «12 semanas», «4 sesiones», no «muchas».
                </li>
                <li>Sin emoji, sin exclamaciones, sin jerga de gimnasio.</li>
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-label font-sans font-semibold uppercase tracking-label text-success">
                Así sí
              </p>
              <div className="mt-4 space-y-3 text-lead font-sans font-light text-foreground">
                <p>«De cero a diez kilómetros en 12 semanas.»</p>
                <p>
                  «Tu entrenador ve tu progreso y ajusta lo que haga falta.»
                </p>
                <p>«Elige un plan y crea tu cuenta.»</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-label font-sans font-semibold uppercase tracking-label text-destructive">
                Así no
              </p>
              <div className="mt-4 space-y-3 text-lead font-sans font-light text-subtle-foreground">
                <p>«¡Transforma tu vida hoy mismo!»</p>
                <p>«La plataforma líder en soluciones fitness.»</p>
                <p>«Da el primer paso hacia la mejor versión de ti.»</p>
              </div>
            </CardBody>
          </Card>
        </Grid>
      </Section>

      <footer className="flex flex-wrap items-end justify-between gap-6 border-t border-border pt-6">
        <div>
          <p className="font-heading text-h4 font-black text-title">
            FIT<span className="text-primary">TRAINING</span>
          </p>
          <p className="mt-2 text-ui font-sans font-light text-meta-foreground">
            Sistema de diseño · versión 1.0
          </p>
        </div>
        <p className="max-w-md text-right">
          <Meta>
            FUENTES: ARCHIVO Y BARLOW VÍA next/font · TOKENS:
            src/app/globals.css · CANVAS: docs/sistema_diseño/
          </Meta>
        </p>
      </footer>
    </Container>
  );
}
