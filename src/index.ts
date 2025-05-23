import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import { trimTrailingSlash } from "hono/trailing-slash"
import api from "./routes/api"
import healthcheck from "./routes/healthcheck"

const app = new Hono()

app.use(logger()).use(cors()).use(secureHeaders()).use(trimTrailingSlash())

app.route("/api", api)
app.route("/healthcheck", healthcheck)

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}
