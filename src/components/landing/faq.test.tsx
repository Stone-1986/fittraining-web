import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Faq } from './faq';
import { FAQ } from '@/lib/landing-content';

/**
 * QUE PROTEGE ESTE ARCHIVO.
 *
 * El acordeon es la unica pieza de la portada con COMPORTAMIENTO, y lo
 * resuelve `<details>` nativo: cero JavaScript de cliente. Ese es justo el
 * riesgo — es la pieza a la que alguien le añadira un `useState` el dia que
 * quiera animar la apertura, y con el `'use client'` se llevaria por delante
 * la propiedad que W-10 defiende entera.
 *
 * Los tests de abajo comprueban el CONTRATO OBSERVABLE, no el elemento:
 * la respuesta esta oculta, se muestra al activar la pregunta, y se vuelve a
 * ocultar. Si mañana esto se implementara con JavaScript, seguirian pasando
 * — y esa es la idea: prueban lo que la persona experimenta. Lo que impide
 * el `'use client'` es el gate del tamano del bundle, no un test.
 */

describe('el acordeon de preguntas', () => {
  it('empieza cerrado: ninguna respuesta se ve de entrada', () => {
    render(<Faq />);

    for (const entrada of FAQ) {
      expect(screen.getByText(entrada.answer)).not.toBeVisible();
    }
  });

  it('se abre y se cierra al activar la pregunta, sin JavaScript propio', async () => {
    render(<Faq />);
    const usuario = userEvent.setup();

    const primera = FAQ[0];
    const pregunta = screen.getByText(primera.question);

    await usuario.click(pregunta);
    expect(screen.getByText(primera.answer)).toBeVisible();

    await usuario.click(pregunta);
    expect(screen.getByText(primera.answer)).not.toBeVisible();
  });

  it('abrir una pregunta no cierra las demas', async () => {
    render(<Faq />);
    const usuario = userEvent.setup();

    await usuario.click(screen.getByText(FAQ[0].question));
    await usuario.click(screen.getByText(FAQ[1].question));

    // `<details>` sueltos, sin `name` compartido: quien esta comparando dos
    // respuestas no pierde la primera al abrir la segunda.
    expect(screen.getByText(FAQ[0].answer)).toBeVisible();
    expect(screen.getByText(FAQ[1].answer)).toBeVisible();
  });

  it('la pregunta es lo que se activa, y es un elemento nativo de apertura', () => {
    const { container } = render(<Faq />);

    // Esto SI mira el elemento, y a proposito: el teclado (Enter y Espacio),
    // el estado anunciado como «contraido/expandido» y el buscar-en-pagina
    // del navegador vienen de que sea `<details><summary>`. Con un `<div>` y
    // un `onClick` el raton seguiria funcionando y el teclado no, que es
    // precisamente el fallo que no se ve al probar a mano.
    const resumenes = [...container.querySelectorAll('details > summary')];

    expect(
      resumenes.map((s) => s.textContent?.replace(/[+−]/g, '').trim()),
    ).toEqual(FAQ.map((entrada) => entrada.question));
  });

  it('el signo «+ / −» no se anuncia: lo dice ya el propio control', () => {
    const { container } = render(<Faq />);

    for (const signo of [...container.querySelectorAll('summary span')]) {
      expect(
        signo.closest('[aria-hidden="true"]'),
        `«${signo.textContent}» se leeria en voz alta`,
      ).not.toBeNull();
    }
  });

  it('las respuestas de salud dejan el documento legal a un clic', async () => {
    render(<Faq />);
    const usuario = userEvent.setup();

    // Estan reescritas en tuteo a partir del consentimiento de datos de
    // salud; el enlace es lo que permite comprobar el texto exacto, y por eso
    // tiene que estar dentro de la respuesta que lo necesita, no suelto al
    // final de la seccion.
    for (const entrada of FAQ) {
      if (!entrada.source) continue;

      await usuario.click(screen.getByText(entrada.question));
      const detalle = screen
        .getByText(entrada.answer)
        .closest('details') as HTMLElement;

      const enlace = within(detalle).getByRole('link', {
        name: new RegExp(entrada.source.label, 'i'),
      });
      expect(enlace).toHaveAttribute('href', entrada.source.href);
    }
  });
});
