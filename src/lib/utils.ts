import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/** Fecha local en formato YYYY-MM-DD (no UTC: cerca de medianoche toISOString cae en otro día). */
export function getDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const toDayNumber = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
};

/** Racha actual (que llega hasta hoy o ayer) y mejor racha de días consecutivos con actividad. */
export function calculateStreaks(dates: string[], today: string = getDateString(new Date())) {
  const days = [...new Set(dates)].map(toDayNumber).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  days.forEach((day, i) => {
    run = i > 0 && day === days[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });

  const last = days[days.length - 1];
  const current = last !== undefined && toDayNumber(today) - last <= 1 ? run : 0;
  return { current, best };
}

export function parseDateString(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return getDateString(date1) === getDateString(date2);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // adjust for Monday start
  result.setDate(diff);
  return result;
}

export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  return addDays(weekStart, 6);
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getDaysBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
}
