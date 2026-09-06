import type { NextConfig } from 'next';

/**
 * Restricciones de AWS Amplify Hosting que condicionan este archivo:
 * NO usar Edge middleware, ISR on-demand, streaming ni `unstable_after`.
 * El detalle y las fuentes estan en `docs/despliegue-amplify.md`.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
