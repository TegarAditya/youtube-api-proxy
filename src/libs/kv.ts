import Database from "bun:sqlite"

interface KeyValue {
  key: string
  value: string
  cached_at: string
}

const kv = new Database("kv_store.sqlite", { strict: true, create: true })

export function initKVStore(): void {
  try {
    kv.exec(`CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT, cached_at DATETIME)`)

    const cacheDateColumnExists = (kv.prepare(
      `SELECT COUNT(*) AS count FROM pragma_table_info('kv_store') WHERE name = 'cached_at'`
    ).get() as { count: number }).count > 0;

    if (!cacheDateColumnExists) {
      kv.exec(`ALTER TABLE kv_store ADD COLUMN cached_at DATETIME`);
      kv.exec(`UPDATE kv_store SET cached_at = CURRENT_TIMESTAMP WHERE cached_at IS NULL`);
    }

    console.log("KV store initialized successfully")
  } catch (error) {
    if (!(error instanceof Error && error.message.includes("duplicate column"))) {
      console.error("Error initializing kv_store:", (error as Error).message)
    }
  }
}

export function setKeyValue(key: string, value: string): void {
  try {
    const stmt = kv.prepare(`
        INSERT INTO kv_store (key, value, cached_at) VALUES (@key, @value, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, cached_at = CURRENT_TIMESTAMP
      `)
    stmt.run({ key, value })
  } catch (error) {
    console.error(`Error setting key "${key}":`, (error as Error).message)
  }
}

export function getKeyValue(key: string): { value: string; cached_at: string } | null {
  try {
    const stmt = kv.prepare("SELECT value, cached_at FROM kv_store WHERE key = @key")
    const result = stmt.get({ key }) as KeyValue | undefined
    return result ? { value: result.value, cached_at: result.cached_at } : null
  } catch (error) {
    console.error(`Error getting key "${key}":`, (error as Error).message)
    return null
  }
}

export function deleteKeyValue(key: string): void {
  try {
    kv.transaction(() => {
      const stmt = kv.prepare("DELETE FROM kv_store WHERE key = @key")
      const info = stmt.run({ key })
      if (info.changes > 0) {
        console.log(`Key "${key}" deleted`)
      }
    })()
  } catch (error) {
    console.error(`Error deleting key "${key}":`, (error as Error).message)
  }
}

export function clearKVStore(): void {
  try {
    kv.exec("DELETE FROM kv_store")
    console.log("KV store cleared")
  } catch (error) {
    console.error("Error clearing kv_store:", (error as Error).message)
  }
}

export const checkKVHealth = (): boolean => {
  try {
    const stmt = kv.prepare("SELECT 1")
    stmt.get()
    return true
  } catch (error) {
    console.error("KV store health check failed:", (error as Error).message)
    return false
  }
}
