import type { Metadata } from 'next';
import { ClosingCta } from '@/components/landing/closing-cta';
import { CoachesBlock } from '@/components/landing/coaches';
import { Faq } from '@/components/landing/faq';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { SiteFooter } from '@/components/site/site-footer';
import { LEGAL_DOCUMENTS } from '@/lib/legal';

/**
 * LA PORTADA PUBLICA (W-10).
 *
 * ES ESTATICA: no pide nada a `fitmess-api` y no manda una sola linea de
 * JavaScript de cliente. Lo segundo no es casualidad ni presumir — es la vara
 * de medir que ya cumplen las paginas legales y `/estilo`, y aqui se sostiene
 * con dos decisiones: el acordeon es `<details>` nativo y el menu estrecho de
 * la barra tambien.
 *
 * POR QUE NO HAY DATOS DE LA API: de los 73 endpoints de `fitmess-api`, nueve
 * son publicos —salud, registro, login, refresh, invitacion y contraseña— y
 * NINGUNO expone planes ni entrenadores. `/catalog/plans` existe pero exige
 * `JwtAuthGuard`, asi que una pagina publica no puede pedirlo. El contenido
 * vive tipado en `src/lib/landing-content.ts`.
 *
 * NO HAY SECCION DE PLANES (revision 2 del plan de W-10). La habia, con
 * contenido provisional que el asistente propuso al planificar; el humano
 * decidio quitarla: los planes reales no existen todavia y una portada no
 * anuncia lo que no puede cumplir. Habra pagina de planes mas adelante, y
 * hasta entonces «Planes» sigue en la barra pero inerte.
 *
 * ESTA PAGINA SOLO COMPONE. La regla § 3 le prohibe logica de negocio: pide
 * los datos, elige el orden de las secciones y pasa el catalogo legal al pie
 * —que no lo busca el, tambien por la regla § 3—.
 *
 * EL HEROE VA FUERA DE `<main>` A PROPOSITO: lleva la barra dentro, y un
 * `<header>` dentro de `<main>` pierde su papel de banner. El pie, igual.
 */
export const metadata: Metadata = {
  title: 'fittraining — planes de entrenamiento con seguimiento',
  // OJO AL EDITAR ESTO: `metadata.description` es texto de PRODUCTO, no
  // configuracion. Es lo que publica el buscador y lo que se ve al compartir
  // el enlace, asi que es el unico texto de la portada que se lee ANTES de
  // entrar — y por tanto el peor sitio donde prometer algo que la pagina no
  // ensena.
  //
  // Decia «…con duracion, nivel y sesiones por semana A LA VISTA…», que es
  // literalmente la frase de la seccion de planes que la revision 2 elimino.
  // Fue la tercera superviviente de esa misma frase, y la unica que ningun
  // test podia ver: los guardianes de copy consultan el DOM renderizado, y
  // `metadata` no esta en el DOM. Por eso el test de al lado la importa como
  // modulo en vez de buscarla en la pagina.
  description:
    'Planes de entrenamiento creados por entrenadores certificados, con seguimiento semana a semana de tu progreso y un entrenador que ajusta el plan.',
};

export default function Home() {
  return (
    <>
      <Hero />

      <main>
        <HowItWorks />
        <CoachesBlock />
        <Faq />
        <ClosingCta />
      </main>

      <SiteFooter documents={LEGAL_DOCUMENTS} />
    </>
  );
}
