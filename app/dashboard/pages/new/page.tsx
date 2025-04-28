"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/lib/firebase"
import type { Firestore } from "firebase/firestore"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

interface PageData {
  id: string
  sections: Record<string, any>
}

export default function NewPagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pageId, setPageId] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create a new page document with an empty sections map
      const pageRef = doc(db, "pages", pageId)
      await setDoc(pageRef, {
        sections: {}
      })

      toast({
        title: "Page created",
        description: "The page has been created successfully",
      })

      // Navigate to the new section form with the page ID
      router.push(`/dashboard/sections/new?pageId=${pageId}`)
    } catch (error) {
      console.error("Error creating page:", error)
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Page</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pageId">Page ID</Label>
                  <Input
                    id="pageId"
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    placeholder="e.g., about, contact, ps"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/pages")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Page & Add Section"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </>
  )
}
