import Link from "next/link"
import type { PostListItem } from "@/lib/blog/queries"

function formatDate(date: Date | null): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function PostCard({ post }: { post: PostListItem }) {
  const published = formatDate(post.publishedAt)
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border border-dashed border-gray-300 p-6 transition-colors hover:border-pink-500 dark:border-gray-700 dark:hover:border-pink-500"
    >
      <article>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="mb-5 w-full rounded-md border border-gray-200 dark:border-gray-800"
          />
        )}
        <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600 dark:text-gray-400">
          {published && <time dateTime={new Date(post.publishedAt as Date).toISOString()}>{published}</time>}
          {published && post.readingTime ? <span aria-hidden="true">·</span> : null}
          {post.readingTime ? <span>{post.readingTime} min read</span> : null}
        </div>
        <h2 className="mt-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-pink-500 dark:text-white sm:text-2xl">
          {post.title}
        </h2>
        {post.description && (
          <p className="mt-2 text-pretty leading-relaxed text-gray-600 dark:text-gray-300">{post.description}</p>
        )}
      </article>
    </Link>
  )
}
