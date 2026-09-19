import "server-only"
import { unstable_cache } from "next/cache"
import { BlogClient, type Article, type ArticleSummary } from "outrank-next-js-blog"

export const PER_PAGE = 12

const apiKey = process.env.OUTRANK_BLOG_API_KEY

// `client` is null when OUTRANK_BLOG_API_KEY is unset so the site still builds and the
// blog renders an empty state instead of crashing. Every query guards on this.
const client = apiKey ? new BlogClient(apiKey) : null

// Normalized shape the UI consumes, mapped from Outrank's ArticleSummary field names.
export type BlogSummary = {
  slug: string
  title: string
  description: string
  coverImage: string | null
  tags: string[]
  readingTime: number | null
  publishedAt: Date | null
}

function toSummary(a: ArticleSummary): BlogSummary {
  return {
    slug: a.slug,
    title: a.title,
    description: a.meta_description ?? "",
    coverImage: a.image_url || null,
    tags: a.tags ?? [],
    readingTime: a.reading_time_minutes ?? null,
    publishedAt: a.created_at ? new Date(a.created_at) : null,
  }
}

export type BlogPage = {
  posts: BlogSummary[]
  total: number
  totalPages: number
}

export function getArticlesPage(page: number): Promise<BlogPage> {
  return unstable_cache(
    async () => {
      if (!client) return { posts: [], total: 0, totalPages: 0 }
      try {
        const res = await client.getArticles(page, PER_PAGE)
        return {
          posts: res.articles.map(toSummary),
          total: res.total,
          totalPages: res.total_pages,
        }
      } catch (err) {
        // Degrade to an empty list rather than 500 the page on an Outrank API failure.
        console.error("[outrank] getArticles failed:", err)
        return { posts: [], total: 0, totalPages: 0 }
      }
    },
    ["blog-page", String(page)],
    { tags: ["blog"], revalidate: 3600 }
  )()
}

export function getArticle(slug: string): Promise<Article | null> {
  return unstable_cache(
    async () => {
      if (!client) return null
      try {
        return await client.getArticle(slug)
      } catch (err) {
        console.error(`[outrank] getArticle(${slug}) failed:`, err)
        return null
      }
    },
    ["blog-article", slug],
    { tags: ["blog", `blog:${slug}`], revalidate: 3600 }
  )()
}

// Only the most recent slugs are pre-rendered (generateStaticParams); the rest render
// on first request (dynamicParams = true) then cache.
export async function getRecentSlugs(limit = 20): Promise<string[]> {
  if (!client) return []
  try {
    const res = await client.getArticles(1, limit)
    return res.articles.map((a) => a.slug)
  } catch (err) {
    console.error("[outrank] getRecentSlugs failed:", err)
    return []
  }
}

export function getAllForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  // Tagged "blog" so POST /api/blog/revalidate refreshes the sitemap too, not just pages.
  return unstable_cache(
    async () => {
      if (!client) return []
      try {
        const all = await client.getAllArticles()
        return all.map((a) => ({
          slug: a.slug,
          updatedAt: a.updated_at ? new Date(a.updated_at) : new Date(),
        }))
      } catch (err) {
        console.error("[outrank] getAllArticles failed:", err)
        return []
      }
    },
    ["blog-sitemap"],
    { tags: ["blog"], revalidate: 3600 }
  )()
}
