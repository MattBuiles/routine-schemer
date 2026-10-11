import { describe, expect, it } from 'vitest';

import {
  FREE_EXERCISE_DB_IMAGES,
  fromFreeExerciseDb,
  fromWger,
  mergeLibraries,
  nameKey,
  stripHtml,
  type WgerRecord,
} from './library';

const fed = (over = {}) => fromFreeExerciseDb({ id: 'Barbell_Curl', name: 'Barbell Curl', category: 'strength', level: 'beginner', equipment: 'barbell', primaryMuscles: ['biceps'], secondaryMuscles: ['forearms'], instructions: ['Stand up.', 'Curl.'], images: ['Barbell_Curl/0.jpg'], ...over });

const wgerRecord = (over: Partial<WgerRecord> = {}): WgerRecord => ({
  id: 7,
  category: { name: 'Arms' },
  muscles: [{ id: 1 }],
  muscles_secondary: [{ id: 13 }, { id: 1 }],
  equipment: [{ id: 1 }, { id: 8 }],
  license: { short_name: 'CC-BY-SA 4' },
  license_author: 'sevae',
  images: [{ image: 'https://wger.de/media/x.png' }],
  translations: [
    { language: 2, name: 'Barbell Curl', description: '<p>Curl <b>it</b>.</p>', license_author: 'ana' },
    { language: 4, name: 'Curl con barra', description: '<ol><li>Sube</li><li>Baja</li></ol>', license_author: 'luis' },
  ],
  ...over,
});

describe('free-exercise-db', () => {
  it('normaliza la ficha y completa las URLs de las imágenes', () => {
    expect(fed()).toMatchObject({
      source: 'free-exercise-db',
      sourceId: 'Barbell_Curl',
      nameEn: 'Barbell Curl',
      nameEs: null,
      equipment: ['barbell'],
      instructionsEn: 'Stand up.\nCurl.',
      images: [FREE_EXERCISE_DB_IMAGES + 'Barbell_Curl/0.jpg'],
      license: 'Unlicense',
    });
  });

  it('tolera campos ausentes', () => {
    expect(fromFreeExerciseDb({ id: 'x', name: ' Plank ', equipment: null })).toMatchObject({ nameEn: 'Plank', equipment: [], primaryMuscles: [], images: [], instructionsEn: '' });
  });
});

describe('wger', () => {
  it('traduce músculos y equipamiento al vocabulario común sin repetidos', () => {
    const e = fromWger(wgerRecord())!;
    expect(e.primaryMuscles).toEqual(['biceps']);
    expect(e.secondaryMuscles).toEqual(['biceps']);
    expect(e.equipment).toEqual(['barbell', 'other']);
    expect(e).toMatchObject({ nameEn: 'Barbell Curl', nameEs: 'Curl con barra', category: 'strength', license: 'CC-BY-SA 4', attribution: 'sevae, ana, luis' });
  });

  it('limpia el HTML de las descripciones', () => {
    const e = fromWger(wgerRecord())!;
    expect(e.instructionsEn).toBe('Curl it.');
    expect(e.instructionsEs).toBe('Sube\nBaja');
  });

  it('sin traducción al inglés se descarta y sin español queda nameEs a null', () => {
    expect(fromWger(wgerRecord({ translations: [{ language: 4, name: 'Solo español' }] }))).toBeNull();
    expect(fromWger(wgerRecord({ translations: [{ language: 2, name: 'Only English' }] }))!.nameEs).toBeNull();
  });

  it('marca el cardio y deja el resto como fuerza', () => {
    expect(fromWger(wgerRecord({ category: { name: 'Cardio' } }))!.category).toBe('cardio');
  });
});

describe('stripHtml / nameKey', () => {
  it('stripHtml decodifica entidades y colapsa saltos', () => {
    expect(stripHtml('<p>A&nbsp;&amp;&nbsp;B</p><p></p><p></p><p>C</p>')).toBe('A & B\n\nC');
  });

  it('nameKey ignora mayúsculas, acentos y signos', () => {
    expect(nameKey('Barbell  Curl!')).toBe(nameKey('barbell-curl'));
    expect(nameKey('Sentadilla Búlgara')).toBe('sentadillabulgara');
  });
});

describe('mergeLibraries', () => {
  it('no duplica el mismo ejercicio y añade español y licencia de wger a la ficha de free-exercise-db', () => {
    const out = mergeLibraries([fed()], [fromWger(wgerRecord())!]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ source: 'free-exercise-db', nameEs: 'Curl con barra', license: 'Unlicense + CC-BY-SA 4', attribution: 'sevae, ana, luis' });
    expect(out[0].images).toHaveLength(1);
    expect(out[0].instructionsEn).toBe('Stand up.\nCurl.');
  });

  it('conserva los ejercicios que solo existen en una fuente', () => {
    const only = fromWger(wgerRecord({ id: 9, translations: [{ language: 2, name: 'Zottman Curl' }] }))!;
    const out = mergeLibraries([fed()], [only]);
    expect(out.map((e) => e.nameEn).sort()).toEqual(['Barbell Curl', 'Zottman Curl']);
  });

  it('un duplicado de wger sin español no cambia la licencia de la ficha', () => {
    const noEs = fromWger(wgerRecord({ translations: [{ language: 2, name: 'Barbell Curl' }] }))!;
    expect(mergeLibraries([fed()], [noEs])[0].license).toBe('Unlicense');
  });

  it('descarta repetidos dentro de la misma fuente', () => {
    expect(mergeLibraries([fed(), fed({ id: 'Barbell_Curl_2' })], [])).toHaveLength(1);
  });
});
