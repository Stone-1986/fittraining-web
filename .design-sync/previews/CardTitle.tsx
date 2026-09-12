import { Card, CardBody, CardTitle } from 'fittraining';

// El titulo solo tiene sentido dentro de su tarjeta: se enseña compuesto.
export const Default = () => (
  <div className="bg-background p-6">
    <Card>
      <CardBody>
        <CardTitle>Fuerza en casa</CardTitle>
      </CardBody>
    </Card>
  </div>
);

// `as` decide el nivel del documento, no el tamaño: un h2 sigue a text-h4.
// OJO: agrandarlo con `className="text-h3"` NO funciona — el componente ya
// lleva `text-h4` y en la hoja compilada `.text-h4` va despues de `.text-h3`,
// asi que gana. Ver NOTES.md.
export const AsH2 = () => (
  <div className="bg-background p-6">
    <Card>
      <CardBody>
        <CardTitle as="h2">Tu inscripción está pendiente</CardTitle>
        <p className="mt-2.5 text-body font-sans font-light text-muted-foreground">
          Tu entrenador revisa la solicitud. Te avisamos cuando la apruebe.
        </p>
      </CardBody>
    </Card>
  </div>
);
