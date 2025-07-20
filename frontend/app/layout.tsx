import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temp Mail",
  description: "Temporary email service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 