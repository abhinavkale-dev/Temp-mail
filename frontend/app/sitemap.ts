import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://temp-mail.abhi.at"

export default function sitemap(): MetadataRoute.Sitemap {
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
  ]
}
