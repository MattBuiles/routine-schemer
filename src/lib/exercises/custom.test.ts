import { describe, expect, it } from 'vitest';

import { sanitizeCustom } from './custom';

describe('sanitizeCustom', () => {
  it('exige nombre y lo recorta', () => {
    expect(sanitizeCustom({})).toMatchObject({ ok: false });
    expect(sanitizeCustom({ name: '   ' })).toMatchObject({ ok: false });
    expect(sanitizeCustom({ name: 'x'.repeat(81) })).toMatchObject({ ok: false });
    expect(sanitizeCustom({ name: '  Press landmine ' })).toMatchObject({ ok: true, value: { name: 'Press landmine' } });
  });

  it('descarta músculos y equipamiento fuera de la lista, repetidos y de más', () => {
    const r = sanitizeCustom({ name: 'X', primaryMuscles: ['chest', 'chest', 'cerebro', 3, 'triceps', 'biceps', 'lats'], equipment: ['barbell', 'jetpack'] });
    expect(r).toMatchObject({ ok: true, value: { primaryMuscles: ['chest', 'triceps', 'biceps'], equipment: ['barbell'] } });
  });

  it('tolera tipos erróneos sin lanzar', () => {
    expect(sanitizeCustom({ name: 'X', primaryMuscles: 'chest', equipment: null, notes: 5 })).toMatchObject({ ok: true, value: { primaryMuscles: [], equipment: [], notes: '' } });
    expect(sanitizeCustom({ name: 'X', notes: 'n'.repeat(2001) })).toMatchObject({ ok: false });
    expect(sanitizeCustom(null)).toMatchObject({ ok: false });
  });
});
