import "server-only"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const url = process.env.BLOGS_URL

// `db` is null when BLOGS_URL is unset so the site still builds and the
// blog renders an empty state instead of crashing. Every query guards on this.
export const db = url ? drizzle(neon(url), { schema }) : null
