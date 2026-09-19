import { revalidateTag } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

// POST /api/blog/revalidate
// Header:  x-revalidate-secret: <REVALIDATE_SECRET>
// Body (optional): { "slug": "some-article" } to also bust that article's cache.
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let slug: string | undefined
  try {
    const body = await req.json()
    if (body && typeof body.slug === "string") slug = body.slug
  } catch {
    // no/invalid body — just revalidate the whole blog
  }

  revalidateTag("blog")
  if (slug) revalidateTag(`blog:${slug}`)

  return NextResponse.json({ revalidated: true, slug: slug ?? null, now: Date.now() })
}
