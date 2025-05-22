import { Link } from "react-router-dom"
import { FlaskRoundIcon as Flask } from "lucide-react"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Flask className="h-6 w-6 text-teal-600" />
            <span>TrialPredict</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              About
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Documentation
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <div className="flex items-center gap-2 font-bold">
            <Flask className="h-5 w-5 text-teal-600" />
            <span>TrialPredict</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 TrialPredict. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6 md:ml-auto">
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Terms
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Privacy
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
