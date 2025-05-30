"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Medicine {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface PrescriptionFormModalProps {
  isOpen: boolean
  onClose: () => void
  doctorName: string
  patientName: string
  patientId: string
  healthId: string
  patientDetails: {
    age?: string
    gender?: string
  }
}

export function PrescriptionFormModal({
  isOpen,
  onClose,
  doctorName,
  patientName,
  patientId,
  healthId,
  patientDetails,
}: PrescriptionFormModalProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [currentMedicine, setCurrentMedicine] = useState<Medicine>({
    id: "",
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMedicine({ ...currentMedicine, [e.target.name]: e.target.value })
  }

  const addMedicine = () => {
    if (currentMedicine.name && currentMedicine.dosage && currentMedicine.frequency && currentMedicine.duration) {
      setMedicines([
        ...medicines,
        {
          ...currentMedicine,
          id: Date.now().toString(),
          frequency: `${currentMedicine.frequency} time(s)`,
          duration: `${currentMedicine.duration} day(s)`,
        },
      ])
      setCurrentMedicine({
        id: "",
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      })
    }
  }

  const editMedicine = (id: string) => {
    const medicineToEdit = medicines.find((m) => m.id === id)
    if (medicineToEdit) {
      setCurrentMedicine(medicineToEdit)
      setMedicines(medicines.filter((m) => m.id !== id))
    }
  }

  const deleteMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id))
  }

  const savePrescription = async () => {
    if (medicines.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one medicine to the prescription",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          healthId,
          patientName,
          patientDetails,
          medicines,
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save prescription")
      }

      const result = await response.json()
      console.log("Prescription saved:", result)

      toast({
        title: "Success",
        description: "Prescription saved successfully",
      })
      onClose()
      window.dispatchEvent(new CustomEvent("prescriptionSaved"))
    } catch (error) {
      console.error("Error saving prescription:", error)
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Prescription</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="doctorName">Doctor Name</Label>
            <Input id="doctorName" value={doctorName || "Dr. Unknown"} readOnly />
          </div>
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input id="patientName" value={patientName} readOnly />
          </div>
          <div>
            <Label htmlFor="healthId">Health ID</Label>
            <Input id="healthId" value={healthId} readOnly />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" value={new Date().toLocaleDateString()} readOnly />
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <Label htmlFor="medicineName">Medicine Name</Label>
              <Input
                id="medicineName"
                name="name"
                value={currentMedicine.name}
                onChange={handleInputChange}
                placeholder="Enter medicine name"
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                name="dosage"
                value={currentMedicine.dosage}
                onChange={handleInputChange}
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                name="frequency"
                value={currentMedicine.frequency}
                onChange={handleInputChange}
                placeholder="e.g., 3 times a day"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={currentMedicine.duration}
                onChange={handleInputChange}
                placeholder="e.g., 7 days"
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Input
                id="instructions"
                name="instructions"
                value={currentMedicine.instructions}
                onChange={handleInputChange}
                placeholder="Special instructions"
              />
            </div>
          </div>
          <Button onClick={addMedicine}>Add Medicine</Button>
        </div>
        {medicines.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Instructions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell>{medicine.name}</TableCell>
                  <TableCell>{medicine.dosage}</TableCell>
                  <TableCell>{medicine.frequency}</TableCell>
                  <TableCell>{medicine.duration}</TableCell>
                  <TableCell>{medicine.instructions}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => editMedicine(medicine.id)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMedicine(medicine.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Button onClick={savePrescription} className="mt-4" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Prescription"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

