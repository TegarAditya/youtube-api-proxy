import { Hono } from "hono"

const healthcheck = new Hono()

healthcheck.get("/", async (c) => {
  try {
    return c.json({ message: "OK" }, 200)
  } catch (error) {
    console.error(error)
    return c.json({ message: error }, 500)
  }
})

export default healthcheck
