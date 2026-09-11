import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhotoSlot } from './photo-slot';

/**
 * QUE PROTEGE ESTE ARCHIVO.
 *
 * `PhotoSlot` tiene dos estados —el hueco vacio con su nota de produccion y
 * la foto ya puesta— y una REGLA DEL SISTEMA que no se ve en el render:
 * nunca texto directamente sobre una foto, siempre el degradado en medio.
 * Esa regla es un ORDEN DE CAPAS, y un orden se rompe moviendo tres lineas
 * sin que falle el build, el lint ni el tipo. Esto es lo que lo ve.
 *
 * Lo otro que vigila es `sizes`. El tipo ya lo hace obligatorio, pero el tipo
 * solo comprueba que se pasa: aqui se comprueba que LLEGA al `<img>`, que es
 * lo que decide si a un telefono le cae el archivo de 2400px.
 */
describe('PhotoSlot sin foto', () => {
  it('pinta la nota de produccion y ninguna imagen', () => {
    const { container } = render(<PhotoSlot label="FOTO HÉROE · 2400×1400" />);

    expect(screen.getByText('FOTO HÉROE · 2400×1400')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('deja el rayado del sistema como fondo del hueco', () => {
    const { container } = render(<PhotoSlot label="FOTO" />);

    expect(container.firstElementChild).toHaveClass('photo-slot');
  });
});

describe('PhotoSlot con foto', () => {
  it('pinta la imagen con su alt y sin la nota de produccion', () => {
    render(
      <PhotoSlot
        src="/entrenador.jpg"
        alt="Entrenadora corrigiendo la postura de una atleta"
        sizes="100vw"
      />,
    );

    expect(
      screen.getByAltText('Entrenadora corrigiendo la postura de una atleta'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/FOTO/)).not.toBeInTheDocument();
  });

  it('traslada `sizes` al <img>, que es lo que evita servir 2400px a un movil', () => {
    render(
      <PhotoSlot
        src="/entrenador.jpg"
        alt=""
        sizes="(min-width: 768px) 50vw, 100vw"
      />,
    );

    // Decorativa: `alt=""` la saca del arbol de accesibilidad, asi que no hay
    // rol por el que buscarla. Es exactamente lo que se quiere.
    const img = document.querySelector('img');
    expect(img).toHaveAttribute('sizes', '(min-width: 768px) 50vw, 100vw');
  });

  it('deja una foto decorativa fuera del arbol de accesibilidad', () => {
    render(<PhotoSlot src="/heroe.jpg" alt="" sizes="100vw" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('el degradado de proteccion', () => {
  it('se pinta POR ENCIMA de la foto, nunca debajo', () => {
    const { container } = render(
      <PhotoSlot src="/heroe.jpg" alt="" sizes="100vw" scrim="side" />,
    );

    const capas = Array.from(container.firstElementChild!.children);
    const imagen = capas.findIndex((n) => n.tagName === 'IMG');
    const degradado = capas.findIndex((n) =>
      n.classList.contains('scrim-side'),
    );

    expect(imagen).toBeGreaterThanOrEqual(0);
    expect(degradado).toBeGreaterThan(imagen);
  });

  it('el contenido se pinta POR ENCIMA del degradado', () => {
    const { container } = render(
      <PhotoSlot src="/plan.jpg" alt="" sizes="100vw" scrim="bottom">
        <p>Plan de fuerza</p>
      </PhotoSlot>,
    );

    const capas = Array.from(container.firstElementChild!.children);
    const degradado = capas.findIndex((n) =>
      n.classList.contains('scrim-bottom'),
    );
    const contenido = capas.findIndex(
      (n) => n.textContent === 'Plan de fuerza',
    );

    expect(contenido).toBeGreaterThan(degradado);
  });

  it('es decorativo y no lo anuncia el lector de pantalla', () => {
    const { container } = render(<PhotoSlot label="FOTO" scrim="side" />);

    expect(container.querySelector('.scrim-side')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
