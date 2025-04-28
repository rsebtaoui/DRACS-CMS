"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { X, Plus } from "lucide-react"

interface ClickableWord {
  text: string
  color: string
  action_type: string
  action_value: string
}

interface ColoredLine {
  text: string
  color: string
}

interface Section {
  id: string
  introduction: string
  dashes: string[]
  clickable_words: ClickableWord[]
  colored_lines: ColoredLine[]
  conclusion: string
  order: number
}

export default function EditSectionPage({ params }: { params: any }) {
  const resolvedParams = use(params) as { id: string; sectionId: string };
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [section, setSection] = useState<Section>({
    id: resolvedParams.sectionId,
    introduction: "",
    dashes: [""],
    clickable_words: [],
    colored_lines: [],
    conclusion: "",
    order: 0,
  })

  // For new clickable word
  const [newClickableWord, setNewClickableWord] = useState<ClickableWord>({
    text: "",
    color: "#000000",
    action_type: "",
    action_value: "",
  })

  // For new colored line
  const [newColoredLine, setNewColoredLine] = useState<ColoredLine>({
    text: "",
    color: "#000000",
  })

  useEffect(() => {
    console.log("Edit Section Page - resolvedParams:", resolvedParams);
    
    // Decode the URL-encoded section ID
    const decodedSectionId = decodeURIComponent(resolvedParams.sectionId);
    console.log("Decoded section ID:", decodedSectionId);
    
    const fetchSection = async () => {
      try {
        if (!db) throw new Error("Firebase is not initialized")
        console.log("Fetching page with ID:", resolvedParams.id)
        const pageDoc = await getDoc(doc(db, "pages", resolvedParams.id))

        if (!pageDoc.exists()) {
          toast({
            title: "Error",
            description: "Page not found",
            variant: "destructive",
          })
          router.push(`/dashboard/pages/${resolvedParams.id}/sections`)
          return
        }

        const sectionsData = pageDoc.data()?.sections || {}
        console.log("Available sections:", Object.keys(sectionsData))
        console.log("Looking for section ID:", decodedSectionId)
        const sectionData = sectionsData[decodedSectionId]
        console.log("Found section data:", sectionData)

        // If section data is not found, create a default empty section
        // This prevents immediate redirect and allows for debugging
        if (!sectionData) {
          console.error("Section not found in database, using default empty section")
          // Instead of redirecting, we'll use a default empty section
          // This will allow us to see what's happening
          setSection({
            id: resolvedParams.sectionId,
            introduction: "",
            dashes: [""],
            clickable_words: [],
            colored_lines: [],
            conclusion: "",
            order: 0,
          })
          setLoading(false)
          return
        }

        // Process clickable words to set default color when it's null
        const processedClickableWords = Array.isArray(sectionData.clickable_words) 
          ? sectionData.clickable_words.map((word: { text?: string; color?: string | null; action_type?: string; action_value?: string }) => ({
              text: word.text || "",
              color: word.color === null ? "#000000" : (word.color || "#000000"),
              action_type: word.action_type || "",
              action_value: word.action_value || ""
            }))
          : [];
          
        // Process colored lines to set default color when it's null
        const processedColoredLines = Array.isArray(sectionData.colored_lines) 
          ? sectionData.colored_lines.map((line: { text?: string; color?: string | null }) => ({
              text: line.text || "",
              color: line.color === null ? "#000000" : (line.color || "#000000")
            }))
          : [];
          
        // Create a safe section object with defaults for all possible null/undefined fields
        setSection({
          id: decodedSectionId, // Use the decoded section ID
          introduction: sectionData.introduction || "",
          dashes: Array.isArray(sectionData.dashes) ? sectionData.dashes : [""],
          clickable_words: processedClickableWords,
          colored_lines: processedColoredLines,
          conclusion: sectionData.conclusion || "",
          order: typeof sectionData.order === 'number' ? sectionData.order : 0,
        })
      } catch (error) {
        console.error("Error fetching section:", error)
        toast({
          title: "Error",
          description: "Failed to load section",
          variant: "destructive",
        })
        router.push(`/dashboard/pages/${resolvedParams.id}/sections`)
      } finally {
        setLoading(false)
      }
    }

    fetchSection()
  }, [resolvedParams.id, resolvedParams.sectionId, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSection((prev) => ({ ...prev, [name]: value }))
  }

  const handleDashChange = (index: number, value: string) => {
    setSection((prev) => {
      const newDashes = [...prev.dashes]
      newDashes[index] = value
      return { ...prev, dashes: newDashes }
    })
  }

  const handleAddDash = () => {
    setSection((prev) => ({
      ...prev,
      dashes: [...prev.dashes, ""],
    }))
  }

  const handleRemoveDash = (index: number) => {
    setSection((prev) => ({
      ...prev,
      dashes: prev.dashes.filter((_, i) => i !== index),
    }))
  }

  const handleClickableWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewClickableWord((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddClickableWord = () => {
    if (newClickableWord.text.trim() === "") return

    // Create a copy of the new clickable word
    const wordToAdd = { ...newClickableWord }
    
    // If color is the default black (#000000), set it to null
    if (wordToAdd.color === "#000000") {
      wordToAdd.color = null as any; // Using 'as any' to bypass TypeScript's type checking
    }

    setSection((prev) => ({
      ...prev,
      clickable_words: [...prev.clickable_words, wordToAdd],
    }))
    setNewClickableWord({
      text: "",
      color: "#000000",
      action_type: "",
      action_value: "",
    })
  }

  const handleRemoveClickableWord = (index: number) => {
    setSection((prev) => ({
      ...prev,
      clickable_words: prev.clickable_words.filter((_, i) => i !== index),
    }))
  }

  const handleColoredLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewColoredLine((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddColoredLine = () => {
    if (newColoredLine.text.trim() === "") return

    // Create a copy of the new colored line
    const lineToAdd = { ...newColoredLine }
    
    // If color is the default black (#000000), set it to null
    if (lineToAdd.color === "#000000") {
      lineToAdd.color = null as any; // Using 'as any' to bypass TypeScript's type checking
    }

    setSection((prev) => ({
      ...prev,
      colored_lines: [...prev.colored_lines, lineToAdd],
    }))
    setNewColoredLine({
      text: "",
      color: "#000000",
    })
  }

  const handleRemoveColoredLine = (index: number) => {
    setSection((prev) => ({
      ...prev,
      colored_lines: prev.colored_lines.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Decode the URL-encoded section ID
      const decodedSectionId = decodeURIComponent(resolvedParams.sectionId);
      if (!db) throw new Error("Firebase is not initialized")
      const pageRef = doc(db, "pages", resolvedParams.id)
      const pageDoc = await getDoc(pageRef)
      
      if (!pageDoc.exists()) {
        throw new Error("Page not found")
      }

      const sectionsData = pageDoc.data()?.sections || {}
      
      // Check if the section ID has changed
      const newSectionId = section.id.trim();
      const oldSectionId = decodedSectionId;
      
      // Validate that the new section ID is not empty
      if (!newSectionId) {
        throw new Error("Section title cannot be empty")
      }
      
      // Check if a section with this ID already exists (only if ID has changed)
      if (newSectionId !== oldSectionId && sectionsData[newSectionId]) {
        throw new Error("A section with this title already exists")
      }
      
      // Create the section data object with processed clickable words and colored lines
      const sectionData = {
        introduction: section.introduction,
        dashes: section.dashes.filter(dash => dash.trim() !== ""),
        // Process clickable words to set color to null when it's the default black
        clickable_words: section.clickable_words.map((word: { text: string; color: string | null; action_type: string; action_value: string }) => ({
          text: word.text,
          color: word.color === "#000000" ? null : word.color,
          action_type: word.action_type,
          action_value: word.action_value
        })),
        // Process colored lines to set color to null when it's the default black
        colored_lines: section.colored_lines.map((line: { text: string; color: string | null }) => ({
          text: line.text,
          color: line.color === "#000000" ? null : line.color
        })),
        conclusion: section.conclusion,
        order: parseInt(section.order.toString(), 10),
      };
      
      // If the section ID has changed, create a new entry and delete the old one
      if (newSectionId !== oldSectionId) {
        sectionsData[newSectionId] = sectionData;
        delete sectionsData[oldSectionId];
      } else {
        // Otherwise, just update the existing section
        sectionsData[oldSectionId] = sectionData;
      }

      await updateDoc(pageRef, {
        sections: sectionsData
      })

      toast({
        title: "Success",
        description: "Section updated successfully",
      })
      router.push(`/dashboard/pages/${resolvedParams.id}/sections`)
    } catch (error) {
      console.error("Error updating section:", error)
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Section</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Section ID)</Label>
                <Input
                  id="title"
                  name="title"
                  value={section.id}
                  onChange={(e) => setSection({...section, id: e.target.value})}
                  required
                />
                <p className="text-sm text-muted-foreground">The title is used as the section identifier in the database</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={section.order}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  name="introduction"
                  value={section.introduction}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.dashes.map((dash, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={dash}
                    onChange={(e) => handleDashChange(index, e.target.value)}
                    placeholder={`Dash ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveDash(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddDash}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Dash
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clickable Words</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.clickable_words.map((word, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <Input value={word.text || ""} disabled />
                    <Input value={word.color || "#000000"} type="color" disabled />
                    <Input value={word.action_type || ""} disabled />
                    <Input value={word.action_value || ""} disabled />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveClickableWord(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <Input
                    name="text"
                    value={newClickableWord.text}
                    onChange={handleClickableWordChange}
                    placeholder="Text"
                  />
                  <Input
                    name="color"
                    type="color"
                    value={newClickableWord.color}
                    onChange={handleClickableWordChange}
                  />
                  <Input
                    name="action_type"
                    value={newClickableWord.action_type}
                    onChange={handleClickableWordChange}
                    placeholder="Action Type"
                  />
                  <Input
                    name="action_value"
                    value={newClickableWord.action_value}
                    onChange={handleClickableWordChange}
                    placeholder="Action Value"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddClickableWord}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colored Lines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.colored_lines.map((line, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input value={line.text || ""} disabled />
                    <Input value={line.color || "#000000"} type="color" disabled />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveColoredLine(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    name="text"
                    value={newColoredLine.text}
                    onChange={handleColoredLineChange}
                    placeholder="Text"
                  />
                  <Input
                    name="color"
                    type="color"
                    value={newColoredLine.color}
                    onChange={handleColoredLineChange}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddColoredLine}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conclusion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="conclusion">Conclusion</Label>
                <Textarea
                  id="conclusion"
                  name="conclusion"
                  value={section.conclusion}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/pages/${resolvedParams.id}/sections`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </>
  )
}
