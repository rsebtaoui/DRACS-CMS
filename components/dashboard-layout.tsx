"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Sections",
    href: "/dashboard/sections",
    icon: FileText,
  },
  {
    name: "Pages",
    href: "/dashboard/pages",
    icon: FileText,
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      if (!auth) throw new Error("Auth is not initialized")
    await signOut(auth)
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was an error signing out of your account",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">DRACS CMS</h1>
        </div>
        <div className="flex flex-col flex-1 p-4 space-y-2">
          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/pages">
            <Button
              variant={pathname.includes("/dashboard/pages") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              Pages
            </Button>
          </Link>
        </div>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-6 md:px-8">
          <div className="md:hidden mr-4">{/* Mobile menu button would go here */}</div>
          <h1 className="text-lg font-semibold">
            {pathname === "/dashboard" && "Dashboard"}
            {pathname === "/dashboard/sections" && "Sections"}
            {pathname.includes("/dashboard/sections/") && "Section Details"}
            {pathname === "/dashboard/pages" && "Pages"}
            {pathname.includes("/dashboard/pages/") && "Page Details"}
          </h1>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-muted/40">{children}</main>
      </div>
    </div>
  )
}
