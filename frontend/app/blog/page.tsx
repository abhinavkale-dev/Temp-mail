import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Header, Footer, BorderDecoration } from "@/components/layout"
import { Screen } from "@/components/screen"
import { PostCard } from "@/components/blog/PostCard"
import { getPublishedPage, type PostPage } from "@/lib/blog/queries"

const BLOG_DESCRIPTION = "Guides and articles on disposable email, privacy, and avoiding spam."

// Self-referencing canonical per page so paginated pages aren't collapsed into page 1.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)
  const canonical = page > 1 ? `/blog?page=${page}` : "/blog"
  const title = page > 1 ? `Blog — Page ${page} | Temp Mail` : "Blog | Temp Mail"
  return {
    title,
    description: BLOG_DESCRIPTION,
    alternates: { canonical },
    openGraph: { title, description: BLOG_DESCRIPTION, url: canonical },
  }
}

function Pager({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null
  const linkClass =
    "rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-pink-500 hover:text-pink-500 dark:border-gray-700 dark:text-white"
  const disabledClass =
    "rounded-md border border-dashed border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 dark:border-gray-800 dark:text-gray-600"
  return (
    <nav className="mt-12 flex items-center justify-between" aria-label="Blog pagination">
      {page > 1 ? (
        <Link href={page === 2 ? "/blog" : `/blog?page=${page - 1}`} className={linkClass}>
          ← Newer
        </Link>
      ) : (
        <span className={disabledClass}>← Newer</span>
      )}
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={`/blog?page=${page + 1}`} className={linkClass}>
          Older →
        </Link>
      ) : (
        <span className={disabledClass}>Older →</span>
      )}
    </nav>
  )
}

function BlogIndexContent({ page, data }: { page: number; data: PostPage }) {
  return (
    <main className="flex-1 overflow-y-auto bg-white px-4 py-12 text-gray-900 dark:bg-[#0D0E0E] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-10">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-gray-600 dark:text-gray-300">
            Guides and articles on disposable email, privacy, and keeping your real inbox clean.
          </p>
        </header>

        {data.posts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600 dark:border-gray-700 dark:text-gray-400">
            No articles yet. Check back soon.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {data.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        <Pager page={page} totalPages={data.totalPages} />
      </div>
    </main>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)
  const data = await getPublishedPage(page)

  // Out-of-range page with content is a soft-404, not an indexable empty page.
  if (data.total > 0 && page > data.totalPages) notFound()

  return (
    <div className="relative min-h-screen overflow-y-auto bg-gray-100 dark:bg-[#0D0E0E]">
      <BorderDecoration />

      <div className="flex min-h-screen flex-col md:hidden">
        <Header />
        <BlogIndexContent page={page} data={data} />
        <Footer />
      </div>

      <div className="hidden md:block">
        <Screen>
          <Header />
          <BlogIndexContent page={page} data={data} />
          <Footer />
        </Screen>
      </div>
    </div>
  )
}
