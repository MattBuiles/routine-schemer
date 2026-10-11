import { describe, expect, it } from 'vitest';

import { getDateString } from './utils';

describe('getDateString', () => {
  it('usa la fecha local, no la UTC', () => {
    // 23:30 locales: toISOString() podría devolver el día siguiente en zonas al oeste de UTC.
    expect(getDateString(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
    expect(getDateString(new Date(2026, 11, 31, 0, 5))).toBe('2026-12-31');
  });

  it('rellena mes y día con ceros', () => {
    expect(getDateString(new Date(2026, 2, 3))).toBe('2026-03-03');
  });
});
