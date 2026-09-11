import { Button, Card, CardBody, CardTitle, PhotoSlot } from 'fittraining';

// Cada ejemplo lleva su propio `bg-background` (ver Button.tsx).

export const Basic = () => (
  <div className="bg-background p-6">
    <Card>
      <CardBody>
        <CardTitle>Fuerza en casa</CardTitle>
        <p className="mt-2.5 text-body font-sans font-light text-muted-foreground">
          Un plan de cuerpo completo con mancuernas y tu propio peso.
        </p>
        <p className="mt-5 font-mono text-label tracking-meta text-meta-foreground uppercase">
          12 semanas · 4 sesiones
        </p>
      </CardBody>
    </Card>
  </div>
);

export const WithPhoto = () => (
  <div className="bg-background p-6">
    <Card className="overflow-hidden">
      <PhotoSlot
        label="FOTO DE PLAN · 1200×1400"
        className="relative aspect-video"
      />
      <CardBody>
        <p className="text-label font-sans font-semibold uppercase tracking-eyebrow text-primary">
          Principiante
        </p>
        <CardTitle className="mt-3">Correr tus primeros 5 km</CardTitle>
        <p className="mt-2.5 text-body font-sans font-light text-muted-foreground">
          Tres salidas por semana, del paso a la carrera continua.
        </p>
      </CardBody>
    </Card>
  </div>
);

export const WithAction = () => (
  <div className="bg-background p-6">
    <Card>
      <CardBody>
        <CardTitle as="h2">Tu inscripción está pendiente</CardTitle>
        <p className="mt-2.5 text-body font-sans font-light text-muted-foreground">
          Tu entrenador revisa la solicitud. Te avisamos cuando la apruebe.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button variant="secondary">Ver el plan</Button>
          <Button variant="link">Cancelar solicitud</Button>
        </div>
      </CardBody>
    </Card>
  </div>
);

// `.grid-cards` es la unica rejilla del sistema: 4 columnas en escritorio,
// 2 en tableta, 1 en movil, sin puntos de quiebre escritos.
export const Grid = () => (
  <div className="bg-background p-6">
    <div className="grid-cards">
      <Card>
        <CardBody>
          <CardTitle>Fuerza en casa</CardTitle>
          <p className="mt-4 font-mono text-label tracking-meta text-meta-foreground uppercase">
            12 semanas · 4 sesiones
          </p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <CardTitle>Correr tus primeros 5 km</CardTitle>
          <p className="mt-4 font-mono text-label tracking-meta text-meta-foreground uppercase">
            8 semanas · 3 sesiones
          </p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <CardTitle>Movilidad diaria</CardTitle>
          <p className="mt-4 font-mono text-label tracking-meta text-meta-foreground uppercase">
            6 semanas · 5 sesiones
          </p>
        </CardBody>
      </Card>
    </div>
  </div>
);
