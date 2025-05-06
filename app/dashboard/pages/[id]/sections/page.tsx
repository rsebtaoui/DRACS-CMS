"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db, trackActivity } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash, Plus } from "lucide-react"

interface Section {
  id: string
  order: number
}

export default function PageSectionsPage({ params }: { params: any }) {
  const resolvedParams = use(params) as { id: string };
  const router = useRouter()
  const { toast } = useToast()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
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

      const sectionsData = pageDoc.data()?.sections || {}
      // Map the sections data to an array format for display
      const sectionsArray = Object.entries(sectionsData).map(([id, data]: [string, any]) => ({
        id, // The section ID is the key in the object
        order: data.order || 0
      }))
      console.log("sectionsData : ",sectionsData);

      // Sort sections by order
      sectionsArray.sort((a, b) => a.order - b.order)
      setSections(sectionsArray)
    } catch (error) {
      console.error("Error fetching sections:", error)
      toast({
        title: "Error",
        description: "Failed to fetch sections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      if (!db) throw new Error("Firebase is not initialized")
      const pageRef = doc(db, "pages", resolvedParams.id)
      const pageDoc = await getDoc(pageRef)
      
      if (!pageDoc.exists()) {
        throw new Error("Page not found")
      }

      const sectionsData = pageDoc.data()?.sections || {}
      delete sectionsData[sectionId]

      await updateDoc(pageRef, {
        sections: sectionsData
      })

      // Track the activity
      await trackActivity({
        type: 'section_deleted',
        pageId: resolvedParams.id,
        pageTitle: resolvedParams.id,
        sectionTitle: sectionId,
      })

      toast({
        title: "Section deleted",
        description: "The section has been deleted successfully",
      })
      fetchSections()
    } catch (error) {
      console.error("Error deleting section:", error)
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sections - {resolvedParams.id}</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push("/dashboard/pages")}>
            Back to Pages
          </Button>
          <Button onClick={() => router.push(`/dashboard/pages/${resolvedParams.id}/sections/new`)}>
            Add New Section
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell>{section.id}</TableCell>
                <TableCell>{section.order}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      // Use encodeURIComponent to properly handle special characters in the section ID
                      const encodedSectionId = encodeURIComponent(section.id);
                      router.push(`/dashboard/pages/${resolvedParams.id}/sections/${encodedSectionId}`);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(section.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sections.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No sections found. Create your first section!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
