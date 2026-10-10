import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { serverEnv } from '@/lib/env';

const { DATABASE_URL } = serverEnv();
const sql = neon(DATABASE_URL);

export const db = drizzle(sql);