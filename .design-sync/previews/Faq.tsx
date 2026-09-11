import { Faq } from 'fittraining';

// La seccion no pinta fondo propio: en la portada lo pone el <body>.
export const Default = () => (
  <div className="bg-background">
    <Faq />
  </div>
);
