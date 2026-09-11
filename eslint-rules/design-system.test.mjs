import { describe, expect, it } from 'vitest';
import { findViolation } from './design-system.mjs';

/**
 * Una regla de lint que no atrapa es indistinguible de una que no existe.
 *
 * Estos tests son la prueba de que atrapa. La mitad de arriba comprueba que
 * cada patrón dispara; la de abajo —que importa igual o más— comprueba que NO
 * dispara con lo legítimo: un gate con falsos positivos se acaba desactivando,
 * y entonces deja de proteger también lo que sí protegía.
 */

const id = (text) => findViolation(text)?.pattern.id ?? null;

describe('lo que la regla debe atrapar', () => {
  it.each([
    ['#28e0c8', 'color-literal'],
    ['#FFF', 'color-literal'],
    ['rgba(8, 10, 11, .95)', 'color-literal'],
    ['oklch(0.7 0.1 180)', 'color-literal'],
    ['text-neutral-500', 'tailwind-palette'],
    ['bg-green-700', 'tailwind-palette'],
    ['text-[21px]', 'arbitrary-scale'],
    ['tracking-[.14em]', 'arbitrary-scale'],
    ['rounded-[6px]', 'arbitrary-scale'],
    ['text-white', 'base-palette'],
    ['bg-black', 'base-palette'],
    // El modificador de opacidad no lo salva: sigue siendo blanco puro.
    ['bg-white/10', 'base-palette'],
    // El paso de 34px que el canvas dibuja y la escala no tiene.
    ['mt-[34px]', 'arbitrary-spacing'],
    ['p-[13px]', 'arbitrary-spacing'],
    ['gap-[0.4rem]', 'arbitrary-spacing'],
    ['dark:bg-card', 'dark-variant'],
    ['bg-warm', 'removed-token'],
    ['text-warm', 'removed-token'],
    ['rounded-lg', 'off-system-radius'],
    ['rounded-t-md', 'off-system-radius'],
    ['shadow-md', 'shadow'],
  ])('«%s» → %s', (text, expected) => {
    expect(id(text)).toBe(expected);
  });

  it('atrapa el color aunque venga entre otras clases', () => {
    expect(id('flex items-center bg-[#28e0c8] p-4')).toBe('arbitrary-color');
  });
});

describe('lo que NO debe atrapar', () => {
  it.each([
    // Los tokens del sistema. Si alguno de estos disparara, el gate sería
    // inservible: prohibiría escribir la interfaz correcta.
    'bg-primary text-primary-foreground hover:bg-primary-hover',
    'text-muted-foreground border-border-strong',
    'text-lead tracking-label rounded-pill',
    'text-display font-black',
    'rounded-none rounded-sm rounded-full',
    // `border-2` y `border-t-2` son grosor de borde, no radio ni color.
    'border-2 border-primary',
    'border-t-2 border-border',
    // Una proporción de dato NO está en la escala de espaciado y tiene que
    // poder escribirse. Es el caso de la barra de progreso de /estilo.
    'h-1.5 w-[58%] bg-primary',
    // LO QUE `arbitrary-spacing` DEJA PASAR A PROPÓSITO, y conviene que esté
    // fijado: si alguien amplía el patrón a `w-` o a `h-`, estos tests caen y
    // la discusión ocurre antes del merge y no después.
    'h-[calc(100vh-4rem)]',
    'grid-cols-[1fr_2fr]',
    'w-[min(100%,42rem)]',
    'm-[5%]',
    // Números de la escala de Tailwind v4: no son valores sueltos, son la
    // escala de 4px expresada en pasos. `min-h-190` son 760px.
    'min-h-190 max-w-165 size-14 mt-8 gap-3.5',
    // `transparent` y `current` NO son colores: son la ausencia de uno y la
    // herencia del de al lado. `button.tsx` depende de esto.
    'border border-primary bg-transparent',
    'fill-current stroke-current',
    // Prosa que habla del sistema. La guía viva está llena de esto.
    'La interfaz vive sobre negro carbón. No hay modo claro, y por eso no hay ni una clase «dark:» en el repo.',
    'Cuatro radios: 0 en bloques, 2px en el botón rectangular de la barra.',
    'El token warm ya no existe en el sistema 1.0.',
    // Un ancla o una ruta con almohadilla no es un color.
    '#accesibilidad',
    'https://ejemplo.com/guia#colores',
  ])('«%s»', (text) => {
    expect(findViolation(text)).toBeNull();
  });
});
