import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const headlineFont = {
  variable: "--font-headline",
  className: "",
}

const featuresFont = {
  variable: "--font-features",
  className: "",
}

export const metadata: Metadata = {
  title: "Temp Mail",
  description: "Temporary email service - Create disposable email addresses and receive emails without registration",
  openGraph: {
    title: "Temp Mail - Temporary Email Service",
    description: "Create disposable email addresses and receive emails without registration. Your temporary email service for privacy.",
    url: "https://temp.abhi.at",
    siteName: "Temp Mail",
    images: [
      {
        url: "/Temp-mail-opengraph.png",
        width: 1200,
        height: 630,
        alt: "Temp Mail - Temporary Email Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Temp Mail - Temporary Email Service",
    description: "Create disposable email addresses and receive emails without registration.",
    images: ["/Temp-mail-opengraph.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${headlineFont.variable} ${featuresFont.variable} ${inter.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
} 