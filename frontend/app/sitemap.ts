import type { MetadataRoute } from "next"
import { getAllPublishedForSitemap } from "@/lib/blog/queries"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://temp-mail.abhi.at"

// Regenerate hourly so newly published articles enter the sitemap without a redeploy.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllPublishedForSitemap()

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/blog/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [
    {
      url: siteUrl,
      lastModified: "2026-09-18",
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/pikoreels`,
      lastModified: "2026-09-18",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: "2026-09-18",
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...articleEntries,
  ]
}
