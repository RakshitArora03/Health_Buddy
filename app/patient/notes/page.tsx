"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Pin, Trash, MoreVertical } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import AddNoteModal from "@/components/patient/AddNoteModal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Note {
  _id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  const fetchNotes = async () => {
    if (!session?.user?.email) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/patient/notes")
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
        setFilteredNotes(data)
      } else {
        console.error("Failed to fetch notes")
        toast({
          title: "Error",
          description: "Failed to load notes. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast({
        title: "Error",
        description: "An error occurred while loading notes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      fetchNotes()
    }
  }, [session])

  useEffect(() => {
    if (searchQuery) {
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredNotes(filtered)
    } else {
      setFilteredNotes(notes)
    }
  }, [searchQuery, notes])

  const handlePinNote = async (noteId: string) => {
    const note = notes.find((n) => n._id === noteId)
    if (!note) return

    try {
      const response = await fetch(`/api/patient/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPinned: !note.isPinned,
        }),
      })

      if (response.ok) {
        fetchNotes()
        toast({
          title: "Success",
          description: note.isPinned ? "Note unpinned" : "Note pinned",
        })
      } else {
        throw new Error("Failed to update note")
      }
    } catch (error) {
      console.error("Error updating note:", error)
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async () => {
    if (!noteToDelete) return

    try {
      const response = await fetch(`/api/patient/notes/${noteToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchNotes()
        toast({
          title: "Success",
          description: "Note deleted successfully",
        })
      } else {
        throw new Error("Failed to delete note")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setNoteToDelete(null)
    }
  }

  const confirmDelete = (noteId: string) => {
    setNoteToDelete(noteId)
    setIsDeleteDialogOpen(true)
  }

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned)
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned)

  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="bg-[#1A75BC] hover:bg-blue-700" onClick={() => setIsAddNoteModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery ? "No notes match your search" : "You don't have any notes yet"}
          </p>
          {!searchQuery && (
            <Button className="bg-[#1A75BC] hover:bg-blue-700" onClick={() => setIsAddNoteModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Note
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <Pin className="h-4 w-4 mr-2" />
                Pinned Notes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pinnedNotes.map((note) => (
                  <Card key={note._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                      <CardTitle className="text-lg font-medium truncate flex-1" onClick={() => setSelectedNote(note)}>
                        {note.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePinNote(note._id)}>
                            <Pin className="h-4 w-4 mr-2" />
                            Unpin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDelete(note._id)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-gray-500 line-clamp-3" onClick={() => setSelectedNote(note)}>
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{format(new Date(note.createdAt), "MMM d, yyyy")}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Notes */}
          <div>
            {pinnedNotes.length > 0 && <h2 className="text-lg font-medium mb-3">Other Notes</h2>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unpinnedNotes.map((note) => (
                <Card key={note._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                    <CardTitle className="text-lg font-medium truncate flex-1" onClick={() => setSelectedNote(note)}>
                      {note.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePinNote(note._id)}>
                          <Pin className="h-4 w-4 mr-2" />
                          Pin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(note._id)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-gray-500 line-clamp-3" onClick={() => setSelectedNote(note)}>
                      {note.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{format(new Date(note.createdAt), "MMM d, yyyy")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      <AddNoteModal isOpen={isAddNoteModalOpen} onClose={() => setIsAddNoteModalOpen(false)} onNoteAdded={fetchNotes} />

      {/* View Note Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="whitespace-pre-wrap">{selectedNote?.content}</p>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Created: {selectedNote && format(new Date(selectedNote.createdAt), "PPpp")}
            {selectedNote && selectedNote.updatedAt !== selectedNote.createdAt && (
              <div>Updated: {format(new Date(selectedNote.updatedAt), "PPpp")}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

