"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Doctor {
  id: string
  name: string
  specialization: string
  profileImage?: string
}

interface AddDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  onAddDoctor: (doctor: Doctor) => void
  doctors: Doctor[]
}

export function AddDoctorModal({ isOpen, onClose, onAddDoctor, doctors }: AddDoctorModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Doctor[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search-doctors?query=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error("Failed to fetch doctors")
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching doctors:", error)
      toast({
        title: "Error",
        description: "Failed to search doctors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddDoctor = async (doctor: Doctor) => {
    // Check if the doctor is already in the list
    const isAlreadyAdded = doctors.some((d) => d.id === doctor.id)
    if (isAlreadyAdded) {
      toast({
        title: "Error",
        description: `${doctor.name} is already in your doctor list.`,
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/patient/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctorId: doctor.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add doctor")
      }

      if (data.alreadyAdded) {
        toast({
          title: "Info",
          description: `${doctor.name} is already in your list.`,
        })
      } else {
        onAddDoctor(doctor)
        toast({
          title: "Doctor Added",
          description: `${doctor.name} has been added to your list!`,
        })
      }
      onClose()
    } catch (error) {
      console.error("Error adding doctor:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add doctor",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Doctor to Your List</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by doctor name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button className="bg-[#1A75BC] hover:bg-blue-700" onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={doctor.profileImage || undefined} />
                      <AvatarFallback>{doctor.name ? doctor.name.charAt(0) : "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{doctor.name || "Unknown"}</p>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>
                  <Button className="bg-[#1A75BC] hover:bg-blue-700" onClick={() => handleAddDoctor(doctor)}>Add</Button>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No matching doctors found. Please try a different search term.</p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

