"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import type { Section } from "@/lib/types"
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

interface SectionWithId extends Section {
  id: string
}

export default function EditSectionPage({ params }: { params: any }) {
  const resolvedParams = use(params) as { id: string };
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [section, setSection] = useState<SectionWithId>({
    id: "",
    title: "",
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
    const fetchSection = async () => {
      try {
        if (!db) throw new Error("Firebase is not initialized")
        const psDoc = await getDoc(doc(db, "pages", "ps"))

        if (!psDoc.exists()) {
          toast({
            title: "Error",
            description: "Page not found",
            variant: "destructive",
          })
          router.push("/dashboard/sections")
          return
        }

        const sectionsData = psDoc.data()?.sections || {}
        const sectionData = sectionsData[resolvedParams.id] as Section

        if (!sectionData) {
          toast({
            title: "Error",
            description: "Section not found",
            variant: "destructive",
          })
          router.push("/dashboard/sections")
          return
        }

        setSection({
          id: resolvedParams.id,
          ...sectionData,
          // Ensure arrays exist
          dashes: sectionData.dashes || [""],
          clickable_words: sectionData.clickable_words || [],
          colored_lines: sectionData.colored_lines || [],
        })
      } catch (error) {
        console.error("Error fetching section:", error)
        toast({
          title: "Error",
          description: "Failed to load section",
          variant: "destructive",
        })
        router.push("/dashboard/sections")
      } finally {
        setLoading(false)
      }
    }

    fetchSection()
  }, [resolvedParams.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSection((prev) => ({ ...prev, [name]: value }))
  }

  const handleDashChange = (index: number, value: string) => {
    const newDashes = [...section.dashes]
    newDashes[index] = value
    setSection((prev) => ({ ...prev, dashes: newDashes }))
  }

  const addDash = () => {
    setSection((prev) => ({ ...prev, dashes: [...prev.dashes, ""] }))
  }

  const removeDash = (index: number) => {
    const newDashes = [...section.dashes]
    newDashes.splice(index, 1)
    setSection((prev) => ({ ...prev, dashes: newDashes }))
  }

  const handleClickableWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewClickableWord((prev) => ({ ...prev, [name]: value }))
  }

  const addClickableWord = () => {
    if (newClickableWord.text && newClickableWord.color) {
      setSection((prev) => ({
        ...prev,
        clickable_words: [...prev.clickable_words, { ...newClickableWord }],
      }))
      setNewClickableWord({
        text: "",
        color: "#000000",
        action_type: "",
        action_value: "",
      })
    }
  }

  const removeClickableWord = (index: number) => {
    const newClickableWords = [...section.clickable_words]
    newClickableWords.splice(index, 1)
    setSection((prev) => ({ ...prev, clickable_words: newClickableWords }))
  }

  const handleColoredLineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewColoredLine((prev) => ({ ...prev, [name]: value }))
  }

  const addColoredLine = () => {
    if (newColoredLine.text && newColoredLine.color) {
      setSection((prev) => ({
        ...prev,
        colored_lines: [...prev.colored_lines, { ...newColoredLine }],
      }))
      setNewColoredLine({
        text: "",
        color: "#000000",
      })
    }
  }

  const removeColoredLine = (index: number) => {
    const newColoredLines = [...section.colored_lines]
    newColoredLines.splice(index, 1)
    setSection((prev) => ({ ...prev, colored_lines: newColoredLines }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!db) throw new Error("Firebase is not initialized")
      const psRef = doc(db, "pages", "ps")
      const psDoc = await getDoc(psRef)

      if (!psDoc.exists()) {
        throw new Error("Page not found")
      }

      const sectionsData = psDoc.data()?.sections || {}
      sectionsData[resolvedParams.id] = {
        title: section.title,
        introduction: section.introduction,
        dashes: section.dashes.filter(dash => dash.trim() !== ""),
        clickable_words: section.clickable_words,
        colored_lines: section.colored_lines,
        conclusion: section.conclusion,
        order: parseInt(section.order.toString(), 10),
      }

      await updateDoc(psRef, {
        sections: sectionsData
      })

      toast({
        title: "Section updated",
        description: "The section has been updated successfully",
      })

      router.push("/dashboard/sections")
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
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading section...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Section</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={section.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input id="order" name="order" type="number" value={section.order} onChange={handleChange} required />
                </div>
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
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={dash}
                    onChange={(e) => handleDashChange(index, e.target.value)}
                    placeholder={`Dash ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeDash(index)}
                    disabled={section.dashes.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addDash} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
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
                <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Text</Label>
                      <div className="font-medium">{word.text}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: word.color }}></div>
                        <span>{word.color}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Action Type</Label>
                      <div>{word.action_type}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Action Value</Label>
                      <div>{word.action_value}</div>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => removeClickableWord(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Add New Clickable Word</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clickable-text">Text</Label>
                    <Input
                      id="clickable-text"
                      name="text"
                      value={newClickableWord.text}
                      onChange={handleClickableWordChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clickable-color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="clickable-color"
                        name="color"
                        value={newClickableWord.color}
                        onChange={handleClickableWordChange}
                        className="w-12 p-1 h-10"
                      />
                      <Input
                        type="text"
                        value={newClickableWord.color}
                        onChange={handleClickableWordChange}
                        name="color"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="action-type">Action Type</Label>
                    <Input
                      id="action-type"
                      name="action_type"
                      value={newClickableWord.action_type}
                      onChange={handleClickableWordChange}
                      placeholder="e.g., url, popup"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="action-value">Action Value</Label>
                    <Input
                      id="action-value"
                      name="action_value"
                      value={newClickableWord.action_value}
                      onChange={handleClickableWordChange}
                      placeholder="e.g., https://example.com"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addClickableWord}
                  disabled={!newClickableWord.text || !newClickableWord.color}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Clickable Word
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
                <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Text</Label>
                      <div className="font-medium">{line.text}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: line.color }}></div>
                        <span>{line.color}</span>
                      </div>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => removeColoredLine(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Add New Colored Line</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="colored-text">Text</Label>
                    <Textarea
                      id="colored-text"
                      name="text"
                      value={newColoredLine.text}
                      onChange={handleColoredLineChange}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colored-color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="colored-color"
                        name="color"
                        value={newColoredLine.color}
                        onChange={handleColoredLineChange}
                        className="w-12 p-1 h-10"
                      />
                      <Input
                        type="text"
                        value={newColoredLine.color}
                        onChange={handleColoredLineChange}
                        name="color"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <Button type="button" onClick={addColoredLine} disabled={!newColoredLine.text || !newColoredLine.color}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Colored Line
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
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/sections")}>
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
