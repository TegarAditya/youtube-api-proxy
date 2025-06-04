import { Hono } from "hono"
import { clearContents, findContent } from "../handlers"

const api = new Hono()

api.get("/video/:id", ...findContent)
api.get("/clear", ...clearContents)

export default api
