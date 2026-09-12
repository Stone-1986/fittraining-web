import { Card, CardBody, CardTitle } from 'fittraining';

// CardBody es el interior de 24px de la tarjeta: se enseña dentro de ella.
export const Default = () => (
  <div className="bg-background p-6">
    <Card>
      <CardBody>
        <CardTitle>Sesión 3 · Tren inferior</CardTitle>
        <p className="mt-2.5 text-body font-sans font-light text-muted-foreground">
          Sentadilla, peso muerto rumano y zancadas. Descansa 90 segundos entre
          series.
        </p>
      </CardBody>
    </Card>
  </div>
);

// Dos cuerpos separados por el borde del sistema: cabecera y detalle.
export const Stacked = () => (
  <div className="bg-background p-6">
    <Card>
      <CardBody className="border-b border-border">
        <CardTitle>Semana 4</CardTitle>
      </CardBody>
      <CardBody>
        <p className="font-mono text-label tracking-meta text-meta-foreground uppercase">
          3 de 4 sesiones registradas
        </p>
      </CardBody>
    </Card>
  </div>
);
