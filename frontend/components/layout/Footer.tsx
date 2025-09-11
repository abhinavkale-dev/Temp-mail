"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Footer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? theme === 'dark' : false
  return (
    <footer
      className="border-t border-dashed dark:border-gray-700 px-4 py-4 bg-white dark:bg-[#0D0E0E] text-black dark:text-white text-center"
    >
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Made by <a
          href="https://x.com/Abhinavstwt"
          target="_blank"
          rel="noopener noreferrer"
          className="px-1 py-0.5 rounded text-black bg-white dark:text-white dark:bg-black hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500 dark:hover:text-white transition-colors"
        >
          @Abhinavstwt
        </a>
      </p>
    </footer>
  )
}
