import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { articles, type NewArticle } from "../lib/blog/schema"

const url = process.env.BLOGS_URL
if (!url) {
  console.error("BLOGS_URL is not set. Add it to frontend/.env and retry.")
  process.exit(1)
}

const db = drizzle(neon(url), { schema: { articles } })

const samples: NewArticle[] = [
  {
    slug: "what-is-temp-mail",
    title: "What Is Temp Mail? A Complete Guide to Disposable Email",
    description:
      "How temporary email works, when to use a disposable inbox, and how it keeps spam out of your real inbox.",
    coverImage: "/blog/what-is-temp-mail.png",
    author: "Temp Mail",
    status: "published",
    readingTime: 4,
    tags: ["guides", "privacy"],
    publishedAt: new Date(),
    content: `**Temp Mail** (temporary or disposable email) gives you a working inbox in seconds — no sign-up, no password, no personal details. You get an address, receive messages, read them in the browser, and walk away.

## Why people use temporary email

Your primary inbox is valuable. Every site you hand it to is one more source of newsletters, "special offers", and the occasional data breach. A disposable address absorbs all of that for you.

- Sign up for a service without exposing your real address
- Verify an account or grab a download without the follow-up marketing
- Test your own app's signup and email flows
- Keep one-off, low-trust signups away from your main inbox

## How it works

When you create an address on Temp Mail, a real mailbox is provisioned on our mail server. Incoming messages are received over SMTP, parsed, and shown to you instantly.

\`\`\`text
you@temp-mail.abhi.at  →  SMTP server  →  parsed  →  your browser
\`\`\`

No message ever touches your real inbox, and the mailbox is meant to be short-lived.

## When to use it (and when not to)

| Use case | Good fit? |
| --- | --- |
| One-off signups and trials | Yes |
| Email verification / OTP codes | Yes |
| Downloading a gated PDF or coupon | Yes |
| Banking, work, or government accounts | No |
| Anything you need to recover later | No |
| Password resets for real accounts | No |

The rule of thumb: if losing access to the inbox would matter tomorrow, use your real email instead.

## How to use Temp Mail

1. Open the [home page](/) — an address is ready immediately, or type a custom username.
2. Copy the address and paste it wherever you're signing up.
3. Watch messages arrive in real time and open them in the browser.

That's it. When you're done, just close the tab.

## Is temporary email safe?

Temp Mail is safest for *receiving* low-stakes messages. Because inboxes are public and ephemeral, never use one for sensitive information, and never treat it as long-term storage. Used for what it's built for — quick, throwaway signups — it's one of the simplest ways to cut spam and protect your privacy.`,
  },
  {
    slug: "welcome-to-the-temp-mail-blog",
    title: "Welcome to the Temp Mail Blog",
    description: "What this blog is about and how disposable email keeps your real inbox clean.",
    author: "Temp Mail",
    status: "published",
    readingTime: 2,
    tags: ["announcements"],
    publishedAt: new Date(),
    content: `Welcome to the **Temp Mail** blog.

Here we write about disposable email, privacy, and avoiding spam.

## Why temporary email?

- Sign up for services without exposing your real address
- Verify accounts without the follow-up marketing
- Keep your primary inbox clean

| Use case | Good fit? |
| --- | --- |
| One-off signups | Yes |
| Long-term accounts | No |

Enjoy the reading.`,
  },
  {
    slug: "how-disposable-email-protects-your-privacy",
    title: "How Disposable Email Protects Your Privacy",
    description: "A short guide to using throwaway inboxes safely and when not to.",
    author: "Temp Mail",
    status: "published",
    readingTime: 3,
    tags: ["privacy", "guides"],
    publishedAt: new Date(Date.now() - 86_400_000),
    content: `Disposable email addresses let you receive messages without handing over your real inbox.

## When to use one

Use a temporary address for one-off verifications and trials.

\`\`\`ts
const inbox = createTempMailbox()
console.log(inbox.address)
\`\`\`

## When not to

Never use a temporary inbox for banking, work, or anything you need long term — these mailboxes are ephemeral by design.`,
  },
]

async function main() {
  for (const article of samples) {
    await db
      .insert(articles)
      .values(article)
      .onConflictDoUpdate({
        target: articles.slug,
        set: {
          title: article.title,
          description: article.description,
          content: article.content,
          coverImage: article.coverImage,
          author: article.author,
          status: article.status,
          readingTime: article.readingTime,
          tags: article.tags,
          publishedAt: article.publishedAt,
          updatedAt: new Date(),
        },
      })
    console.log(`Seeded: ${article.slug}`)
  }
  console.log("Done.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
