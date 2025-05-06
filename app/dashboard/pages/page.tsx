"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
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
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash } from "lucide-react"

interface Page {
  id: string
  sectionCount: number
}

export default function PagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      if (!db) throw new Error("Firebase is not initialized")
      const pagesCollection = collection(db, "pages")
      const pagesSnapshot = await getDocs(pagesCollection)
      
      const pagesData = await Promise.all(
        pagesSnapshot.docs.map(async (doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            sectionCount: Object.keys(data.sections || {}).length
          }
        })
      )
      
      setPages(pagesData)
    } catch (error) {
      console.error("Error fetching pages:", error)
      toast({
        title: "Error",
        description: "Failed to fetch pages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return

    try {
      if (!db) throw new Error("Firebase is not initialized")
      await deleteDoc(doc(db, "pages", pageId))

      // Track the activity
      await trackActivity({
        type: 'page_deleted',
        pageId,
        pageTitle: pageId,
      })

      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully",
      })
      fetchPages()
    } catch (error) {
      console.error("Error deleting page:", error)
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Button onClick={() => router.push("/dashboard/pages/new")}>
          Create New Page
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page ID</TableHead>
              <TableHead>Number of Sections</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>{page.id}</TableCell>
                <TableCell>{page.sectionCount}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/pages/${page.id}/sections`)}
                  >
                    View Sections
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pages.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No pages found. Create your first page!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
