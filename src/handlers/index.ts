import { createFactory } from "hono/factory"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { Context } from "hono"
import { getKeyValue, setKeyValue } from "../libs/kv"
import { getYouTubeContentData } from "../libs/yt"

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

    if (content) return c.json(await JSON.parse(content))

    const newData = await getYouTubeContentData(id, process.env.YOUTUBE_API_KEY as string)

    if (!newData) return c.text("No data found", 404)

    try {
        setKeyValue(id, JSON.stringify(newData))
    } catch (error) {
        console.error(`Error setting key "${id}":`, (error as Error).message)
    }

    return c.json(newData)
  }
)
