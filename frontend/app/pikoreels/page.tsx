import type { Metadata } from "next"
import { ArrowUpRight, Mail } from "lucide-react"
import { Header, Footer, BorderDecoration } from "@/components/layout"
import { Screen } from "@/components/screen"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "PikoReels for creators | Temp Mail",
  description:
    "Learn how PikoReels helps creators make, plan, and publish short-form video.",
  alternates: {
    canonical: "/pikoreels",
  },
  openGraph: {
    title: "PikoReels for creators | Temp Mail",
    description:
      "Learn how PikoReels helps creators make, plan, and publish short-form video.",
    url: "/pikoreels",
  },
}

const externalLinkClassName =
  "inline-flex items-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-pink-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 dark:bg-white dark:text-black dark:hover:bg-pink-500 dark:hover:text-white"

function PikoReelsContent() {
  return (
    <main className="flex-1 overflow-y-auto bg-white px-4 py-12 text-gray-900 dark:bg-[#0D0E0E] dark:text-white sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-3xl">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          A creator resource
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Make short-form video with more intention.
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-gray-600 dark:text-gray-300">
          PikoReels is a workspace for creating, planning, and publishing short-form video. It brings AI video tools and a content calendar into one place for creators and teams.
        </p>

        <section className="mt-12 border-y border-dashed border-gray-300 py-2 dark:border-gray-700" aria-labelledby="what-you-can-do">
          <h2 id="what-you-can-do" className="sr-only">
            What you can do with PikoReels
          </h2>
          <dl className="divide-y divide-dashed divide-gray-300 dark:divide-gray-700">
            <div className="grid gap-2 py-6 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="font-semibold">Create a first cut</dt>
              <dd className="leading-relaxed text-gray-600 dark:text-gray-300">
                Turn an idea into an AI-generated video, with options for text, images, and video prompts.
              </dd>
            </div>
            <div className="grid gap-2 py-6 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="font-semibold">Plan your output</dt>
              <dd className="leading-relaxed text-gray-600 dark:text-gray-300">
                Arrange upcoming reels in a calendar before a posting schedule gets away from you.
              </dd>
            </div>
            <div className="grid gap-2 py-6 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="font-semibold">Publish on schedule</dt>
              <dd className="leading-relaxed text-gray-600 dark:text-gray-300">
                Prepare a reel once, then use a connected workspace to publish it when the campaign calls for it.
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-12 max-w-2xl" aria-labelledby="temporary-email-note">
          <h2 id="temporary-email-note" className="text-2xl font-bold tracking-tight">
            A note on temporary email
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">
            A temporary address is best reserved for low-stakes sign-ups or inbox testing. Use a permanent email address for services, account recovery, and messages you need to retain.
          </p>
        </section>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://pikoreels.com"
            target="_blank"
            rel="noopener noreferrer"
            className={externalLinkClassName}
          >
            Visit PikoReels
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href="/">
              <Mail className="size-4" aria-hidden="true" />
              Create a temp email
            </a>
          </Button>
        </div>
      </article>
    </main>
  )
}

export default function PikoReelsPage() {
  return (
    <div className="relative min-h-screen overflow-y-auto bg-gray-100 dark:bg-[#0D0E0E]">
      <BorderDecoration />

      <div className="flex min-h-screen flex-col md:hidden">
        <Header />
        <PikoReelsContent />
        <Footer />
      </div>

      <div className="hidden md:block">
        <Screen>
          <Header />
          <PikoReelsContent />
          <Footer />
        </Screen>
      </div>
    </div>
  )
}
