import { Hono } from "hono"
import { checkKVHealth } from "../libs/kv"

const healthcheck = new Hono()

healthcheck.get("/", async (c) => {
  try {
    const kvHealth = checkKVHealth()
    if (kvHealth) return c.json({ message: "OK" }, 200)
      
    return c.json({ message: "KV store is not healthy" }, 500)
  } catch (error) {
    console.error(error)
    return c.json({ message: error }, 500)
  }
})

export default healthcheck
