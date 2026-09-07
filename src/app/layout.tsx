import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
