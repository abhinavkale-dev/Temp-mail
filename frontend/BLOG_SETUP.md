# Blog setup (Outrank)

The blog (`/blog`) is powered by **Outrank.so**. Outrank is the CMS — you generate and
publish SEO articles in the Outrank dashboard, and this site reads them server-side via
Outrank's private API using the [`outrank-next-js-blog`](https://www.outrank.so/docs/nextjs-blog)
client. Articles are cached and edge-served (ISR), so it scales to thousands of posts.

## Environment variables

Set these in `frontend/.env` (local) **and** in Vercel → Project → Settings →
Environment Variables (Production):

| Variable | What it is |
| --- | --- |
| `OUTRANK_BLOG_API_KEY` | Private Outrank Blog API key (server-only — never use `NEXT_PUBLIC_`). |
| `REVALIDATE_SECRET` | Any hard-to-guess random string; guards the revalidate endpoint. |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

After adding/changing env vars in Vercel, **redeploy** — env changes only apply to new
deployments.

## Publishing articles

1. Write/generate and publish an article in the **Outrank dashboard**.
2. It appears on `/blog` automatically within the cache window (hourly), or immediately
   if you trigger revalidation (below). No code change or redeploy needed.

There is nothing to manage in this repo — Outrank owns the content.

## Refreshing immediately (on-demand revalidation)

Articles are cached, so to push a new/updated Outrank article live right away:

```bash
# refresh one article
curl -X POST https://temp-mail.abhi.at/api/blog/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"slug":"the-article-slug"}'

# refresh the whole blog list + sitemap (omit the body)
curl -X POST https://temp-mail.abhi.at/api/blog/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET"
```

If Outrank supports outbound webhooks on publish, point one at
`POST /api/blog/revalidate` with the `x-revalidate-secret` header so content goes live
instantly. Otherwise the hourly ISR window keeps it current.

## How it maps

The site normalizes Outrank's fields (`lib/blog/outrank.ts`):

| Outrank field | Used as |
| --- | --- |
| `title`, `slug`, `tags` | title / URL / tags |
| `meta_description` | list summary + `<meta description>` + OpenGraph |
| `image_url` | cover image (list + article + OG image) |
| `reading_time_minutes` | "N min read" |
| `html` | article body (rendered in a `prose` wrapper) |
| `created_at` / `updated_at` | published date / sitemap `lastModified` |

## How it scales

- `/blog/[slug]` articles are generated on first request and edge-cached (ISR); reads are
  served from cache, not from Outrank per request.
- The `/blog` index is paginated (12 per page) and cached.
- `generateStaticParams` pre-builds only the ~20 most recent articles at build time; the
  rest render on first visit, so build times stay flat regardless of article count.
- The sitemap lists every published article and regenerates hourly.
