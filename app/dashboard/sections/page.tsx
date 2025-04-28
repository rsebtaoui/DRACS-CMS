"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import type { Section } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SectionsPage() {
  const [sections, setSections] = useState<{id: string; data: Section}[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSections = async () => {
      try {
        if (!db) throw new Error("Firebase is not initialized")
        // Get the ps document
        const psDoc = await getDoc(doc(db, "pages", "ps"))
        if (!psDoc.exists()) {
          setSections([])
          return
        }

        const sectionsData = psDoc.data()?.sections || {}
        const sectionsList = Object.entries(sectionsData).map(([id, data]) => ({
          id,
          data: data as Section
        }))

        // Sort by order
        sectionsList.sort((a, b) => a.data.order - b.data.order)
        setSections(sectionsList)
      } catch (error) {
        console.error("Error fetching sections:", error)
        toast({
          title: "Error",
          description: "Failed to load sections",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      if (!db) throw new Error("Firebase is not initialized")
      const psRef = doc(db, "pages", "ps")
      const psDoc = await getDoc(psRef)
      
      if (!psDoc.exists()) {
        throw new Error("Page document not found")
      }

      const sectionsData = psDoc.data()?.sections || {}
      const { [id]: deletedSection, ...remainingSections } = sectionsData

      await updateDoc(psRef, {
        sections: remainingSections
      })

      setSections(sections.filter((section) => section.id !== id))
      toast({
        title: "Section deleted",
        description: "The section has been deleted successfully",
      })
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
        <h1 className="text-2xl font-bold">Sections</h1>
        <Link href="/dashboard/sections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading sections...</div>
          ) : sections.length === 0 ? (
            <div className="text-center py-4">No sections found. Create your first section!</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Clickable Words</TableHead>
                  <TableHead>Colored Lines</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>{section.data.order}</TableCell>
                    <TableCell className="font-medium">{section.id}</TableCell>
                    <TableCell>{Object.keys(section.data.clickable_words || {}).length}</TableCell>
                    <TableCell>{Object.keys(section.data.colored_lines || {}).length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/sections/${section.id}`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the section and all its
                                content.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => section.id && handleDelete(section.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
