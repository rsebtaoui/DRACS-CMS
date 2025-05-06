"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, LogOut, Bell, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  sent: boolean;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Content Available",
      message: "New RNA section has been added to the app",
      timestamp: new Date(),
      read: false,
      sent: true,
    },
    {
      id: "2",
      title: "Content Update",
      message: "Introduction section has been updated",
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      sent: false,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length
  const unsentCount = notifications.filter(n => !n.sent).length

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

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  const sendNotification = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, sent: true } : notification
    ))
    toast({
      title: "Notification sent",
      description: "The notification has been pushed to the app",
    })
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Handle theme mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">DRACS CMS</h1>
        </div>
        <div className="flex flex-col flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                App Notifications (Future)
                {unsentCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unsentCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">App Notifications (Coming Soon)</h4>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="h-8 px-2"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground text-center py-4">
                  Push notifications feature will be available in a future update.
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="p-4 border-t space-y-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </>
            )}
          </Button>
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
            {pathname === "/dashboard/pages" && "Pages"}
            {pathname.includes("/dashboard/pages/") && "Page Details"}
          </h1>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-muted/40">{children}</main>
      </div>
    </div>
  )
}
