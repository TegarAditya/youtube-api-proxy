import { Hono } from "hono"
import { findContent } from "../handlers"
import { initKVStore } from "../libs/kv"

initKVStore()

const api = new Hono()

api.get("/yt/:id", ...findContent)

export default api
