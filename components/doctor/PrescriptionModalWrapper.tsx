"use client"

import { useState } from "react"
import { PrescriptionFormModal } from "./PrescriptionFormModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PrescriptionModalWrapperProps {
  doctorName: string
  patientName: string
  patientId: string
}

export function PrescriptionModalWrapper({ doctorName, patientName, patientId }: PrescriptionModalWrapperProps) {
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)

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
          doctorName={doctorName}
          patientName={patientName}
          patientId={patientId}
        />
      )}
    </>
  )
}

