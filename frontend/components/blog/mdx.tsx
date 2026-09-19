import Link from "next/link"
import type { MDXComponents } from "mdx/types"

// Article bodies are wrapped in Tailwind Typography (`prose`), so most elements
// are styled by the plugin. We only override links for the pink accent + safe
// handling of external URLs.
export const mdxComponents: MDXComponents = {
  a: ({ href = "", children, ...props }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#")
    const className = "font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-pink-500 hover:decoration-pink-500 dark:text-white dark:decoration-gray-600"
    if (isInternal) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
        {children}
      </a>
    )
  },
}
