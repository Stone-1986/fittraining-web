import { SectionHeading } from 'fittraining';

export const Default = () => (
  <div className="bg-background p-8">
    <SectionHeading
      eyebrow="Cómo funciona"
      title="Tres pasos y estás entrenando"
    />
  </div>
);

export const WithLead = () => (
  <div className="bg-background p-8">
    <SectionHeading
      eyebrow="Entrenadores"
      title="Detrás de cada plan hay alguien que responde"
    />
    <p className="mt-5 max-w-prose-doc text-lead font-sans font-light text-muted-foreground">
      Cada plan lo publica un entrenador que sigue el progreso de sus atletas
      inscritos.
    </p>
  </div>
);
