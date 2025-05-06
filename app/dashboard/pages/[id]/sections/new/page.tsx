"use client"

import type React from "react"
import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db, trackActivity } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import type { Section, ClickableWord, ColoredLine } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { X, Plus } from "lucide-react"

export default function NewSectionPage({ params }: { params: any }) {
  const resolvedParams = use(params) as { id: string };
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [section, setSection] = useState<Section>({
    title: "",
    introduction: "",
    dashes: [""],
    clickable_words: [],
    colored_lines: [],
    conclusion: "",
    order: 1,
  })

  const [newClickableWord, setNewClickableWord] = useState<ClickableWord>({
    text: "",
    color: "#000000",
    action_type: "",
    action_value: "",
  })

  const [newColoredLine, setNewColoredLine] = useState<ColoredLine>({
    text: "",
    color: "#000000",
  })

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
    setLoading(true)

    try {
      if (!db) throw new Error("Firebase is not initialized")
      
      const pageRef = doc(db, "pages", resolvedParams.id)
      const pageSnap = await getDoc(pageRef)

      if (!pageSnap.exists()) {
        throw new Error("Page not found")
      }

      const existingSections = pageSnap.data()?.sections || {}
      
      const newSection = {
        introduction: section.introduction,
        dashes: section.dashes,
        clickable_words: section.clickable_words.map(word => ({
          text: word.text,
          color: word.color,
          action_type: word.action_type,
          action_value: word.action_value
        })),
        colored_lines: section.colored_lines.map(line => ({
          text: line.text,
          color: line.color
        })),
        conclusion: section.conclusion,
        order: parseInt(section.order.toString(), 10)
      }

      await updateDoc(pageRef, {
        sections: {
          ...existingSections,
          [section.title]: newSection
        }
      })

      // Track the activity
      await trackActivity({
        type: 'section_created',
        pageId: resolvedParams.id,
        pageTitle: resolvedParams.id,
        sectionTitle: section.title,
      })

      toast({
        title: "Section created",
        description: "The section has been created successfully",
      })

      // Navigate back to the page's sections list
      router.push(`/dashboard/pages/${resolvedParams.id}/sections`)
    } catch (error) {
      console.error("Error creating section:", error)
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Section</h1>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wordText">Text</Label>
                  <Input
                    id="wordText"
                    name="text"
                    value={newClickableWord.text}
                    onChange={handleClickableWordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wordColor">Color</Label>
                  <Input
                    id="wordColor"
                    name="color"
                    type="color"
                    value={newClickableWord.color}
                    onChange={handleClickableWordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actionType">Action Type</Label>
                  <Input
                    id="actionType"
                    name="action_type"
                    value={newClickableWord.action_type}
                    onChange={handleClickableWordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actionValue">Action Value</Label>
                  <Input
                    id="actionValue"
                    name="action_value"
                    value={newClickableWord.action_value}
                    onChange={handleClickableWordChange}
                  />
                </div>
              </div>
              <Button type="button" variant="outline" onClick={addClickableWord}>
                <Plus className="mr-2 h-4 w-4" />
                Add Clickable Word
              </Button>

              <div className="space-y-2">
                {section.clickable_words.map((word, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <span style={{ color: word.color }}>{word.text}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({word.action_type}: {word.action_value})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeClickableWord(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colored Lines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lineText">Text</Label>
                  <Input
                    id="lineText"
                    name="text"
                    value={newColoredLine.text}
                    onChange={handleColoredLineChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lineColor">Color</Label>
                  <Input
                    id="lineColor"
                    name="color"
                    type="color"
                    value={newColoredLine.color}
                    onChange={handleColoredLineChange}
                  />
                </div>
              </div>
              <Button type="button" variant="outline" onClick={addColoredLine}>
                <Plus className="mr-2 h-4 w-4" />
                Add Colored Line
              </Button>

              <div className="space-y-2">
                {section.colored_lines.map((line, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <span style={{ color: line.color }}>{line.text}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeColoredLine(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conclusion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="conclusion">Conclusion Text</Label>
                <Textarea
                  id="conclusion"
                  name="conclusion"
                  value={section.conclusion}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/pages/${resolvedParams.id}/sections`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Section"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </>
  )
}
