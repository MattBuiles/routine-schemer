import { describe, expect, it } from 'vitest';

import { commit, commitFrom, createHistory, redo, replace, undo } from './history';

describe('history', () => {
  it('commit permite deshacer y rehacer', () => {
    let h = createHistory(1);
    h = commit(h, 2);
    h = commit(h, 3);
    h = undo(h);
    expect(h.present).toBe(2);
    h = redo(h);
    expect(h.present).toBe(3);
  });

  it('un cambio nuevo descarta el futuro', () => {
    let h = commit(commit(createHistory(1), 2), 3);
    h = undo(h);
    h = commit(h, 9);
    expect(h.future).toEqual([]);
    expect(undo(h).present).toBe(2);
  });

  it('un gesto con vista previa deja un único punto de deshacer', () => {
    const base = { n: 0 };
    let h = createHistory(base);
    h = replace(h, { n: 1 });
    h = replace(h, { n: 2 });
    h = commitFrom(h, base);
    expect(h.past).toEqual([base]);
    expect(undo(h).present).toBe(base);
  });

  it('un gesto sin cambios no registra historial', () => {
    const base = { n: 0 };
    const h = commitFrom(createHistory(base), base);
    expect(h.past).toEqual([]);
  });

  it('undo/redo sin pasos no hace nada', () => {
    const h = createHistory(1);
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });
});
