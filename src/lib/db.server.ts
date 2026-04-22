import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __memoryKv: Map<string, unknown> | undefined;
  // eslint-disable-next-line no-var
  var __memoryOcCounter: number | undefined;
}

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function getMemoryKv() {
  if (!globalThis.__memoryKv) {
    globalThis.__memoryKv = new Map<string, unknown>();
  }
  return globalThis.__memoryKv;
}

export function getPool(): Pool {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL no está configurada");
  }
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
  }
  return globalThis.__pgPool;
}

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  if (!hasDatabaseUrl()) {
    return (getMemoryKv().get(key) as T | undefined) ?? fallback;
  }
  const pool = getPool();
  const res = await pool.query<{ value: T }>(
    "SELECT value FROM app_kv WHERE key = $1",
    [key],
  );
  if (res.rowCount === 0) return fallback;
  return res.rows[0].value;
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (!hasDatabaseUrl()) {
    getMemoryKv().set(key, value);
    return;
  }
  const pool = getPool();
  await pool.query(
    `INSERT INTO app_kv (key, value, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}

export async function nextOcConsecutivo(): Promise<number> {
  if (!hasDatabaseUrl()) {
    globalThis.__memoryOcCounter = (globalThis.__memoryOcCounter ?? 0) + 1;
    return globalThis.__memoryOcCounter;
  }
  const pool = getPool();
  const res = await pool.query<{ value: number }>(
    "UPDATE oc_counter SET value = value + 1 WHERE id = 1 RETURNING value",
  );
  return res.rows[0].value;
}
