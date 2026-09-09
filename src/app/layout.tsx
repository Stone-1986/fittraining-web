import type { Metadata } from 'next';
import { Archivo, Barlow } from 'next/font/google';
import './globals.css';

/**
 * La tipografia del producto.
 *
 * `next/font` NO es una comodidad, resuelve dos problemas concretos:
 *   - AUTO-HOSPEDA la fuente en nuestro propio dominio durante el build. No
 *     hay peticion a `fonts.googleapis.com` en tiempo de ejecucion, que es
 *     una dependencia externa menos y un dato menos que sale del navegador
 *     de un usuario hacia un tercero (relevante cuando toda la app gira
 *     alrededor del tratamiento de datos personales). El canvas del sistema
 *     enlaza las dos familias desde Google porque es un HTML suelto; en la
 *     app NO se hace asi.
 *   - Reserva el espacio de las metricas antes de que la fuente cargue, asi
 *     que el texto no salta al terminar de descargarla.
 *
 * SON DOS FAMILIAS, y antes era una sola. El cambio no es un capricho: el
 * sistema hace la jerarquia con el CONTRASTE DE PESO (§ 01, «titulares
 * pesados»), y para eso hace falta una display que llegue a 900 sin
 * empastarse junto a una de texto que se lea comoda en 300. Ninguna familia
 * unica hace bien las dos cosas.
 *
 *   Archivo  display. Variable, asi que un archivo cubre 700/800/900.
 *   Barlow   texto e interfaz. NO es variable: hay que pedir los cuatro
 *            pesos que el sistema usa, y solo esos — cada peso extra es un
 *            archivo mas que descargar.
 *
 * No se referencian por nombre en ningun componente: exponen `--font-archivo`
 * y `--font-barlow`, que `globals.css` recoge en `--font-display` y
 * `--font-body`. Cambiar de tipografia es cambiar este archivo y nada mas.
 */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
});

/**
 * `metadataBase` fija el origen canonico del sitio y `alternates.canonical`
 * emite un <link rel="canonical"> con la ruta actual resuelta contra el.
 *
 * Existe por una razon concreta y medida (2026-09-07): la redireccion de
 * `www` -> raiz de Amplify funciona para las RUTAS pero no para la portada
 * —`https://www.fittraining.app` responde 200 en vez de 301, y las dos formas
 * de escribir esa regla se probaron y fallaron; ver docs/despliegue-amplify.md
 * § 5—. El canonical le dice al buscador cual es la URL buena aunque llegue
 * por `www`, y a diferencia de la regla de la consola vive en el repo y lo
 * verifican los gates.
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://fittraining.app'),
  alternates: { canonical: './' },
  title: 'fittraining',
  description: 'Plataforma de entrenamiento fittraining',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${archivo.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
