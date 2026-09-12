import { Hero } from 'fittraining';

// El heroe trae su propio fondo (la foto y el degradado lateral). La foto de
// la web vive en `/fotos/`, que en Claude Design no existe: se ve el rayado
// del hueco, que es el estado del sistema mientras no hay foto.
export const Default = () => (
  <div className="bg-background">
    <Hero />
  </div>
);
