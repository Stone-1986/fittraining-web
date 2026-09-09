import { describe, expect, it } from 'vitest';
import { FAQ, STEPS } from './landing-content';
import { LEGAL_DOCUMENTS } from './legal';

/**
 * QUE PROTEGE ESTE ARCHIVO, que no es «que React renderice».
 *
 * `landing-content.ts` son datos, y los datos de una web publica fallan de
 * dos formas silenciosas: un enlace que apunta a un documento que no existe
 * (404 en la portada) y una respuesta que se aparta de lo que dice el
 * consentimiento publicado. Ninguna de las dos rompe el build.
 *
 * Ademas hay una razon mecanica: `vitest.config.ts` mide cobertura POR
 * ARCHIVO sobre `src/lib/**` al 80%. Un archivo de datos que ningun test
 * importa se queda en 0% y tumba el gate el solo.
 */

describe('STEPS', () => {
  it('son tres pasos, en orden', () => {
    // El numero fantasma «01/02/03» va `aria-hidden` y el orden lo comunica
    // el <ol>. Con cuatro pasos el titular «Tres pasos» seria falso.
    expect(STEPS).toHaveLength(3);
    expect(STEPS.map((step) => step.title)).toEqual([
      'Elige tu plan',
      'Regístrate',
      'Entrena y registra',
    ]);
  });
});

describe('FAQ', () => {
  it('lleva tres preguntas: la de cambiar de plan no se implementa', () => {
    // Decision del 2026-09-08 (D-2b). Depende de una regla de producto que no
    // existe, y una respuesta inventada sobre el entrenamiento de alguien es
    // peor que no tener la pregunta.
    expect(FAQ).toHaveLength(3);
    expect(FAQ.map((entry) => entry.question).join(' ')).not.toContain(
      'cambiar de plan',
    );
  });

  it('no repite una pregunta y todas terminan en interrogación', () => {
    const questions = FAQ.map((entry) => entry.question);
    expect(new Set(questions).size).toBe(questions.length);
    for (const question of questions) {
      expect(question.startsWith('¿'), question).toBe(true);
      expect(question.endsWith('?'), question).toBe(true);
    }
  });

  it('cada respuesta sobre datos de salud enlaza al documento publicado', () => {
    // Las dos estan reescritas en tuteo a partir del consentimiento de salud
    // v1.1.0 §§ 3 y 5. El enlace es lo que permite comprobar el fondo.
    const withSource = FAQ.filter((entry) => entry.source);
    expect(withSource).toHaveLength(2);

    for (const entry of withSource) {
      expect(entry.source?.href).toBe('/consentimiento-datos-de-salud');
    }
  });

  it('los enlaces apuntan a documentos legales que existen', () => {
    // Es la comprobacion que evita el unico 404 posible de la portada: el
    // slug lo fija `definicion-web.md § 3` y esta escrito a mano aqui.
    const slugs = LEGAL_DOCUMENTS.map((doc) => doc.slug);
    for (const entry of FAQ) {
      if (!entry.source) continue;
      expect(
        slugs,
        `${entry.source.href} no es un documento publicado`,
      ).toContain(entry.source.href.replace('/', ''));
    }
  });

  it('la respuesta de datos de salud no contradice al consentimiento', () => {
    // El documento legal § 3 enumera lo que NO se recoge. Si la portada
    // dijera lo contrario seria un defecto grave, no un matiz de estilo.
    const datos = FAQ.find((entry) =>
      entry.question.includes('datos de salud'),
    );
    expect(datos).toBeDefined();
    for (const excluido of ['diagnósticos', 'medicamentos', 'peso']) {
      expect(datos?.answer).toContain(excluido);
    }
    expect(datos?.answer).toContain('RPE');
    expect(datos?.answer).toContain('RIR');

    // Y tambien por OMISION, que es por donde se colo el defecto del ciclo 1:
    // § 3 abre con «Unicamente los siguientes» y enumera TRES categorias. Si
    // la portada da menos de tres y cierra con la lista de lo que no se
    // recoge, se lee como lista cerrada y se pierde justo la categoria sobre
    // la que el documento advierte al titular.
    for (const categoria of [
      'esfuerzo percibido',
      'sensaciones semanales',
      'notas de texto libre',
    ]) {
      expect(
        datos?.answer,
        `la respuesta omite «${categoria}», una de las tres categorias de § 3`,
      ).toContain(categoria);
    }
    // La advertencia que § 3 hace sobre las notas —«le recomendamos no anotar
    // alli informacion de salud que no quiera compartir»— reescrita en tuteo.
    // Sin ella, nombrar la categoria no basta: es la unica linea de § 3 que
    // cambia lo que una persona hace.
    expect(datos?.answer).toMatch(/no escribas ahí información de salud/i);
  });

  it('tutea: ni un «usted» en el contenido visible de la portada', () => {
    // Los documentos legales van en «usted» y ahi se quedan; el producto
    // tutea (regla § 6). Este es el sitio donde las dos cosas se rozan.
    const texto = [
      ...STEPS.map((step) => `${step.title} ${step.description}`),
      ...FAQ.map((entry) => `${entry.question} ${entry.answer}`),
    ]
      .join(' ')
      .toLowerCase();

    expect(texto).not.toMatch(/\busted(es)?\b/);
    // Y sin emoji ni exclamaciones, que la misma regla prohibe.
    expect(texto).not.toContain('!');
    expect(texto).not.toContain('¡');
  });
});
