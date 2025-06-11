import { createFactory } from "hono/factory"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { Context } from "hono"
import { clearKVStore, getKeyValue, setKeyValue } from "../libs/kv"
import { getYouTubeContentData, isValidYouTubeVideoId } from "../libs/yt"

const TTL = Number(process.env.CACHE_TTL) || 60 * 60 * 24

const validateCacheExpiration = (cachedAt: string): boolean => {
  const expirationTime = new Date(cachedAt).getTime() + TTL * 1000
  return expirationTime > Date.now()
}

const factory = createFactory()

export const findContent = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      id: z.string(),
    })
  ),
  async (c: Context) => {
    const id = c.req.param("id")

    const content = getKeyValue(id)
    if (content && validateCacheExpiration(content.cached_at)) {
      return c.json(JSON.parse(content.value))
    }

    const isValid = await isValidYouTubeVideoId(id)
    if (!isValid) return c.text("Invalid YouTube video ID", 400)

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) return c.text("YOUTUBE_API_KEY is not set", 500)

    const newData = await getYouTubeContentData(id, apiKey)
    if (!newData) return c.text("No data found", 404)

    try {
      setKeyValue(id, JSON.stringify(newData))
    } catch (error) {
      console.error(`Error setting key "${id}":`, (error as Error).message)
    }

    return c.json(newData)
  }
)

export const clearContents = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      key: z.string(),
    })
  ),
  async (c: Context) => {
    const providedKey = c.req.query("key")
    if (!providedKey) return c.text("Missing key parameter", 400)

    const secretKey = process.env.SECRET_KEY
    if (!secretKey) return c.text("SECRET_KEY is not set", 500)

    if (providedKey !== secretKey) {
      return c.text("Unauthorized", 401)
    }

    try {
      clearKVStore()
      return c.text("Cache cleared successfully")
    } catch (error) {
      console.error(`Error clearing cache:`, (error as Error).message)
      return c.text("Internal Server Error", 500)
    }
  }
)
