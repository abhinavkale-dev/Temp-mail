# Blog setup

The blog (`/blog`) reads articles from a **separate Neon Postgres database**, isolated
from the temp-mail app. Articles are MDX, rendered on-demand and edge-cached (ISR), so
it scales to thousands of posts.

## Environment variables

Set these in `frontend/.env` (local) **and** in Vercel → Project → Settings →
Environment Variables (Production):

| Variable | What it is |
| --- | --- |
| `BLOGS_URL` | Neon connection string (server-only — no `NEXT_PUBLIC_` prefix). |
| `REVALIDATE_SECRET` | Any hard-to-guess random string; guards the revalidate endpoint. |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

After adding/changing env vars in Vercel, **redeploy** — env changes only apply to new
deployments.

## One-time database setup

```bash
cd frontend
pnpm db:push     # creates the "articles" table in Neon (from lib/blog/schema.ts)
pnpm db:seed     # inserts the sample articles (upsert — safe to re-run)
```

## Adding a new article

1. Add a new object to the `samples` array in `scripts/seed-blog.ts` (or insert a row
   directly in Neon). Fields: `slug`, `title`, `description`, `content` (MDX),
   `coverImage`, `tags`, `author`, `readingTime`, `status: "published"`, `publishedAt`.
2. (Optional) Generate a cover image in the site's style — see below — and set
   `coverImage: "/blog/<slug>.png"`.
3. Insert it: `pnpm db:seed`.
4. Make it live without a redeploy — call the revalidate endpoint (below).

Only rows with `status = 'published'` are shown. Set `status: "draft"` to stage one.

## Cover images

Covers live in `frontend/public/blog/<slug>.png` (1200×630 recommended, also used as the
OpenGraph/social share image). The "what-is-temp-mail" cover was generated from an SVG
rasterized with `sharp`; reuse that approach for a consistent on-brand look.

## Publishing / refreshing (on-demand revalidation)

Articles are cached, so after inserting or editing a row in the DB, tell the site to
refresh:

```bash
# refresh one article
curl -X POST https://temp-mail.abhi.at/api/blog/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"slug":"what-is-temp-mail"}'

# refresh the whole blog list (omit the body)
curl -X POST https://temp-mail.abhi.at/api/blog/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET"
```

The secret in the header must match `REVALIDATE_SECRET` exactly, or the request is
rejected with `401`.

## How it scales

- `/blog/[slug]` articles are statically generated on first request and edge-cached
  (ISR). Reads are served from cache — the DB is not hit per request.
- The `/blog` index is paginated (15 per page) and its query is cached.
- `generateStaticParams` only pre-builds the ~20 most recent articles at build time; the
  rest render on first visit, so build times stay flat no matter how many posts exist.
- The sitemap lists every published article and regenerates hourly.
