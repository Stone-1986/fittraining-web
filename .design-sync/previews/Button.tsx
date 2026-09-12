import { Button, buttonStyles } from 'fittraining';

// Cada ejemplo lleva su propio `bg-background`: la tarjeta de preview es
// blanca y el sistema vive sobre negro carbon. En una pantalla lo pone el
// <body>. Van escritos enteros, sin helpers, porque el agente de Claude
// Design los copia tal cual desde el .prompt.md.

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-4 bg-background p-6">
    <Button variant="primary">Crear mi cuenta</Button>
    <Button variant="secondary">Ver planes</Button>
    <Button variant="neutral">Soy entrenador</Button>
    <Button variant="link">Leer el documento →</Button>
    <Button variant="destructive">Eliminar cuenta</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-4 bg-background p-6">
    <Button size="lg">Crear mi cuenta</Button>
    <Button size="md">Crear mi cuenta</Button>
    <Button size="sm" variant="neutral">
      Editar
    </Button>
  </div>
);

export const States = () => (
  <div className="flex flex-wrap items-center gap-4 bg-background p-6">
    <Button>Guardar</Button>
    <Button loading>Guardando…</Button>
    <Button disabled>Guardar</Button>
    <Button variant="secondary" disabled>
      Ver planes
    </Button>
  </div>
);

export const NavShape = () => (
  <div className="flex flex-wrap items-center gap-4 bg-background p-6">
    <Button variant="secondary" shape="rect">
      Registrarme
    </Button>
    <Button variant="secondary">Registrarme</Button>
  </div>
);

// Un enlace que navega es un <a>, no un <button>: toma prestada la
// apariencia con buttonStyles().
export const LinkAsButton = () => (
  <div className="flex flex-wrap items-center gap-4 bg-background p-6">
    <a
      href="#planes"
      className={buttonStyles({ variant: 'secondary', size: 'lg' })}
    >
      Elegir mi plan
    </a>
    <a href="#preguntas" className={buttonStyles({ variant: 'link' })}>
      Ver las preguntas →
    </a>
  </div>
);
