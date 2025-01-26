import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Patient {
  id: string
  name: string
  healthBuddyID: string
  profileImage?: string
}

interface AddPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onAddPatient: (patient: Patient) => void
  patients: Patient[]
}

export function AddPatientModal({ isOpen, onClose, onAddPatient, patients }: AddPatientModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search-patients?query=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error("Failed to fetch patients")
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching patients:", error)
      toast({
        title: "Error",
        description: "Failed to search patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddPatient = async (patient: Patient) => {
    // Check if the patient is already in the list
    const isAlreadyAdded = patients.some((p) => p.id === patient.id)
    if (isAlreadyAdded) {
      toast({
        title: "Error",
        description: `${patient.name} is already in your patient list.`,
        variant: "destructive",
      })
      return
    }

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
        // Use the patient data returned from the API or fall back to the original patient data
        const addedPatient = data.patient || patient
        onAddPatient(addedPatient)
        toast({
          title: "Patient Added",
          description: `${addedPatient.name} (HealthID: ${addedPatient.healthBuddyID}) has been added to your list!`,
        })
      }
      onClose()
    } catch (error) {
      console.error("Error adding patient:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add patient",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Patient to Your List</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name, UID, or other identifiers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={patient.profileImage} />
                      <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500">HealthID: {patient.healthBuddyID}</p>
                    </div>
                  </div>
                  <Button onClick={() => handleAddPatient(patient)}>Add</Button>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">
                No matching patients found. Please ensure the details are correct or create a new patient profile.
              </p>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Patient
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

