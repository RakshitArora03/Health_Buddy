"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface AddNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onNoteAdded: () => void
}

export default function AddNoteModal({ isOpen, onClose, onNoteAdded }: AddNoteModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your note",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your note",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/patient/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add note")
      }

      toast({
        title: "Success",
        description: "Note added successfully",
      })

      setTitle("")
      setContent("")
      onNoteAdded()
      onClose()
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter note content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1A75BC] hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

