import Link from 'next/link';
import { buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

/**
 * Pagina de verificacion del despliegue. Sigue sin ser la landing (W-10).
 *
 * Se reescribio con el sistema 1.0: el titulo pasa a la escala del sistema
 * (`text-h3`) y el segundo boton, que era `ghost`, pasa a `neutral` — la
 * variante `ghost` desaparecio del sistema porque un boton sin caja ni borde
 * sobre fondo negro no se distingue de un parrafo.
 */
export default function Home() {
  return (
    <Container
      size="prose"
      className="flex min-h-screen flex-col items-center justify-center gap-4 text-center"
    >
      <h1 className="text-h3 font-black">fittraining</h1>
      <p className="text-body text-muted-foreground">
        Despliegue verificado. Esta pagina existe para comprobar que Amplify
        construye esta version de Next; no es la landing (W-10).
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <Link href="/legal" className={buttonStyles({ variant: 'primary' })}>
          Documentos legales
        </Link>
        <Link href="/estilo" className={buttonStyles({ variant: 'neutral' })}>
          Sistema de diseño
        </Link>
      </div>
    </Container>
  );
}
