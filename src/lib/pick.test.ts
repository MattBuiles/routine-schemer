import { describe, expect, it } from 'vitest';

import { pick } from './pick';

describe('pick', () => {
  it('copia solo las claves permitidas', () => {
    const input = { name: 'Agua', target: 8, userId: 'atacante', id: 'forzado' };
    expect(pick(input, ['name', 'target'])).toEqual({ name: 'Agua', target: 8 });
  });

  it('descarta las claves undefined pero conserva false, 0 y cadenas vacías', () => {
    const input = { a: undefined, b: false, c: 0, d: '' };
    expect(pick(input, ['a', 'b', 'c', 'd'])).toEqual({ b: false, c: 0, d: '' });
  });

  it('ignora las claves permitidas que no existen en la entrada', () => {
    expect(pick({ name: 'x' } as { name: string; unit?: string }, ['name', 'unit'])).toEqual({ name: 'x' });
  });
});
