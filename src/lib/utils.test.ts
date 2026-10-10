import { describe, expect, it } from 'vitest';

import { calculateStreaks, getDateString } from './utils';

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

describe('calculateStreaks', () => {
  const today = '2026-10-10';

  it('sin actividad no hay rachas', () => {
    expect(calculateStreaks([], today)).toEqual({ current: 0, best: 0 });
  });

  it('un solo día de hoy es una racha de 1', () => {
    expect(calculateStreaks(['2026-10-10'], today)).toEqual({ current: 1, best: 1 });
  });

  it('la racha actual sigue viva si la última actividad fue ayer', () => {
    expect(calculateStreaks(['2026-10-08', '2026-10-09'], today)).toEqual({ current: 2, best: 2 });
  });

  it('la racha actual se pierde si la última actividad fue hace 2 días o más', () => {
    expect(calculateStreaks(['2026-10-07', '2026-10-08'], today)).toEqual({ current: 0, best: 2 });
  });

  it('la mejor racha puede ser anterior a la actual', () => {
    const dates = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-10-09', '2026-10-10'];
    expect(calculateStreaks(dates, today)).toEqual({ current: 2, best: 4 });
  });

  it('ignora duplicados y el orden de entrada', () => {
    expect(calculateStreaks(['2026-10-10', '2026-10-09', '2026-10-10', '2026-10-09'], today)).toEqual({ current: 2, best: 2 });
  });

  it('cuenta correctamente a través del cambio de mes y de año', () => {
    expect(calculateStreaks(['2026-12-30', '2026-12-31', '2027-01-01'], '2027-01-01')).toEqual({ current: 3, best: 3 });
  });
});
