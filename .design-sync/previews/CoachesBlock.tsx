import { CoachesBlock } from 'fittraining';

// La foto y el retrato de la web viven en `/fotos/`, que en Claude Design no
// existe: se ve el rayado del hueco.
export const Default = () => (
  <div className="bg-background">
    <CoachesBlock />
  </div>
);
