import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Mail } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D0E0E] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <Mail className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Page Not Found
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Mail className="w-4 h-4 mr-2" />
              Create Temp Email
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
