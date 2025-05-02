"use client"

import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { LayoutDashboard, FileText, Users, BarChart3, Settings, Search, Menu, X, Newspaper, Rss } from "lucide-react"

import { cn } from "../lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function AppSidebar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  
  const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Prospect Profiles", icon: FileText, href: "/prospect-profiles" },
    { label: "Competitor Profiles", icon: Users, href: "/competitor-profiles" },
    { label: "Market Analysis", icon: BarChart3, href: "/market-analysis" },
    { label: "Alert", icon: Rss, href: "/search" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden ml-2 mt-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="h-full border-r bg-background fixed top-0 left-0 w-[80px] h-screen flex flex-col items-center p-4">
            <div className="flex h-14 items-center border-b px-4 w-full justify-center">
              <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <span className="font-bold">CDMOScout</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 w-full">
              <div className="flex flex-col items-center gap-4 p-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    to={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 text-sm font-medium transition-all hover:text-accent-foreground",
                      location.pathname === route.href ? "text-accent-foreground" : "text-muted-foreground"
                    )}
                  >
                    <route.icon className="h-6 w-6" />
                    <span className="text-xs text-center w-full">{route.label}</span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex fixed top-15 left-0 w-[80px] h-screen flex-col border-r items-center p-1 bg-background">
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 text-sm font-medium transition-all hover:text-accent-foreground",
                  location.pathname === route.href ? "text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <route.icon className="h-6 w-6" />
                <span className="text-xs text-center w-full">{route.label}</span>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
