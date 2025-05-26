import Database from "bun:sqlite"

interface KeyValue {
  key: string
  value: string
}

const kv = new Database("kv_store.sqlite", { strict: true, create: true })

export function initKVStore() {
  try {
    kv.exec(`CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)`)
  } catch (error) {
    console.error("Error initializing kv_store:", (error as Error).message)
  }
}

export function setKeyValue(key: string, value: string): void {
  try {
    const stmt = kv.prepare(`
        INSERT INTO kv_store (key, value) VALUES (@key, @value)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `)
    stmt.run({ key, value })
  } catch (error) {
    console.error(`Error setting key "${key}":`, (error as Error).message)
  }
}

export function getKeyValue(key: string): string | null {
  try {
    const stmt = kv.prepare("SELECT value FROM kv_store WHERE key = @key")
    const result = stmt.get({ key }) as KeyValue | undefined
    return result ? result.value : null
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
