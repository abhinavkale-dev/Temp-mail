import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Temp Mail - Temporary Email Service",
    short_name: "Temp Mail",
    description:
      "Create disposable email addresses and receive emails without registration.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0E0E",
    theme_color: "#0D0E0E",
    icons: [
      {
        src: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  }
}
