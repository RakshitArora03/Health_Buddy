"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Doctor {
  id: string
  name: string
  specialization: string
  profileImage?: string
}

interface StartChatModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectDoctor: (doctor: Doctor) => void
}

export default function StartChatModal({ isOpen, onClose, onSelectDoctor }: StartChatModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/patient/doctors")

        if (!response.ok) {
          throw new Error("Failed to fetch doctors")
        }

        const data = await response.json()
        setDoctors(data)
        setFilteredDoctors(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast({
          title: "Error",
          description: "Failed to load your doctors. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen, toast])

  useEffect(() => {
    if (searchQuery) {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredDoctors(filtered)
    } else {
      setFilteredDoctors(doctors)
    }
  }, [searchQuery, doctors])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
        </DialogHeader>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search doctors by name or specialization"
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {loading ? (
            // Loading skeletons
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
          ) : filteredDoctors.length > 0 ? (
            // Doctor list
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center space-x-4 p-3 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                onClick={() => onSelectDoctor(doctor)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{doctor.name}</h4>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                </div>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  Chat
                </Button>
              </div>
            ))
          ) : (
            // No doctors found
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery
                  ? "No doctors match your search"
                  : "You don't have any doctors yet. Please add doctors from the Doctors page."}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4 bg-blue-500 hover:bg-blue-600"
                  onClick={() => {
                    onClose()
                    window.location.href = "/patient/doctors"
                  }}
                >
                  Go to Doctors
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

