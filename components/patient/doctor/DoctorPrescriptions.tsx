"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PrescriptionPreview } from "@/components/patient/PrescriptionPreview"

interface Prescription {
  id: string
  doctorName: string
  doctorSpecialization: string
  date: string
  medicines: any[]
  patientName: string
  patientId: string
  healthId: string
  patientDetails: {
    age?: string
    gender?: string
  }
}

interface DoctorPrescriptionsProps {
  doctorId: string
}

export function DoctorPrescriptions({ doctorId }: DoctorPrescriptionsProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await fetch(`/api/patient/prescriptions?doctorId=${doctorId}`)
        if (!response.ok) throw new Error("Failed to fetch prescriptions")
        const data = await response.json()
        setPrescriptions(data)
      } catch (error) {
        console.error("Error fetching prescriptions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrescriptions()
  }, [doctorId])

  if (isLoading) {
    return <div className="text-center mt-8">Loading prescriptions...</div>
  }

  if (prescriptions.length === 0) {
    return <div className="text-center mt-8">No prescriptions found for this doctor.</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-1">{prescription.doctorName}</h3>
                <p className="text-gray-500 mb-2">{prescription.doctorSpecialization}</p>
                <p className="text-gray-500 mb-2">{format(new Date(prescription.date), "PPP")}</p>
                <p className="text-gray-600">{prescription.medicines.length} medicine(s) prescribed</p>
              </div>
              <Button className="w-full mt-4" onClick={() => setSelectedPrescription(prescription)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Prescription Details</DialogTitle>
          {selectedPrescription && <PrescriptionPreview prescription={selectedPrescription} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

