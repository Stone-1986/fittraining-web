import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HowItWorks } from './how-it-works';
import { STEPS } from '@/lib/landing-content';

/**
 * QUE PROTEGE ESTE ARCHIVO.
 *
 * Los pasos son la unica seccion donde la accesibilidad se resolvio con una
 * decision de fondo y no con un atributo: el numero «01 02 03» del canvas
 * mide 1.32:1 de contraste, y en vez de subir el gris se reconocio que es
 * DECORATIVO y REDUNDANTE —el orden ya lo comunica la lista— y se saco del
 * arbol de accesibilidad (decision D-3 del plan).
 *
 * Esa decision tiene dos mitades y solo funciona con las dos: el numero
 * `aria-hidden` Y la lista ordenada de verdad. Si alguien quita el `<ol>`
 * «porque la rejilla ya coloca las tarjetas», el orden desaparece para quien
 * no ve la pantalla y no queda nada que lo comunique — y con el numero
 * oculto, nadie se entera. Eso es lo que se prueba aqui.
 */

describe('los tres pasos', () => {
  it('son una lista con los pasos en orden', () => {
    render(<HowItWorks />);

    const items = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(items).toHaveLength(STEPS.length);
    items.forEach((item, i) => {
      expect(item).toHaveTextContent(STEPS[i].title);
    });
  });

  it('el orden lo comunica la lista, no el numero pintado', () => {
    const { container } = render(<HowItWorks />);

    // Es `<ol>` y no `<ul>`: un lector de pantalla anuncia «1 de 3», que es
    // exactamente lo que el «01» del diseño quiere decir y no puede decir,
    // porque esta oculto y ademas no tendria contraste suficiente.
    expect(screen.getByRole('list').tagName).toBe('OL');

    for (const numero of ['01', '02', '03']) {
      const pintado = [...container.querySelectorAll('p')].find(
        (p) => p.textContent === numero,
      );
      expect(pintado, `falta el numero ${numero}`).toBeDefined();
      expect(
        pintado?.closest('[aria-hidden="true"]'),
        `el numero ${numero} se anunciaria, y no tiene contraste para leerse`,
      ).not.toBeNull();
    }
  });

  it('cada paso lleva su titulo como encabezado y su explicacion en texto', () => {
    render(<HowItWorks />);

    for (const paso of STEPS) {
      expect(
        screen.getByRole('heading', { level: 3, name: paso.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(paso.description)).toBeVisible();
    }
  });
});
