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

interface Patient {
  id: string
  name: string
  healthBuddyID?: string
  profileImage?: string
}

interface StartChatModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPatient: (patient: Patient) => void
}

export default function StartChatModal({ isOpen, onClose, onSelectPatient }: StartChatModalProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/doctor/patients")

        if (!response.ok) {
          throw new Error("Failed to fetch patients")
        }

        const data = await response.json()
        setPatients(data)
        setFilteredPatients(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast({
          title: "Error",
          description: "Failed to load your patients. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchPatients()
    }
  }, [isOpen, toast])

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (patient.healthBuddyID && patient.healthBuddyID.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchQuery, patients])

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
            placeholder="Search patients by name or Health ID"
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
          ) : filteredPatients.length > 0 ? (
            // Patient list
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center space-x-4 p-3 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                onClick={() => onSelectPatient(patient)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={patient.profileImage} alt={patient.name} />
                  <AvatarFallback className="bg-[#E6F2F0] text-[#006D5B]">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{patient.name}</h4>
                  <p className="text-sm text-gray-500">
                    {patient.healthBuddyID ? `Health ID: ${patient.healthBuddyID}` : "Patient"}
                  </p>
                </div>
                <Button size="sm" className="bg-[#006D5B] hover:bg-[#005A4B]">
                  Chat
                </Button>
              </div>
            ))
          ) : (
            // No patients found
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery
                  ? "No patients match your search"
                  : "You don't have any patients yet. Please add patients from the Patients page."}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4 bg-[#006D5B] hover:bg-[#005A4B]"
                  onClick={() => {
                    onClose()
                    window.location.href = "/doctor/patients"
                  }}
                >
                  Go to Patients
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

