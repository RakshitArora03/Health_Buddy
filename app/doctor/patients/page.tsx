"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddPatientModal } from "@/components/doctor/AddPatientModal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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

interface Patient {
  id: string
  name: string
  healthBuddyID: string
  profileImage?: string
}

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch("/api/doctor/patients")
      if (!response.ok) throw new Error("Failed to fetch patients")
      const data = await response.json()
      console.log("Fetched patients:", data)
      setPatients(data)
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (session?.user?.email) {
      fetchPatients()
    }
  }, [session, fetchPatients])

  const handleAddPatient = async (patient: Patient) => {
    try {
      const response = await fetch("/api/doctor/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId: patient.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add patient")
      }

      if (data.alreadyAdded) {
        toast({
          title: "Info",
          description: `${patient.name} is already in your list.`,
        })
      } else {
        setPatients((prevPatients) => [...prevPatients, patient])
        toast({
          title: "Success",
          description: `${patient.name} has been added to your list.`,
        })
      }
    } catch (error) {
      console.error("Error adding patient:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add patient",
        variant: "destructive",
      })
    }
  }

  const handleDeletePatient = async (patient: Patient) => {
    setPatientToDelete(patient)
  }

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return

    try {
      const response = await fetch(`/api/doctor/patients/${patientToDelete.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.status === 404) {
        // Patient not found in the list, remove from local state
        setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== patientToDelete.id))
        toast({
          title: "Info",
          description: `${patientToDelete.name} was already removed from your list.`,
        })
      } else if (!response.ok) {
        throw new Error(data.error || "Failed to delete patient")
      } else {
        setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== patientToDelete.id))
        toast({
          title: "Success",
          description: `${patientToDelete.name} has been removed from your list.`,
        })
      }
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete patient",
        variant: "destructive",
      })
    } finally {
      setPatientToDelete(null)
    }
  }

  if (!session) {
    router.push("/login?role=doctor")
    return null
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search for events, patients"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="flex gap-2 bg-[#006D5B] hover:bg-[#005c4d]" onClick={() => setIsAddPatientModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading patients...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patients Found</h3>
          <p className="text-gray-500 max-w-md">
            It looks like you don't have any patients added to your list yet. Click on the Add Patient button to start
            managing your patients effectively.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="overflow-hidden group relative">
              <div className="p-4 flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-4">
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={patient.profileImage || "/placeholder.svg"}
                      alt={patient.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl">{patient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-semibold text-lg mb-1">{patient.name}</h3>
                <p className="text-gray-500 text-sm mb-4">HealthID: {patient.healthBuddyID}</p>
                <Button className="w-full bg-[#006D5B] hover:bg-[#005c4d]" variant="secondary">
                  view
                </Button>
              </div>
              <button
                onClick={() => handleDeletePatient(patient)}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onAddPatient={handleAddPatient}
        patients={patients}
      />

      <AlertDialog open={!!patientToDelete} onOpenChange={() => setPatientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to remove this patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove {patientToDelete?.name} from your patient list. You can add them back later if
              needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePatient}>Remove Patient</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

