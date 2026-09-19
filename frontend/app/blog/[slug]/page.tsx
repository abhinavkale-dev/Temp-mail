import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Header, Footer, BorderDecoration } from "@/components/layout"
import { Screen } from "@/components/screen"
import { getArticle, getRecentSlugs } from "@/lib/blog/outrank"
import type { Article } from "outrank-next-js-blog"

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getRecentSlugs(20)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: "Article not found | Temp Mail" }

  const title = `${article.title} | Temp Mail`
  return {
    title,
    description: article.meta_description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title,
      description: article.meta_description,
      url: `/blog/${article.slug}`,
      type: "article",
      publishedTime: article.created_at ? new Date(article.created_at).toISOString() : undefined,
      images: article.image_url ? [{ url: article.image_url }] : undefined,
    },
  }
}

function formatDate(value: string): string {
  if (!value) return ""
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function ArticleContent({ article }: { article: Article }) {
  const published = formatDate(article.created_at)
  return (
    <main className="flex-1 overflow-y-auto bg-white px-4 py-12 text-gray-900 dark:bg-[#0D0E0E] dark:text-white sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href="/blog"
          className="text-sm font-medium text-gray-600 transition-colors hover:text-pink-500 dark:text-gray-400"
        >
          ← All articles
        </Link>

        <header className="mt-6">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{article.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 text-sm text-gray-600 dark:text-gray-400">
            {published && <time dateTime={new Date(article.created_at).toISOString()}>{published}</time>}
            {published && article.reading_time_minutes ? <span aria-hidden="true">·</span> : null}
            {article.reading_time_minutes ? <span>{article.reading_time_minutes} min read</span> : null}
          </div>
        </header>

        {article.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image_url}
            alt=""
            className="mt-8 w-full rounded-lg border border-gray-200 dark:border-gray-800"
          />
        )}

        <div
          className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-a:text-pink-600 dark:prose-a:text-pink-400 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </article>
    </main>
  )
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  return (
    <div className="relative min-h-screen overflow-y-auto bg-gray-100 dark:bg-[#0D0E0E]">
      <BorderDecoration />

      <div className="flex min-h-screen flex-col md:hidden">
        <Header />
        <ArticleContent article={article} />
        <Footer />
      </div>

      <div className="hidden md:block">
        <Screen>
          <Header />
          <ArticleContent article={article} />
          <Footer />
        </Screen>
      </div>
    </div>
  )
}
