import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run migrations.');
}

const sql = neon(databaseUrl);
const dir = join(process.cwd(), 'drizzle');

async function main() {
  await sql.query('CREATE TABLE IF NOT EXISTS _app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const applied = new Set((await sql.query('SELECT name FROM _app_migrations')).map(row => row.name as string));

  const files = (await readdir(dir)).filter(file => file.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;

    // El driver HTTP no admite varias sentencias por consulta; estos .sql no usan `;` dentro de literales.
    const statements = (await readFile(join(dir, file), 'utf8'))
      .split(';')
      .map(statement => statement.trim())
      .filter(Boolean);

    for (const statement of statements) await sql.query(statement);
    await sql.query('INSERT INTO _app_migrations (name) VALUES ($1)', [file]);
    console.log(`Applied drizzle/${file}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
