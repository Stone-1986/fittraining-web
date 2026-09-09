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
 */
describe('el cierre de la portada', () => {
  it('conserva literal el parrafo que dicto el humano', () => {
    render(<ClosingCta />);

    expect(
      screen.getByText(
        'Elige un plan, crea tu cuenta y ten tu primera sesión hoy mismo.',
      ),
    ).toBeInTheDocument();
  });
});
