import "server-only"
import { unstable_cache } from "next/cache"
import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "./db"
import { articles, type Article } from "./schema"

export const PER_PAGE = 15

export type PostListItem = Pick<
  Article,
  "slug" | "title" | "description" | "coverImage" | "tags" | "author" | "readingTime" | "publishedAt"
>

export type PostPage = {
  posts: PostListItem[]
  total: number
  totalPages: number
}

const listColumns = {
  slug: articles.slug,
  title: articles.title,
  description: articles.description,
  coverImage: articles.coverImage,
  tags: articles.tags,
  author: articles.author,
  readingTime: articles.readingTime,
  publishedAt: articles.publishedAt,
}

export function getPublishedPage(page: number): Promise<PostPage> {
  return unstable_cache(
    async () => {
      if (!db) return { posts: [], total: 0, totalPages: 0 }
      const offset = (page - 1) * PER_PAGE
      const [rows, countRows] = await Promise.all([
        db
          .select(listColumns)
          .from(articles)
          .where(eq(articles.status, "published"))
          .orderBy(desc(articles.publishedAt))
          .limit(PER_PAGE)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(articles)
          .where(eq(articles.status, "published")),
      ])
      const total = countRows[0]?.count ?? 0
      return { posts: rows, total, totalPages: Math.max(1, Math.ceil(total / PER_PAGE)) }
    },
    ["blog-page", String(page)],
    { tags: ["blog"], revalidate: 3600 }
  )()
}

export function getPostBySlug(slug: string): Promise<Article | null> {
  return unstable_cache(
    async () => {
      if (!db) return null
      const rows = await db
        .select()
        .from(articles)
        .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
        .limit(1)
      return rows[0] ?? null
    },
    ["blog-post", slug],
    { tags: ["blog", `blog:${slug}`], revalidate: 3600 }
  )()
}

// Used by generateStaticParams — only the most recent posts are pre-rendered;
// the rest render on-demand on first request (dynamicParams = true) then cache.
export async function getRecentSlugs(limit = 20): Promise<string[]> {
  if (!db) return []
  const rows = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
  return rows.map((r) => r.slug)
}

export async function getAllPublishedForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  if (!db) return []
  return db
    .select({ slug: articles.slug, updatedAt: articles.updatedAt })
    .from(articles)
    .where(eq(articles.status, "published"))
}
