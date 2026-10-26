import { describe, expect, it } from 'vitest';

import type { BlockExercise } from './cycle';
import { applyLog, sanitizeLog, withLastLog } from './lastLog';

const ID = '00000000-0000-4000-8000-000000000001';
const ex = (notes: string, exerciseId = ID): BlockExercise => ({ exerciseId, name: 'Press', sets: 3, reps: '8-10', notes });

describe('withLastLog', () => {
  it('sin notas previas deja solo el último', () => {
    expect(withLastLog('', '82.5 kg × 8')).toBe('Último: 82.5 kg × 8');
  });
  it('conserva lo que escribió el usuario y reemplaza el último anterior', () => {
    const once = withLastLog('Codo cerrado', '80 kg × 8');
    expect(once).toBe('Codo cerrado · Último: 80 kg × 8');
    expect(withLastLog(once, '82.5 kg × 8')).toBe('Codo cerrado · Último: 82.5 kg × 8');
    expect(withLastLog('Último: 70 kg × 10', '80 kg × 8')).toBe('Último: 80 kg × 8');
  });
  it('respeta el límite de 200 caracteres recortando las notas del usuario, no el resumen', () => {
    const r = withLastLog('n'.repeat(500), '82.5 kg × 8');
    expect(r.length).toBe(200);
    expect(r.endsWith(' · Último: 82.5 kg × 8')).toBe(true);
  });
});

describe('sanitizeLog', () => {
  it('descarta ids no uuid, resúmenes vacíos o no texto, y deja el último de cada id', () => {
    const out = sanitizeLog({ exercises: [{ exerciseId: ID, summary: 'a' }, { exerciseId: ID.toUpperCase(), summary: ' 82.5\nkg ' }, { exerciseId: 'x', summary: 'b' }, { exerciseId: ID.replace('1', '2'), summary: '' }, { exerciseId: ID.replace('1', '3'), summary: 5 }, null] });
    expect(out).toEqual([{ exerciseId: ID, summary: '82.5 kg' }]);
  });
  it('tolera entradas basura y limita el largo del resumen', () => {
    expect(sanitizeLog(null)).toEqual([]);
    expect(sanitizeLog({ exercises: 'x' })).toEqual([]);
    expect(sanitizeLog({ exercises: [{ exerciseId: ID, summary: 'z'.repeat(500) }] })[0].summary).toHaveLength(60);
  });
});

describe('applyLog', () => {
  it('actualiza solo los ejercicios que están en el registro y avisa si cambió algo', () => {
    const other = '00000000-0000-4000-8000-000000000002';
    const r = applyLog([ex('', ID), ex('igual', other)], new Map([[ID, '80 kg × 8']]));
    expect(r.changed).toBe(true);
    expect(r.exercises.map((e) => e.notes)).toEqual(['Último: 80 kg × 8', 'igual']);
    expect(applyLog([ex('Último: 80 kg × 8')], new Map([[ID, '80 kg × 8']])).changed).toBe(false);
    expect(applyLog([ex('')], new Map()).changed).toBe(false);
  });
});
