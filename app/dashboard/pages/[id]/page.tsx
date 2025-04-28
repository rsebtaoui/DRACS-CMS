"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

interface PageData {
  id: string
  sections: Record<string, any>
}

export default function EditPagePage({ params }: { params: any }) {
  const resolvedParams = use(params) as { id: string };
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageId, setPageId] = useState("")

  useEffect(() => {
    const fetchPage = async () => {
      try {
        if (!db) throw new Error("Firebase is not initialized")
        const pageDoc = await getDoc(doc(db, "pages", resolvedParams.id))

        if (!pageDoc.exists()) {
          toast({
            title: "Error",
            description: "Page not found",
            variant: "destructive",
          })
          router.push("/dashboard/pages")
          return
        }

        setPageId(pageDoc.id)
      } catch (error) {
        console.error("Error fetching page:", error)
        toast({
          title: "Error",
          description: "Failed to load page",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [resolvedParams.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!db) throw new Error("Firebase is not initialized")
      
      // Get the old page document
      const oldPageDoc = await getDoc(doc(db, "pages", resolvedParams.id))
      if (!oldPageDoc.exists()) {
        throw new Error("Page not found")
      }

      // Create new page with updated ID but keep the same sections
      const oldData = oldPageDoc.data()
      await updateDoc(doc(db, "pages", resolvedParams.id), {
        id: pageId
      })

      toast({
        title: "Success",
        description: "Page updated successfully",
      })
      router.push("/dashboard/pages")
    } catch (error) {
      console.error("Error updating page:", error)
      toast({
        title: "Error",
        description: "Failed to update page",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Page</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageId">Page ID</Label>
                <Input
                  id="pageId"
                  name="pageId"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/pages")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
