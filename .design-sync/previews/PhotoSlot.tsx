import { PhotoSlot, buttonStyles } from 'fittraining';

// Sin foto, el hueco es el rayado del sistema con la etiqueta de lo que falta.
export const Empty = () => (
  <PhotoSlot label="FOTO DEL HÉROE · 2400×1400" className="relative h-64" />
);

export const EmptyRight = () => (
  <PhotoSlot
    label="FOTO DE PLAN · 1200×1400"
    align="right"
    className="relative h-64"
  />
);

// Texto encima de una foto: SIEMPRE con degradado. El lateral es el del heroe.
export const ScrimSide = () => (
  <PhotoSlot scrim="side" className="relative flex h-80 items-center px-8">
    <h2 className="text-h3 font-black">
      Entrena con <span className="text-primary">un plan real</span>
    </h2>
    <p className="mt-4 max-w-prose-doc text-body font-sans font-light text-muted-foreground">
      Planes creados por entrenadores certificados.
    </p>
  </PhotoSlot>
);

// El inferior es el de la tarjeta de plan: el texto se apoya abajo.
export const ScrimBottom = () => (
  <PhotoSlot
    scrim="bottom"
    className="relative flex h-80 flex-col justify-end p-6"
  >
    <p className="text-label font-sans font-semibold uppercase tracking-eyebrow text-primary">
      Principiante
    </p>
    <h3 className="mt-3 text-h4 font-bold">Correr tus primeros 5 km</h3>
    <span className={buttonStyles({ variant: 'link', className: 'mt-4' })}>
      Ver el plan →
    </span>
  </PhotoSlot>
);

// El retrato: `rounded-full` + `overflow-hidden` para que recorte la foto.
export const Avatar = () => (
  <div className="flex items-center gap-4 bg-background p-6">
    <PhotoSlot className="relative size-14 overflow-hidden rounded-full border border-border-strong" />
    <div>
      <p className="text-ui font-sans font-medium text-foreground">
        Tu entrenador
      </p>
      <p className="mt-1 font-mono text-label tracking-meta text-meta-foreground uppercase">
        Retrato · 400×400
      </p>
    </div>
  </div>
);
