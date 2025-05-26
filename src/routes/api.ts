import { Hono } from "hono"
import { findContent } from "../handlers"

const api = new Hono()

api.get("/video/:id", ...findContent)

export default api
