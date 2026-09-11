import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClosingCta } from './closing-cta';

/**
 * QUE PROTEGE ESTE ARCHIVO, que es una sola cosa y muy concreta.
 *
 * El parrafo del cierre lo DICTO EL HUMANO, literal, en la revision 2 del
 * plan de W-10. No es copy que la cadena pueda mejorar: es la frase con la
 * que la portada cierra su argumento, y en este repo hay antecedente de
 * agentes reescribiendo texto de producto por su cuenta —los cuatro planes
 * inventados que esa misma revision borro—.
 *
 * Una frase cambiada no rompe el build, no rompe el lint y no baja la
 * cobertura: se despliega sin que nadie lo vea. Esto es lo que lo ve.
 *
 * LA FRASE CAMBIO EL 2026-09-10, y el cambio tambien lo decidio el humano.
 * La anterior —«...y ten tu primera sesion hoy mismo»— prometia una sesion el
 * mismo dia, y los Terminos § 6 dicen que la inscripcion la aprueba el
 * entrenador antes de que haya nada que ejecutar. Si este test vuelve a
 * cambiar, que sea por la misma via: un documento que dice otra cosa, no una
 * mejora de redaccion.
 */
describe('el cierre de la portada', () => {
  it('conserva literal el parrafo que dicto el humano', () => {
    render(<ClosingCta />);

    expect(
      screen.getByText(
        'Elige un plan, crea tu cuenta y empieza en cuanto tu entrenador apruebe tu inscripción.',
      ),
    ).toBeInTheDocument();
  });
});
