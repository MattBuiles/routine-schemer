import { neon } from '@neondatabase/serverless';
import { sql as rawSql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import { exercises } from '../src/db/schema';
import {
  fromFreeExerciseDb,
  fromWger,
  mergeLibraries,
  type FreeExerciseDbRecord,
  type LibraryExercise,
  type WgerRecord,
} from '../src/lib/exercises/library';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required to seed exercises.');

const FREE_EXERCISE_DB = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const WGER = 'https://wger.de/api/v2/exerciseinfo/?limit=1000';
const BATCH = 100;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} respondió ${response.status}`);
  return response.json() as Promise<T>;
}

async function main() {
  const [fedRecords, wger] = await Promise.all([
    fetchJson<FreeExerciseDbRecord[]>(FREE_EXERCISE_DB),
    fetchJson<{ count: number; next: string | null; results: WgerRecord[] }>(WGER),
  ]);
  // Con limit=1000 cabe todo (≈920); si algún día no cabe, mejor fallar que cargar a medias.
  if (wger.next) throw new Error('wger devolvió más de una página: hay que paginar el script.');

  const merged: LibraryExercise[] = mergeLibraries(
    fedRecords.map(fromFreeExerciseDb),
    wger.results.map(fromWger).filter((e): e is LibraryExercise => e !== null),
  );
  console.log(`free-exercise-db: ${fedRecords.length} · wger: ${wger.results.length} · tras fusionar: ${merged.length}`);

  const db = drizzle(neon(databaseUrl!));
  for (let i = 0; i < merged.length; i += BATCH) {
    await db
      .insert(exercises)
      .values(merged.slice(i, i + BATCH))
      .onConflictDoUpdate({
        target: [exercises.source, exercises.sourceId],
        set: {
          nameEn: rawSql`excluded.name_en`,
          nameEs: rawSql`excluded.name_es`,
          category: rawSql`excluded.category`,
          level: rawSql`excluded.level`,
          equipment: rawSql`excluded.equipment`,
          primaryMuscles: rawSql`excluded.primary_muscles`,
          secondaryMuscles: rawSql`excluded.secondary_muscles`,
          instructionsEn: rawSql`excluded.instructions_en`,
          instructionsEs: rawSql`excluded.instructions_es`,
          images: rawSql`excluded.images`,
          license: rawSql`excluded.license`,
          attribution: rawSql`excluded.attribution`,
        },
      });
    process.stdout.write(`\r${Math.min(i + BATCH, merged.length)}/${merged.length}`);
  }
  console.log('\nBiblioteca cargada.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
