import { describe, expect, it } from 'vitest';

import { MAX_SEARCH_LIMIT, escapeLike, sanitizeSearch } from './search';

describe('sanitizeSearch', () => {
  it('tolera entradas que no son un objeto', () => {
    for (const bad of [null, undefined, 3, 'x', []]) {
      expect(sanitizeSearch(bad)).toEqual({ query: '', muscle: null, equipment: null, limit: 30, offset: 0 });
    }
  });

  it('descarta filtros fuera de la lista cerrada', () => {
    expect(sanitizeSearch({ muscle: "chest'; drop table x;--", equipment: 'laser' })).toMatchObject({ muscle: null, equipment: null });
    expect(sanitizeSearch({ muscle: 'chest', equipment: 'barbell' })).toMatchObject({ muscle: 'chest', equipment: 'barbell' });
  });

  it('recorta el texto y limita la paginación', () => {
    const s = sanitizeSearch({ query: `  ${'a'.repeat(200)} `, limit: 9999, offset: -5 });
    expect(s.query).toHaveLength(80);
    expect(s.limit).toBe(MAX_SEARCH_LIMIT);
    expect(s.offset).toBe(0);
    expect(sanitizeSearch({ limit: 0 }).limit).toBe(1);
    expect(sanitizeSearch({ limit: 'mucho', offset: 2.7 })).toMatchObject({ limit: 30, offset: 2 });
  });
});

describe('escapeLike', () => {
  it('escapa %, _ y la barra', () => {
    expect(escapeLike('100%_a\\b')).toBe('100\\%\\_a\\\\b');
    expect(escapeLike('press banca')).toBe('press banca');
  });
});
