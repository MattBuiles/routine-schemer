import type { DayOfWeek } from '@/types/program';

export const WEEKDAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export interface SplitDayInput {
  dayOfWeek: DayOfWeek;
  sessionTemplateName?: string;
  sessionTemplateId?: string | null;
  isRestDay: boolean;
  notes?: string;
}

const TRAINING_DAYS: Record<number, DayOfWeek[]> = {
  1: ['monday'],
  2: ['monday', 'thursday'],
  3: ['monday', 'wednesday', 'friday'],
  4: ['monday', 'tuesday', 'thursday', 'friday'],
  5: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  7: WEEKDAYS,
};

/** Si el split no asigna sesiones a ningún día, reparte las plantillas en los días de entreno según `sessionsPerWeek`. */
export function resolveSplitDays(input: {
  sessionsPerWeek: number;
  sessionTemplates: { name: string }[];
  weeklySplit: { days: SplitDayInput[] };
}): SplitDayInput[] {
  const given = input.weeklySplit.days;
  if (given.some(day => day.sessionTemplateName || day.sessionTemplateId)) return given;

  const trainingDays = TRAINING_DAYS[Math.min(Math.max(input.sessionsPerWeek, 1), 7)];
  const templates = input.sessionTemplates;
  return WEEKDAYS.map(dayOfWeek => {
    const index = trainingDays.indexOf(dayOfWeek);
    const template = index >= 0 && templates.length > 0 ? templates[index % templates.length] : undefined;
    return template
      ? { dayOfWeek, sessionTemplateName: template.name, isRestDay: false }
      : { dayOfWeek, isRestDay: true };
  });
}
