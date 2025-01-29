"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PrescriptionCard } from "./PrescriptionCard"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { format } from "date-fns"

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface Prescription {
  _id: string
  doctorName: string
  doctorQualification: string
  clinicAddress: string
  patientName: string
  patientId: string
  healthId: string
  patientDetails: {
    age?: string
    gender?: string
  }
  medicines: Medicine[]
  date: string
  createdAt: string
}

interface PatientPrescriptionsProps {
  patientId: string
}

export function PatientPrescriptions({ patientId }: PatientPrescriptionsProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        console.log("Fetching prescriptions for patientId:", patientId)
        const response = await fetch(`/api/prescriptions?patientId=${patientId}`)
        if (!response.ok) throw new Error("Failed to fetch prescriptions")
        const data = await response.json()
        console.log("Fetched prescriptions:", data)
        setPrescriptions(data)
      } catch (error) {
        console.error("Error fetching prescriptions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrescriptions()

    const handlePrescriptionSaved = () => {
      fetchPrescriptions()
    }

    window.addEventListener("prescriptionSaved", handlePrescriptionSaved)

    return () => {
      window.removeEventListener("prescriptionSaved", handlePrescriptionSaved)
    }
  }, [patientId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">Loading prescriptions...</p>
        </CardContent>
      </Card>
    )
  }

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No prescriptions recorded yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Prescriptions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map((prescription) => (
          <Card
            key={prescription._id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedPrescription(prescription)}
          >
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                <p className="text-gray-500">Health ID: {prescription.healthId}</p>
                <p className="text-gray-500">{format(new Date(prescription.createdAt), "PPP")}</p>
                <p className="text-gray-600">{prescription.medicines.length} medicine(s) prescribed</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPrescription && <PrescriptionCard prescription={selectedPrescription} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

