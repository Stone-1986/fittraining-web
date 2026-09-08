import { describe, expect, it } from 'vitest';
import { formatToken, parseTokens, readDesignTokens } from './design-tokens';

describe('parseTokens', () => {
  it('extrae el valor literal de una declaración', () => {
    const tokens = parseTokens(':root { --primary: #28e0c8; }');
    expect(tokens.get('--primary')).toBe('#28e0c8');
  });

  it('descarta los alias var(), que no son un valor', () => {
    // Es el caso real del bloque `@theme inline`: `--color-primary` apunta a
    // `--primary`. Devolverlo haria que la guia enseñara «var(--primary)»
    // como si fuera un color.
    const tokens = parseTokens(
      ':root { --primary: #28e0c8; } @theme inline { --color-primary: var(--primary); }',
    );
    expect(tokens.has('--color-primary')).toBe(false);
    expect(tokens.get('--primary')).toBe('#28e0c8');
  });

  it('gana la primera declaración cuando un token se repite', () => {
    // `:root` va antes que `@theme` en el archivo, y es la que tiene la
    // paleta. Si ganara la ultima, un redeclarado posterior sobrescribiria
    // el valor de marca sin que nadie lo notara.
    const tokens = parseTokens(
      ':root { --ring: #7cf1e2; } @media print { --ring: #000000; }',
    );
    expect(tokens.get('--ring')).toBe('#7cf1e2');
  });

  it('ignora los comentarios que rodean una declaración', () => {
    const tokens = parseTokens(
      '/* la marca */ :root { --primary: #28e0c8; /* 11.67:1 */ }',
    );
    expect(tokens.get('--primary')).toBe('#28e0c8');
  });

  it('conserva valores que no son colores', () => {
    const tokens = parseTokens(
      ':root { --duration-hover: 160ms; --tracking-label: 0.14em; }',
    );
    expect(tokens.get('--duration-hover')).toBe('160ms');
    expect(tokens.get('--tracking-label')).toBe('0.14em');
  });

  it('devuelve un mapa vacío para una hoja sin tokens', () => {
    expect(parseTokens('body { margin: 0; }').size).toBe(0);
  });
});

describe('formatToken', () => {
  const tokens = new Map([
    ['--primary', '#28e0c8'],
    ['--duration-hover', '160ms'],
  ]);

  it('pone el hexadecimal en mayúsculas para comparar con el canvas', () => {
    expect(formatToken(tokens, '--primary')).toBe('#28E0C8');
  });

  it('deja intacto lo que no es un hexadecimal', () => {
    expect(formatToken(tokens, '--duration-hover')).toBe('160ms');
  });

  it('avisa de forma visible cuando el token no existe', () => {
    // Un hueco en blanco en la tabla se leeria como «no tiene color». Este
    // aviso se lee como lo que es: algo que hay que arreglar.
    expect(formatToken(tokens, '--no-existe')).toBe('(falta --no-existe)');
  });
});

describe('readDesignTokens', () => {
  it('lee la paleta real de globals.css', () => {
    const tokens = readDesignTokens();

    // Si este test falla, o se renombró un token de marca o `/estilo` está
    // enseñando huecos. Las dos cosas hay que verlas.
    expect(tokens.get('--background')).toBe('#0b0d0e');
    expect(tokens.get('--primary')).toBe('#28e0c8');
  });

  it('trae todos los tokens que la guía viva enseña', () => {
    const tokens = readDesignTokens();
    const shown = [
      '--background',
      '--card',
      '--muted',
      '--border',
      '--border-strong',
      '--input',
      '--primary',
      '--primary-hover',
      '--primary-pressed',
      '--primary-soft',
    ];

    expect(shown.filter((name) => !tokens.has(name))).toEqual([]);
  });
});
