/**
 * EL CONTENIDO DE LA PORTADA (W-10), tipado y en un solo sitio.
 *
 * SON DOS COSAS: los tres pasos de «Como funciona» y las tres preguntas del
 * acordeon. No hay planes — la portada tenia una seccion con cuatro tipos de
 * plan provisionales que el asistente propuso al planificar, y el humano la
 * quito (revision 2 del plan de W-10): los planes reales no existen todavia
 * ni en `fitmess-api` ni definidos como producto, y una portada no anuncia
 * lo que no puede cumplir. La pagina de planes llegara con ellos.
 *
 * POR QUE ESTA EN `src/lib/` Y NO ESCRITO EN EL JSX: la regla § 3 separa los
 * datos de la presentacion, y el motivo practico es el dia en que este texto
 * cambie — se toca un `.ts` de datos, no cinco componentes.
 *
 * NO CONTIENE JSX ni enlaces renderizados. La respuesta de una pregunta que
 * se apoya en un documento legal declara su `source` como datos (`href` +
 * `label`), y el acordeon decide como pintarlo.
 */

/** Uno de los tres pasos de «Cómo funciona». El orden es el del array. */
export interface Step {
  title: string;
  description: string;
}

export const STEPS: readonly Step[] = [
  {
    title: 'Elige tu plan',
    description:
      // Antes decia «Cuatro tipos, con duracion, nivel y sesiones…». Ese
      // recuento contaba los planes inventados que la revision 2 elimino de
      // la portada: la pagina afirmaba cuatro tipos que ya no ensena en
      // ninguna parte. Se quita la cifra y se deja lo que sigue siendo
      // cierto — y lo seguira siendo cuando exista la pagina de planes,
      // tenga los tipos que tenga.
      'Ves la duración, el nivel y las sesiones por semana antes de decidir.',
  },
  {
    title: 'Regístrate',
    // OJO: este paso describe un FLUJO LEGAL y hay que contrastarlo con
    // `src/content/legal/terminos/1.1.0.md` § 6 antes de tocarlo, no
    // reescribirlo a gusto.
    //
    // Decia «Creas tu cuenta y aceptas los consentimientos de salud y
    // deportivo», y era falso en tres cosas a la vez:
    //
    //   - Los consentimientos NO van en el registro. Van despues de que el
    //     entrenador apruebe: la API los acepta con
    //     `POST /subscriptions/{id}/accept-consent`, sobre una inscripcion
    //     que ya esta Aprobada.
    //   - No son de la cuenta, son DE CADA PLAN. § 6: «Cada inscripcion
    //     tiene su propio consentimiento».
    //   - Y faltaba la aprobacion entera. El flujo real es Pendiente →
    //     Aprobada → consentimientos → Activa, y sin ella la pagina
    //     insinuaba que registrarse basta para entrenar. No basta.
    description:
      'Creas tu cuenta y solicitas el plan. Tu entrenador aprueba la inscripción.',
  },
  {
    title: 'Entrena y registra',
    description:
      'Aceptas los consentimientos, y tu entrenador ve tu progreso y ajusta lo que haga falta.',
  },
];

/** Una pregunta del acordeón. */
export interface FaqEntry {
  question: string;
  answer: string;
  /**
   * El documento legal que sostiene la respuesta, cuando lo hay.
   *
   * No es decoracion: las dos preguntas de datos de salud estan REESCRITAS
   * EN TUTEO a partir del `Consentimiento para el Tratamiento de Datos
   * Sensibles de Salud` v1.1.0, que va en «usted» y ahi se queda. El estilo
   * cambia; el fondo no puede. El enlace deja el texto exacto a un clic.
   *
   * `landing-content.test.ts` comprueba que cada `href` corresponde a un
   * documento publicado — un enlace roto aqui es un 404 en la portada.
   */
  source?: { href: string; label: string };
}

/**
 * TRES PREGUNTAS, NO CUATRO. El canvas dibuja cuatro, pero «¿Puedo cambiar
 * de plan a mitad de camino?» NO se implementa (decision del 2026-09-08):
 * depende de una regla de producto que no existe. Lo unico que consta es que
 * el consentimiento se acepta POR PLAN (`LegalAcceptance.planId`), de donde
 * se deduce que cambiar exige aceptarlo de nuevo — pero no si el progreso
 * anterior se conserva, que es lo que la persona pregunta de verdad.
 * Publicar una respuesta inventada sobre el entrenamiento de alguien es peor
 * que no tener la pregunta. El dia que exista la regla, es una entrada mas
 * en este array.
 */
export const FAQ: readonly FaqEntry[] = [
  {
    // ESTA PREGUNTA SE HA CORREGIDO DOS VECES. Las dos versiones anteriores
    // eran FALSAS, cada una a su manera, y por eso conviene leer la historia
    // entera antes de tocarla:
    //
    //   1. El canvas: «¿Necesito equipo para EL PLAN EN CASA?» / «No, LAS
    //      OCHO SEMANAS estan disenadas con peso corporal». Afirmaba un plan
    //      concreto —uno de los cuatro provisionales que la revision 2
    //      elimino—, asi que prometia un producto que la pagina no ensena.
    //   2. La correccion intermedia: «...para entrenar EN CASA?» / «No. Hay
    //      planes disenados para hacerse con peso corporal». Quitaba el plan
    //      y la duracion, pero el humano la declaro INCORRECTA (2026-09-09):
    //      da a entender que la unica salida sin equipo es el peso corporal,
    //      y no es asi — puede haberlos con elementos que ya tienes en casa,
    //      y los de running no piden nada.
    //
    // La de ahora dice «depende del plan» a proposito. La tentacion es
    // rematar con «ninguno necesita equipo especializado», y seria el mismo
    // error una tercera vez: un absoluto que el producto no puede sostener.
    // Mientras no exista la pagina de planes, «depende» es lo unico cierto.
    question: '¿Necesito equipo para entrenar?',
    answer:
      'Depende del plan. Los hay que solo piden tu peso corporal, lo que tengas en casa, o salir a correr.',
  },
  {
    question: '¿Qué datos de salud me piden y por qué?',
    answer:
      'Tu esfuerzo percibido en cada serie (RPE o RIR), cuatro sensaciones semanales del 1 al 10 —dolor muscular, motivación, sueño y energía— y las notas de texto libre que escribas sobre una serie o una sesión. Sirven para que tu entrenador ajuste el plan, y las notas las lee igual que el resto: no escribas ahí información de salud que no quieras compartir. No pedimos diagnósticos, medicamentos, peso ni frecuencia cardíaca.',
    source: {
      href: '/consentimiento-datos-de-salud',
      label: 'Leer el consentimiento de datos de salud',
    },
  },
  {
    question: '¿Mi entrenador ve mis registros?',
    answer:
      'Sí, y es el motivo de recogerlos: son la materia prima con la que ajusta tu plan. Solo ve los datos de los atletas inscritos en sus propios planes.',
    source: {
      href: '/consentimiento-datos-de-salud',
      label: 'Leer el consentimiento de datos de salud',
    },
  },
];
