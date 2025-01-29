"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
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
// import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Pin, Trash } from "lucide-react"

interface Analysis {
  _id: string
  title: string
  image: string
  analysis: string
  createdAt: string
  isPinned: boolean
}

export function AnalyzedPrescriptions() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuAnalysis, setContextMenuAnalysis] = useState<Analysis | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const fetchAnalyses = useCallback(async () => {
    if (!session?.user?.email) return

    try {
      const response = await fetch(`/api/get-analyses?userId=${encodeURIComponent(session.user.email)}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data)
      } else {
        console.error("Failed to fetch analyses")
      }
    } catch (error) {
      console.error("Error fetching analyses:", error)
    }
  }, [session])

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchAnalyses()
  }, [session, router, fetchAnalyses])

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!session) {
    return null
  }

  const handleContextMenu = (e: React.MouseEvent, analysis: Analysis) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
    setContextMenuAnalysis(analysis)
  }

  const handleLongPress = (analysis: Analysis) => {
    setContextMenuAnalysis(analysis)
    setShowContextMenu(true)
  }

  const handlePin = async () => {
    if (contextMenuAnalysis) {
      try {
        const response = await fetch("/api/update-pin-status", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: contextMenuAnalysis._id,
            isPinned: !contextMenuAnalysis.isPinned,
          }),
        })

        if (response.ok) {
          await fetchAnalyses()
        } else {
          console.error("Failed to update pin status")
        }
      } catch (error) {
        console.error("Error updating pin status:", error)
      }
    }
    setShowContextMenu(false)
  }

  const handleDelete = () => {
    setShowDeleteConfirmation(true)
    setShowContextMenu(false)
  }

  const confirmDelete = async () => {
    if (contextMenuAnalysis) {
      try {
        const response = await fetch(`/api/delete-analysis?id=${contextMenuAnalysis._id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          await fetchAnalyses()
        } else {
          console.error("Failed to delete analysis")
        }
      } catch (error) {
        console.error("Error deleting analysis:", error)
      }
    }
    setShowDeleteConfirmation(false)
  }

  const formatAnalysis = (analysis: string) => {
    const lines = analysis.split("\n")
    const formattedContent = []
    let currentSection = { title: "", content: [] as string[] }
    let inList = false

    for (const line of lines) {
      if (line.startsWith("**") && line.endsWith("**")) {
        if (currentSection.title) {
          formattedContent.push(currentSection)
          currentSection = { title: "", content: [] as string[] }
        }
        currentSection.title = line.replace(/\*\*/g, "")
      } else if (line.trim().startsWith("*")) {
        inList = true
        currentSection.content.push(line)
      } else if (line.trim() !== "") {
        if (inList && !line.trim().startsWith("*")) {
          inList = false
          currentSection.content.push("<br>")
        }
        currentSection.content.push(line)
      } else if (line.trim() === "" && inList) {
        inList = false
        currentSection.content.push("<br>")
      }
    }

    

    if (currentSection.title) {
      formattedContent.push(currentSection)
    }

    return formattedContent.map((section, index) => (
        <div key={index} className="mb-4">
          <h4 className="font-semibold text-lg mb-2">{section.title}</h4>
          <div className="pl-4">
            {section.content.map((line, lineIndex) => {
              if (line.trim().startsWith("*")) {
                // List item
                return (
                  <li key={lineIndex} className="mb-1">
                    {line.replace("*", "").trim()}
                  </li>
                );
              } else if (line.trim() === "<br>") {
                // Line break
                return <br key={lineIndex} />;
              } else {
                // Regular paragraph
                return (
                  <p key={lineIndex} className="mb-1">
                    {line}
                  </p>
                );
              }
            })}
          </div>
        </div>
      ))
  }

  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Analysis History</h1> */}
      {analyses.length === 0 ? (
        <p>No analyses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {analyses.map((analysis) => (
            <Card
              key={analysis._id}
              className={`cursor-pointer hover:shadow-lg transition-shadow duration-300 ${analysis.isPinned ? "border-primary" : ""}`}
              onClick={() => setSelectedAnalysis(analysis)}
              onContextMenu={(e) => handleContextMenu(e, analysis)}
              onTouchStart={() => {
                const timer = setTimeout(() => handleLongPress(analysis), 500)
                return () => clearTimeout(timer)
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg truncate flex items-center">
                  {analysis.isPinned && <Pin className="w-4 h-4 mr-2" />}
                  {analysis.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{new Date(analysis.createdAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <ScrollArea className="h-full max-h-[90vh]">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedAnalysis?.title}</DialogTitle>
                <DialogDescription>
                  Analyzed on {selectedAnalysis && new Date(selectedAnalysis.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden">
                  {selectedAnalysis?.image ? (
                    <Image
                      src={selectedAnalysis.image || "/placeholder.svg"}
                      alt="Prescription"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No image available</div>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg overflow-y-auto max-h-[500px]">
                  <h3 className="font-semibold text-xl mb-4">Analysis:</h3>
                  <div className="text-sm space-y-2 prose max-w-none">
                    {selectedAnalysis && formatAnalysis(selectedAnalysis.analysis)}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <DropdownMenu open={showContextMenu} onOpenChange={setShowContextMenu}>
        <DropdownMenuTrigger asChild>
          <div
            ref={contextMenuRef}
            style={{
              position: "fixed",
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              visibility: showContextMenu ? "visible" : "hidden",
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handlePin}>
            <Pin className="mr-2 h-4 w-4" />
            <span>{contextMenuAnalysis?.isPinned ? "Unpin" : "Pin"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this analysis?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the analysis from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

