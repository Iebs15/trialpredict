import { Link } from "react-router-dom"
import { Search, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "./user-nav"

import { Badge } from "@/components/ui/badge"


import insimine from "@/assets/Insimine.svg"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  const notifications = [
    { id: 1, message: "Database is still under update." },
    { id: 2, message: "Upcoming maintenance: System will be down for 2 hours on Saturday" }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center">
            <a href="/dashboard">
              <img src={insimine || "/placeholder.svg"} alt="Insimine" className="h-6 w-6" />
            </a>
            <h1 className="px-2 text-black">|</h1>
            <a href="/dashboard" className="font-bold text-black hover:text-black">
              Sale<span className="text-[#a6ce39]">Scout</span>
            </a>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Global search..." className="w-[200px] lg:w-[300px] pl-8 h-9" /> */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-black border border-black bg-transparent hover:text-white hover:bg-[#4a632c]">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 text-white">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id}>{notification.message}</DropdownMenuItem>
              ))}
              {notifications.length === 0 && <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
          <UserNav />
        </div>
      </div>
    </header>
  )
}

