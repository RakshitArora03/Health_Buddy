"use client"

import { useState } from "react"
import { PrescriptionFormModal } from "./PrescriptionFormModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface PrescriptionModalWrapperProps {
  doctorName: string
  patientName: string
  patientId: string
  healthId: string
  patientDetails: {
    age?: string
    gender?: string
  }
}

export function PrescriptionModalWrapper({
  doctorName,
  patientName,
  patientId,
  healthId,
  patientDetails,
}: PrescriptionModalWrapperProps) {
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const router = useRouter()

  const handlePrescriptionSaved = () => {
    setIsPrescriptionModalOpen(false)
    router.refresh() // This will trigger a re-fetch of the prescriptions
  }

  return (
    <>
      <Button className="bg-[#006D5B] hover:bg-[#005c4d]" onClick={() => setIsPrescriptionModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Prescription
      </Button>
      {isPrescriptionModalOpen && (
        <PrescriptionFormModal
          isOpen={isPrescriptionModalOpen}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onSuccess={handlePrescriptionSaved}
          doctorName={doctorName}
          patientName={patientName}
          patientId={patientId}
          healthId={healthId}
          patientDetails={patientDetails}
        />
      )}
    </>
  )
}

