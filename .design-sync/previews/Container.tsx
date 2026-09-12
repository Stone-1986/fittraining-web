import { Container } from 'fittraining';

// El contenedor no pinta nada: la columna se marca con el borde del sistema
// para que se vea donde empieza y acaba cada ancho.

export const Prose = () => (
  <div className="bg-background py-6">
    <Container size="prose">
      <div className="border-x border-primary py-6">
        <p className="font-mono text-label tracking-meta text-meta-foreground uppercase">
          prose · 620px
        </p>
        <p className="mt-3 text-body font-sans font-light text-muted-foreground">
          El límite de línea de un párrafo. Para texto largo: una respuesta, un
          documento, una nota del entrenador.
        </p>
      </div>
    </Container>
  </div>
);

export const Wide = () => (
  <div className="bg-background py-6">
    <Container size="wide">
      <div className="border-x border-primary py-6">
        <p className="font-mono text-label tracking-meta text-meta-foreground uppercase">
          wide · 1120px
        </p>
        <p className="mt-3 text-body font-sans font-light text-muted-foreground">
          Rejillas de tarjetas y el panel del entrenador.
        </p>
      </div>
    </Container>
  </div>
);

export const Full = () => (
  <div className="bg-background py-6">
    <Container size="full">
      <div className="border-x border-primary py-6">
        <p className="font-mono text-label tracking-meta text-meta-foreground uppercase">
          full · sin límite
        </p>
        <p className="mt-3 text-body font-sans font-light text-muted-foreground">
          El modo de la portada: bloques a sangre con solo el margen lateral de
          56px (32px en pantalla estrecha).
        </p>
      </div>
    </Container>
  </div>
);
