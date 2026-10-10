import { describe, expect, it } from 'vitest';

import { resolveSplitDays, type SplitDayInput } from './programStructure';

const templates = [{ name: 'Empuje' }, { name: 'Tirón' }, { name: 'Piernas' }];
const names = (days: SplitDayInput[]) => days.map(d => d.sessionTemplateName ?? '-');

describe('resolveSplitDays', () => {
  it('con 3 sesiones por semana entrena lunes, miércoles y viernes', () => {
    const days = resolveSplitDays({ sessionsPerWeek: 3, sessionTemplates: templates, weeklySplit: { days: [] } });
    expect(days.map(d => d.dayOfWeek)).toEqual(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
    expect(names(days)).toEqual(['Empuje', '-', 'Tirón', '-', 'Piernas', '-', '-']);
    expect(days.filter(d => !d.isRestDay)).toHaveLength(3);
  });

  it('reparte las plantillas en círculo cuando hay menos que días de entreno', () => {
    const days = resolveSplitDays({ sessionsPerWeek: 4, sessionTemplates: templates.slice(0, 2), weeklySplit: { days: [] } });
    expect(names(days)).toEqual(['Empuje', 'Tirón', '-', 'Empuje', 'Tirón', '-', '-']);
  });

  it('acota sessionsPerWeek al rango 1-7', () => {
    const base = { sessionTemplates: templates, weeklySplit: { days: [] } };
    expect(resolveSplitDays({ ...base, sessionsPerWeek: 0 }).filter(d => !d.isRestDay)).toHaveLength(1);
    expect(resolveSplitDays({ ...base, sessionsPerWeek: 99 }).filter(d => !d.isRestDay)).toHaveLength(7);
  });

  it('sin plantillas todos los días son de descanso', () => {
    const days = resolveSplitDays({ sessionsPerWeek: 3, sessionTemplates: [], weeklySplit: { days: [] } });
    expect(days).toHaveLength(7);
    expect(days.every(d => d.isRestDay)).toBe(true);
  });

  it('respeta los días recibidos si alguno ya tiene una sesión asignada', () => {
    const given: SplitDayInput[] = [
      { dayOfWeek: 'monday', sessionTemplateName: 'Piernas', isRestDay: false },
      { dayOfWeek: 'tuesday', isRestDay: true },
    ];
    expect(resolveSplitDays({ sessionsPerWeek: 3, sessionTemplates: templates, weeklySplit: { days: given } })).toBe(given);
  });

  it('también respeta los días que referencian la plantilla por id', () => {
    const given: SplitDayInput[] = [{ dayOfWeek: 'friday', sessionTemplateId: 'abc', isRestDay: false }];
    expect(resolveSplitDays({ sessionsPerWeek: 3, sessionTemplates: templates, weeklySplit: { days: given } })).toBe(given);
  });
});
