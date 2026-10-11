/** Ejercicio de la biblioteca ya normalizado, con independencia de la fuente de la que venga. */
export interface LibraryExercise {
  source: 'free-exercise-db' | 'wger';
  sourceId: string;
  nameEn: string;
  nameEs: string | null;
  category: string | null;
  level: string | null;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructionsEn: string;
  instructionsEs: string | null;
  images: string[];
  license: string;
  attribution: string | null;
}

// --- free-exercise-db (dominio público, Unlicense) ---------------------------------------------------

export interface FreeExerciseDbRecord {
  id: string;
  name: string;
  category?: string | null;
  level?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  images?: string[];
}

export const FREE_EXERCISE_DB_IMAGES = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';

export function fromFreeExerciseDb(record: FreeExerciseDbRecord): LibraryExercise {
  return {
    source: 'free-exercise-db',
    sourceId: record.id,
    nameEn: record.name.trim(),
    nameEs: null,
    category: record.category ?? null,
    level: record.level ?? null,
    equipment: record.equipment ? [record.equipment] : [],
    primaryMuscles: record.primaryMuscles ?? [],
    secondaryMuscles: record.secondaryMuscles ?? [],
    instructionsEn: (record.instructions ?? []).join('\n'),
    instructionsEs: null,
    images: (record.images ?? []).map((path) => FREE_EXERCISE_DB_IMAGES + path),
    license: 'Unlicense',
    attribution: null,
  };
}

// --- wger (CC-BY-SA, exige atribución al autor) ------------------------------------------------------

export interface WgerRecord {
  id: number;
  category?: { name: string } | null;
  muscles?: { id: number }[];
  muscles_secondary?: { id: number }[];
  equipment?: { id: number }[];
  license?: { short_name: string } | null;
  license_author?: string | null;
  images?: { image: string }[];
  translations?: { language: number; name: string; description?: string; license_author?: string | null }[];
}

const WGER_ENGLISH = 2;
const WGER_SPANISH = 4;

/** Músculos de wger → vocabulario de free-exercise-db (para poder filtrar con una sola lista). */
const WGER_MUSCLES: Record<number, string> = {
  1: 'biceps', 2: 'shoulders', 3: 'chest', 4: 'chest', 5: 'triceps', 6: 'abdominals', 7: 'calves', 8: 'glutes',
  9: 'traps', 10: 'quadriceps', 11: 'hamstrings', 12: 'lats', 13: 'biceps', 14: 'abdominals', 15: 'calves',
};

const WGER_EQUIPMENT: Record<number, string> = {
  1: 'barbell', 2: 'e-z curl bar', 3: 'dumbbell', 4: 'other', 5: 'exercise ball', 6: 'other', 7: 'body only',
  8: 'other', 9: 'other', 10: 'kettlebells', 11: 'bands', 12: 'cable',
};

const unique = <T>(items: T[]) => [...new Set(items)];

/** Quita etiquetas HTML y entidades básicas de las descripciones de wger. */
export function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|li|h\d|div)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Devuelve null si el ejercicio no tiene traducción al inglés (sin nombre base no se puede buscar ni deduplicar). */
export function fromWger(record: WgerRecord): LibraryExercise | null {
  const translations = record.translations ?? [];
  const en = translations.find((t) => t.language === WGER_ENGLISH && t.name?.trim());
  if (!en) return null;
  const es = translations.find((t) => t.language === WGER_SPANISH && t.name?.trim());
  const authors = unique([record.license_author, en.license_author, es?.license_author].filter((a): a is string => !!a?.trim()));
  const category = record.category?.name?.toLowerCase();

  return {
    source: 'wger',
    sourceId: String(record.id),
    nameEn: en.name.trim(),
    nameEs: es?.name.trim() ?? null,
    category: category === 'cardio' ? 'cardio' : 'strength',
    level: null,
    equipment: unique((record.equipment ?? []).map((e) => WGER_EQUIPMENT[e.id]).filter(Boolean)),
    primaryMuscles: unique((record.muscles ?? []).map((m) => WGER_MUSCLES[m.id]).filter(Boolean)),
    secondaryMuscles: unique((record.muscles_secondary ?? []).map((m) => WGER_MUSCLES[m.id]).filter(Boolean)),
    instructionsEn: stripHtml(en.description ?? ''),
    instructionsEs: es?.description ? stripHtml(es.description) : null,
    images: (record.images ?? []).map((i) => i.image),
    license: record.license?.short_name ?? 'CC-BY-SA 4',
    attribution: authors.length ? authors.join(', ') : null,
  };
}

// --- fusión ------------------------------------------------------------------------------------------

/** Clave para detectar el mismo ejercicio en dos fuentes: minúsculas, sin acentos ni signos. */
export function nameKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Une las fuentes sin duplicados. Si el mismo ejercicio está en las dos, se conserva la ficha de
 * free-exercise-db (imágenes e instrucciones) y se le añade de wger el nombre y las instrucciones en
 * español, junto con la licencia y los autores que eso exige.
 */
export function mergeLibraries(primary: LibraryExercise[], secondary: LibraryExercise[]): LibraryExercise[] {
  const byKey = new Map<string, LibraryExercise>();
  for (const exercise of primary) {
    const key = nameKey(exercise.nameEn);
    if (key && !byKey.has(key)) byKey.set(key, exercise);
  }

  const merged = new Map(byKey);
  for (const exercise of secondary) {
    const key = nameKey(exercise.nameEn);
    if (!key) continue;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, exercise);
      continue;
    }
    if (existing.source !== 'free-exercise-db') continue; // dos de wger con el mismo nombre: gana el primero
    if (!exercise.nameEs && !exercise.instructionsEs) continue;
    merged.set(key, {
      ...existing,
      nameEs: existing.nameEs ?? exercise.nameEs,
      instructionsEs: existing.instructionsEs ?? exercise.instructionsEs,
      license: `${existing.license} + ${exercise.license}`,
      attribution: exercise.attribution,
    });
  }
  return [...merged.values()];
}
