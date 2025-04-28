"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

export default function NewSectionPage({ params }: { params: any }) {
  const resolvedParams = use(params) as { id: string };
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!db) throw new Error("Firebase is not initialized")
      const pageRef = doc(db, "pages", resolvedParams.id)
      const pageDoc = await getDoc(pageRef)
      
      if (!pageDoc.exists()) {
        throw new Error("Page not found")
      }

      // Get the form element safely
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      const title = formData.get("title") as string
      const introduction = formData.get("introduction") as string
      const order = parseInt(formData.get("order") as string, 10)

      // Use the title as the section ID
      if (!title || title.trim() === "") {
        throw new Error("Title is required")
      }

      const sectionsData = pageDoc.data()?.sections || {}
      const sectionId = title.trim()

      // Check if a section with this ID already exists
      if (sectionsData[sectionId]) {
        throw new Error("A section with this title already exists")
      }

      sectionsData[sectionId] = {
        // No need to store title separately as it's now the section ID
        introduction,
        dashes: [""],
        clickable_words: [],
        colored_lines: [],
        conclusion: "",
        order,
      }

      await updateDoc(pageRef, {
        sections: sectionsData
      })

      toast({
        title: "Success",
        description: "Section created successfully",
      })
      router.push(`/dashboard/pages/${resolvedParams.id}/sections`)
    } catch (error) {
      console.error("Error creating section:", error)
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Section</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Will be used as Section ID)</Label>
              <Input
                id="title"
                name="title"
                required
              />
              <p className="text-sm text-muted-foreground">The title will be used as the section identifier and cannot be changed later</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                name="introduction"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/pages/${resolvedParams.id}/sections`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Section"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}
