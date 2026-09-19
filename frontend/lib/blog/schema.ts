import { pgTable, serial, text, integer, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    tags: text("tags").array().notNull().default([]),
    author: text("author"),
    status: text("status").notNull().default("draft"),
    readingTime: integer("reading_time"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("articles_slug_idx").on(t.slug),
    index("articles_status_published_idx").on(t.status, t.publishedAt),
  ]
)

export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
