import type { NextConfig } from 'next';

/**
 * Restricciones de AWS Amplify Hosting que condicionan este archivo:
 * NO usar Edge middleware, ISR on-demand, streaming ni `unstable_after`.
 * El detalle y las fuentes estan en `docs/despliegue-amplify.md`.
 */
const nextConfig: NextConfig = {
  images: {
    /**
     * AVIF PRIMERO, WebP DE RESPALDO. El defecto de Next es solo WebP; AVIF
     * pesa alrededor de un 30% menos con la misma calidad percibida, y en una
     * portada cuyo elemento LCP es una foto a sangre eso es el ahorro mas
     * grande que se puede hacer sin tocar una linea de codigo.
     *
     * NO LO ELIGE EL COMPONENTE, lo negocia el navegador por la cabecera
     * `Accept`: quien no entienda AVIF recibe WebP y quien no entienda
     * ninguno recibe el original. Por eso el orden importa y AVIF va primero.
     *
     * LO QUE CUESTA: codificar AVIF es bastante mas lento que WebP, y ese
     * coste lo paga la primera peticion de cada variante en la Lambda de
     * Amplify —despues queda cacheada—. Con las fotos de la portada es
     * irrelevante. El dia que existan las imagenes de ejercicios (mas de 100,
     * subidas por entrenadores) hay que volver aqui: si el arranque en frio
     * empieza a notarse, esas imagenes no deberian optimizarse a demanda sino
     * llegar ya optimizadas desde el bucket, que es de donde vendran.
     *
     * Amplify despliega `sharp` por su cuenta y soporta AVIF: no hay que
     * instalar nada (docs/despliegue-amplify.md § 3).
     */
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
