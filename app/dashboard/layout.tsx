"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { Skeleton } from "@/components/ui/skeleton"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Set a timeout to show loading state for at least 500ms to prevent flickering
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 500)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/")
      }
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen">
        {/* Sidebar Skeleton */}
        <div className="hidden md:flex flex-col w-64 bg-card border-r">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex flex-col flex-1 p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-6 md:px-8">
            <Skeleton className="h-6 w-32" />
          </header>
          <main className="flex-1 p-6 md:p-8 bg-muted/40">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="mt-6">
              <Skeleton className="h-48 w-full" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
