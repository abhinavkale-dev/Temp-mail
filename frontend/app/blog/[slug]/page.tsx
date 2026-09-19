import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote, type MDXRemoteOptions } from "next-mdx-remote-client/rsc"
import remarkGfm from "remark-gfm"
import rehypePrettyCode from "rehype-pretty-code"
import { Header, Footer, BorderDecoration } from "@/components/layout"
import { Screen } from "@/components/screen"
import { mdxComponents } from "@/components/blog/mdx"
import { getPostBySlug, getRecentSlugs } from "@/lib/blog/queries"
import type { Article } from "@/lib/blog/schema"

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
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Article not found | Temp Mail" }

  const title = `${post.title} | Temp Mail`
  return {
    title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  }
}

const mdxOptions: MDXRemoteOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
  },
}

function formatDate(date: Date | null): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function ArticleContent({ post }: { post: Article }) {
  const published = formatDate(post.publishedAt)
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
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 text-sm text-gray-600 dark:text-gray-400">
            {published && <time dateTime={new Date(post.publishedAt as Date).toISOString()}>{published}</time>}
            {post.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.author}</span>
              </>
            )}
            {post.readingTime ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime} min read</span>
              </>
            ) : null}
          </div>
        </header>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="mt-8 w-full rounded-lg border border-gray-200 dark:border-gray-800"
          />
        )}

        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-a:no-underline prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={mdxOptions}
            onError={() => (
              <p className="text-red-600 dark:text-red-400">This article could not be rendered.</p>
            )}
          />
        </div>
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
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="relative min-h-screen overflow-y-auto bg-gray-100 dark:bg-[#0D0E0E]">
      <BorderDecoration />

      <div className="flex min-h-screen flex-col md:hidden">
        <Header />
        <ArticleContent post={post} />
        <Footer />
      </div>

      <div className="hidden md:block">
        <Screen>
          <Header />
          <ArticleContent post={post} />
          <Footer />
        </Screen>
      </div>
    </div>
  )
}
