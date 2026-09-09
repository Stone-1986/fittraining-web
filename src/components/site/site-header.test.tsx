import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './site-header';

/**
 * QUE PROTEGE ESTE ARCHIVO.
 *
 * La barra es donde mas facil es romper dos reglas del repo a la vez:
 *
 *   1. «Un enlace que navega es `<Link>`; un boton que ejecuta es
 *      `<button>`». «REGISTRARME» PARECE un boton —usa `buttonStyles()`— y no
 *      lo es ni lo sera: el dia que exista `/registro` sera un enlace. Si
 *      alguien lo convierte en `<button>` por parecerse mas al canvas, se
 *      pierden el clic derecho, el abrir en otra pestaña y lo que el lector
 *      de pantalla anuncia, y la barra sigue viendose identica.
 *   2. Lo que la barra promete. La revision 2 devuelve los cinco elementos
 *      del canvas, pero tres de ellos —«Planes», «Iniciar sesion» y
 *      «REGISTRARME»— no tienen pagina detras todavia y se dibujan INERTES.
 *      Un enlace de mas aqui es un 404 en la portada, y ningun gate lo ve.
 */

describe('la barra del sitio', () => {
  it('dibuja los cinco elementos del canvas', () => {
    render(<SiteHeader active="inicio" />);

    // `getAllBy`: la barra ancha y el menu estrecho pintan la misma lista, y
    // el navegador oculta uno de los dos con CSS que jsdom no aplica.
    for (const etiqueta of [
      'Inicio',
      'Planes',
      'Preguntas',
      'Iniciar sesión',
      'Registrarme',
    ]) {
      expect(
        screen.getAllByText(etiqueta).length,
        `«${etiqueta}» no esta en la barra`,
      ).toBeGreaterThan(0);
    }
  });

  it('solo navega lo que tiene pagina o ancla detras', () => {
    render(<SiteHeader active="inicio" />);

    // Los dos que si navegan.
    for (const enlace of screen.getAllByRole('link', { name: 'Inicio' })) {
      expect(enlace).toHaveAttribute('href', '/');
    }
    for (const enlace of screen.getAllByRole('link', { name: 'Preguntas' })) {
      expect(enlace).toHaveAttribute('href', '#preguntas');
    }

    // Los tres que todavia no. Ni enlace ni boton: se dibujan y punto,
    // marcados con `[sin-destino]` en el componente. Este test falla el dia
    // que alguien les ponga un `href` — que es el dia en que hay que
    // comprobar que la pagina existe de verdad.
    for (const inerte of [/^planes$/i, /iniciar sesión/i, /registrarme/i]) {
      expect(screen.queryByRole('link', { name: inerte })).toBeNull();
      expect(screen.queryByRole('button', { name: inerte })).toBeNull();
    }
  });

  it('la barra ancha y el menu estrecho ofrecen exactamente lo mismo', () => {
    render(<SiteHeader active="inicio" />);

    // Son dos listas distintas en el DOM —el navegador oculta una con CSS
    // segun el ancho— y salen de un solo array a proposito. El fallo que esto
    // atrapa es el de siempre: alguien toca la barra ancha, se olvida del
    // menu, y en telefono desaparece «Registrarme». Nadie lo ve, porque quien
    // revisa mira el escritorio.
    const navs = screen.getAllByRole('navigation', { name: 'Principal' });
    expect(navs, 'la barra ancha y el menu estrecho').toHaveLength(2);

    const contenidos = navs.map((nav) =>
      [...nav.children].map((pieza) => pieza.textContent?.trim()),
    );

    expect(contenidos[0]).toEqual([
      'Inicio',
      'Planes',
      'Preguntas',
      'Iniciar sesión',
      'Registrarme',
    ]);
    expect(contenidos[1], 'el menu estrecho ofrece menos que la barra').toEqual(
      contenidos[0],
    );
  });

  it('marca la seccion actual, y solo esa', () => {
    render(<SiteHeader active="inicio" />);

    // `aria-current` es lo unico que le dice a quien no ve la pantalla en que
    // parte del sitio esta; sin el, el resaltado cian no comunica nada
    // (WCAG 1.4.1: nunca solo con color).
    for (const enlace of screen.getAllByRole('link', { name: 'Inicio' })) {
      expect(enlace).toHaveAttribute('aria-current', 'page');
    }
    for (const enlace of screen.getAllByRole('link', { name: 'Preguntas' })) {
      expect(enlace).not.toHaveAttribute('aria-current');
    }
  });
});
