import { SiteFooter } from 'fittraining';

// En la web los documentos salen de `src/lib/legal.ts`, que lee del disco y
// no viaja al paquete. Aqui va la misma lista escrita dentro del ejemplo
// para que se pueda copiar. OJO: si se publica un documento nuevo o cambia
// una version, esta copia no se entera sola (NOTES.md § Riesgos).
export const Default = () => (
  <div className="bg-background">
    <SiteFooter
      documents={[
        {
          slug: 'politica-de-privacidad',
          navLabel: 'Política de privacidad',
          title: 'Política de Tratamiento de Datos Personales',
          summary:
            'Qué datos recogemos, para qué, quién los ve y cómo ejercer sus derechos.',
          currentVersion: '1.1.0',
        },
        {
          slug: 'terminos',
          navLabel: 'Términos y condiciones',
          title: 'Términos y Condiciones de Uso',
          summary:
            'Las reglas del servicio: roles, planes, cuenta y responsabilidades.',
          currentVersion: '1.1.0',
        },
        {
          slug: 'consentimiento-deportivo',
          navLabel: 'Consentimiento deportivo',
          title: 'Consentimiento Informado Deportivo',
          summary:
            'Los riesgos del entrenamiento físico y qué declara usted al aceptarlos.',
          currentVersion: '1.1.0',
        },
        {
          slug: 'consentimiento-datos-de-salud',
          navLabel: 'Datos de salud',
          title:
            'Consentimiento para el Tratamiento de Datos Sensibles de Salud',
          summary:
            'La autorización aparte que exige la ley para el esfuerzo y las sensaciones.',
          currentVersion: '1.1.0',
        },
        {
          slug: 'aviso-de-eliminacion-de-cuenta',
          navLabel: 'Eliminación de cuenta',
          title: 'Aviso de Eliminación de Cuenta',
          summary:
            'Qué se borra, qué se conserva y por cuánto tiempo al eliminar su cuenta.',
          currentVersion: '1.0.0',
        },
      ]}
    />
  </div>
);
