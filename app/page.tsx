"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Make sure auth is initialized before checking
    if (!auth) {
      console.error("Firebase Auth is not initialized")
      setInitializing(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard")
      } else {
        setInitializing(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth) {
      toast({
        title: "Error",
        description: "Authentication is not available",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error.message || "Failed to login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">DRACS CMS</h1>
          <p>Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">DRACS CMS</CardTitle>
          <CardDescription>Sign in to manage your content</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
