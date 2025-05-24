import { Hono } from "hono"
import { findContent } from "../handlers"

const api = new Hono()

api.get("/yt/:id", ...findContent)

export default api
