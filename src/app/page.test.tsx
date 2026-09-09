import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home, { metadata } from './page';
import { FAQ, STEPS } from '@/lib/landing-content';
import { LEGAL_DOCUMENTS } from '@/lib/legal';

/**
 * QUE PROTEGE ESTE ARCHIVO.
 *
 * La portada no tiene logica: es composicion. Por eso aqui NO se comprueba
 * «que React renderice» —eso no atrapa nada—, sino las cuatro cosas que
 * pueden romperse en silencio, sin que el build ni el lint digan una palabra:
 *
 *   1. Un enlace que apunta a una pagina que no existe o a un ancla que ya no
 *      esta. Es lo que el plan prohibe desde el principio —ninguna pieza de
 *      la portada lleva a un 404—, y un 404 no rompe ningun gate.
 *   2. La jerarquia de encabezados. Un `h2` que alguien convierte en `h4`
 *      «porque se ve mejor» deja el indice del lector de pantalla con un
 *      salto de nivel, y la pagina sigue construyendo igual.
 *   3. Las notas de produccion de los huecos de foto («FOTO · ...»). Son
 *      recordatorios para el equipo, no contenido: si pierden su
 *      `aria-hidden`, un lector de pantalla empieza a leer «FOTO HEROE
 *      ATLETA ENTRENANDO TONO OSCURO 2400x1400».
 *   4. El pie legal. Se genera desde `LEGAL_DOCUMENTS`; si alguien lo
 *      escribe a mano, deja de seguir al catalogo y acaba enlazando un
 *      documento retirado.
 *
 * Se consulta por ROL y por TEXTO ACCESIBLE, nunca por clase: un test que se
 * rompe al renombrar una clase de Tailwind no estaba probando nada.
 */

/** Los `<a>` del documento, que es lo que de verdad navega. */
function anchors(container: HTMLElement) {
  return [...container.querySelectorAll('a')];
}

describe('la portada', () => {
  it('presenta las cuatro secciones en el orden del plan', () => {
    render(<Home />);

    // El orden importa: es el argumento de la pagina —como funciona, quien
    // esta detras, que dudas quedan, y la llamada—. La seccion de planes ya
    // no esta: la quito la revision 2, y este test lo fija.
    const titulares = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent);

    expect(titulares).toEqual([
      'Tres pasos y estás entrenando',
      'Detrás de cada plan hay alguien que responde',
      'Antes de registrarte',
      'Empieza esta semana',
    ]);
  });

  it('tiene un unico h1 y ningun salto de nivel', () => {
    const { container } = render(<Home />);

    const niveles = [...container.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(
      (h) => Number(h.tagName[1]),
    );

    expect(niveles.filter((n) => n === 1)).toHaveLength(1);
    expect(niveles[0], 'la pagina abre con su h1').toBe(1);

    // Bajar de nivel se hace de uno en uno; subir puede saltar (cerrar tres
    // secciones a la vez es legitimo). El TAMANO del texto no interviene:
    // un <h2 className="text-h3"> es correcto y por eso no se mira la clase.
    niveles.forEach((nivel, i) => {
      if (i === 0) return;
      expect(
        nivel - niveles[i - 1],
        `salto de h${niveles[i - 1]} a h${nivel}`,
      ).toBeLessThanOrEqual(1);
    });
  });

  it('ningun enlace lleva a ninguna parte', () => {
    const { container } = render(<Home />);

    // La regla de W-10: la portada no promete una pantalla que no existe.
    // Los unicos destinos legitimos son la propia portada, un ancla que
    // exista en ella, y los documentos legales publicados.
    //
    // Si un item futuro añade una ruta —`/planes`, `/registro`,
    // `/iniciar-sesion`— este test falla a proposito: hay que añadirla aqui,
    // y esa linea es la prueba de que la ruta existe de verdad.
    const rutas = new Set(['/', ...LEGAL_DOCUMENTS.map((d) => `/${d.slug}`)]);

    for (const a of anchors(container)) {
      const href = a.getAttribute('href') ?? '';

      if (href.startsWith('#')) {
        expect(
          container.querySelector(`[id="${href.slice(1)}"]`),
          `«${a.textContent?.trim()}» salta a ${href}, que no existe en la pagina`,
        ).not.toBeNull();
        continue;
      }

      expect(rutas, `«${a.textContent?.trim()}» apunta a ${href}`).toContain(
        href,
      );
    }
  });

  it('no invita al entrenador a una pantalla que no existe', () => {
    render(<Home />);

    // ESTE TEST SE INVIRTIO, y conviene saber por que antes de tocarlo.
    //
    // El heroe llevaba «¿Eres entrenador? Publica tu plan». Sobrevivio a D-1
    // como texto sin enlace —la pantalla de publicacion no existe— y aun asi
    // el Lider Tecnico tuvo que subir a bloqueante su subrayado: un
    // `border-b` bajo un texto de accion promete la misma pantalla, solo que
    // con CSS. El humano acabo retirando la frase entera (2026-09-09).
    //
    // Antes esto comprobaba que la frase estaba y no era un control. Ahora
    // comprueba que NO esta, en ninguna forma: ni texto, ni enlace, ni boton.
    // Falla el dia que alguien la reponga, que es justo cuando hay que
    // preguntarse si ya existe la pantalla del entrenador — porque si existe,
    // vuelve como <Link> de verdad y este test se actualiza con ella.
    expect(screen.queryByText(/publica tu plan/i)).toBeNull();
    expect(screen.queryByText(/eres entrenador/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /publica tu plan/i })).toBeNull();
    expect(
      screen.queryByRole('button', { name: /publica tu plan/i }),
    ).toBeNull();
  });

  it('las llamadas a la accion se dibujan, pero todavia no navegan', () => {
    render(<Home />);

    // Revision 2 del plan: el atleta se registrara desde la web, asi que la
    // portada ya dice «Crear mi cuenta» —en el heroe y en el cierre— en vez
    // de mandar a una seccion de planes que ya no existe. Pero la pantalla
    // de registro TAMPOCO existe todavia, y la regla que no cambia es que
    // nada de esta pagina lleve a un 404.
    //
    // El test de arriba no basta: comprueba los `href` que hay, no los que
    // alguien añada apuntando a `/registro` antes de que la ruta exista.
    // Este falla en ese momento, que es justo cuando hay que mirar.
    expect(screen.getAllByText('Crear mi cuenta')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: /crear mi cuenta/i })).toBeNull();
    expect(
      screen.queryByRole('button', { name: /crear mi cuenta/i }),
    ).toBeNull();
  });

  it('todo enlace tiene nombre accesible', () => {
    render(<Home />);

    // `getAllByRole` ignora lo que esta `aria-hidden`, asi que esto recorre
    // solo lo que un lector de pantalla anuncia de verdad. Un enlace sin
    // nombre se anuncia como «enlace» a secas y no se puede decidir si
    // seguirlo.
    for (const enlace of screen.getAllByRole('link')) {
      expect(enlace.textContent?.trim(), enlace.outerHTML).not.toBe('');
    }
  });

  it('las notas de produccion de los huecos de foto no se anuncian', () => {
    const { container } = render(<Home />);

    // Mientras no hay fotos, cada hueco lleva escrito que falta y en que
    // tamano. Es una nota para el equipo: el dia que llegue la imagen, su
    // sitio lo ocupa un `alt`. Hasta entonces esta fuera del arbol de
    // accesibilidad, y aqui se comprueba que sigue estandolo.
    const notas = [...container.querySelectorAll('p')].filter((p) =>
      /^FOTO/.test(p.textContent ?? ''),
    );

    expect(notas.length, 'la portada dibuja huecos de foto').toBeGreaterThan(0);
    for (const nota of notas) {
      expect(
        nota.closest('[aria-hidden="true"]'),
        `«${nota.textContent}» se anunciaria al lector de pantalla`,
      ).not.toBeNull();
    }
  });

  it('todo lo que recibe el foco tiene nombre accesible', () => {
    const { container } = render(<Home />);

    // El test de arriba solo mira los enlaces. Lo que recibe el foco en esta
    // pagina es mas: los `<summary>` del acordeon y el del menu estrecho
    // tambien tabulan, y el del menu lleva su texto junto a un «+» que va
    // `aria-hidden`. Si alguien deja el control solo con el signo —el caso
    // clasico del boton de icono— se sigue viendo igual, se sigue pudiendo
    // pulsar, y quien no ve la pantalla oye «boton» a secas.
    const focusables = [
      ...container.querySelectorAll(
        'a[href], button, summary, input, select, textarea, [tabindex]',
      ),
    ];

    expect(
      focusables.length,
      'la portada tiene algo que tabular',
    ).toBeGreaterThan(0);

    for (const control of focusables) {
      // El nombre accesible de estos controles sale de su contenido, y lo que
      // esta `aria-hidden` no cuenta: por eso se descarta antes de mirar.
      const visible = control.cloneNode(true) as HTMLElement;
      visible
        .querySelectorAll('[aria-hidden="true"]')
        .forEach((oculto) => oculto.remove());

      const nombre = (
        control.getAttribute('aria-label') ??
        visible.textContent ??
        ''
      )
        .replace(/\s+/g, ' ')
        .trim();

      expect(nombre, control.outerHTML.slice(0, 160)).not.toBe('');
    }
  });

  it('tutea en toda la pagina, tambien donde el texto vive en el JSX', () => {
    const { container } = render(<Home />);

    // `landing-content.test.ts` ya comprueba el tuteo, pero SOLO del archivo
    // de datos —los tres pasos y las tres preguntas—. La otra mitad de la
    // copy visible esta escrita en los componentes: el parrafo del heroe, el
    // de entrenadores, el del cierre y las etiquetas de la barra. Un «usted»
    // ahi no lo ve ningun test, ningun gate y ninguna regla de ESLint: el
    // tono es lo que la maquina no puede distinguir sola.
    const texto = (container.textContent ?? '').replace(/\s+/g, ' ');

    expect(texto).not.toMatch(/\busted(es)?\b/i);
    // Y lo demas que la regla § 6 prohibe en el producto.
    expect(texto).not.toContain('!');
    expect(texto).not.toContain('¡');
    expect(texto).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('no anuncia un catalogo de planes que la portada ya no ensena', () => {
    const { container } = render(<Home />);

    // La revision 2 borro la seccion de planes, y con ella los cuatro tipos
    // provisionales. Quedo detras una frase que seguia contandolos —«Cuatro
    // tipos, con duracion, nivel y sesiones…»— en una pagina que ya no
    // enseñaba ninguno. Se corrigio a mano; esto es lo que impide que vuelva,
    // aqui o en cualquier otro texto de la portada.
    //
    // El dia que exista la pagina de planes y la portada pueda volver a
    // contarlos, este test falla a proposito: se actualiza entonces, con la
    // pagina delante.
    const texto = (container.textContent ?? '').toLowerCase();

    expect(
      texto,
      'la portada afirma cuantos planes hay y no enseña ninguno',
    ).not.toMatch(/\b(un|dos|tres|cuatro|cinco|seis|\d+)\s+(tipos|planes)\b/);
  });

  it('la metadata tampoco promete planes que la portada no ensena', () => {
    // ESTE TEST EXISTE POR UN PUNTO CIEGO, no por completitud.
    //
    // El de arriba, y el de tono, consultan `container.textContent`: el DOM
    // renderizado. `metadata` NO esta en el DOM — la consume Next para el
    // <head>, el buscador y la previsualizacion de un enlace compartido. Por
    // construccion, ningun test que mire la pagina renderizada podia ver que
    // `metadata.description` seguia prometiendo planes «a la vista» despues
    // de que la revision 2 borrara la seccion. Paso con los cinco gates en
    // verde y lo encontro una persona leyendo.
    //
    // Por eso importa el export como modulo en vez de buscarlo en la pagina.
    const descripcion = (metadata.description ?? '').toString().toLowerCase();

    expect(
      descripcion,
      'la metadata promete los datos del plan «a la vista» y la portada no enseña ninguno',
    ).not.toContain('a la vista');

    expect(
      descripcion,
      'la metadata afirma cuantos planes hay y la portada no enseña ninguno',
    ).not.toMatch(/\b(un|dos|tres|cuatro|cinco|seis|\d+)\s+(tipos|planes)\b/);
  });

  it('el pie enlaza los cinco documentos legales del catalogo', () => {
    render(<Home />);

    // Salen de `LEGAL_DOCUMENTS`, no escritos a mano: si alguien publica un
    // documento nuevo tiene que aparecer aqui solo, y si retira uno tiene que
    // desaparecer. Escrito a mano es como se acaba enlazando un documento
    // que ya no existe.
    const pie = within(screen.getByRole('navigation', { name: /legales/i }));

    for (const doc of LEGAL_DOCUMENTS) {
      expect(pie.getByRole('link', { name: doc.navLabel })).toHaveAttribute(
        'href',
        `/${doc.slug}`,
      );
    }
    expect(pie.getAllByRole('link')).toHaveLength(LEGAL_DOCUMENTS.length);
  });

  it('el contenido visible sale de `landing-content.ts`', () => {
    render(<Home />);

    // No es un test de renderizado: es lo que ata la portada al archivo de
    // datos. El dia que lleguen los planes reales se sustituye ese archivo y
    // la pagina tiene que cambiar con el; si alguien duplica el texto en el
    // JSX, esta prueba deja de tener sentido y el reemplazo se olvida a
    // medias.
    for (const paso of STEPS) {
      expect(
        screen.getByRole('heading', { level: 3, name: paso.title }),
      ).toBeInTheDocument();
    }
    for (const entrada of FAQ) {
      expect(screen.getByText(entrada.question)).toBeInTheDocument();
    }
  });
});
