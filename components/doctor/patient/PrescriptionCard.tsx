import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface PrescriptionCardProps {
  prescription: {
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
  }
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    const element = document.getElementById("prescription-content")
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          logging: false,
          useCORS: true,
        })
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        })

        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save(`prescription_${prescription.healthId}_${format(new Date(prescription.date), "yyyyMMdd")}.pdf`)
      } catch (error) {
        console.error("Error generating PDF:", error)
        alert("Failed to generate PDF. Please try again.")
      }
    }
    setIsDownloading(false)
  }

  return (
    <div className="space-y-4">
      <DialogTitle className="sr-only">Prescription Details</DialogTitle>
      <div id="prescription-content" className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Image src="/assets/images/logo.png" alt="Health Buddy" width={48} height={48} />
            <h2 className="text-2xl font-bold">Health Buddy</h2>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl font-semibold">{prescription.doctorName}</h3>
          {prescription.doctorQualification && <p className="text-gray-600">{prescription.doctorQualification}</p>}
          {prescription.clinicAddress && <p className="text-gray-600">{prescription.clinicAddress}</p>}
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8">
          <div className="col-span-2 border-b mb-2">
            <p className="font-medium">Patient Information</p>
          </div>
          <p>
            <span className="font-medium">Name:</span> {prescription.patientName}
          </p>
          <p>
            <span className="font-medium">Health ID:</span> {prescription.healthId}
          </p>
          <p>
            <span className="font-medium">Age:</span> {prescription.patientDetails.age || "N/A"}
          </p>
          <p>
            <span className="font-medium">Gender:</span> {prescription.patientDetails.gender || "N/A"}
          </p>
          <p>
            <span className="font-medium">Date:</span> {format(new Date(prescription.date), "PPP")}
          </p>
        </div>

        {/* Prescription */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">℞</span>
            <div className="flex-1 border-b border-gray-300"></div>
          </div>
          <div className="space-y-6 pl-6">
            {prescription.medicines.map((medicine, index) => (
              <div key={index} className="space-y-1">
                <p className="font-medium">
                  {index + 1}. {medicine.name} {medicine.dosage}
                </p>
                <p className="text-gray-600 pl-4">
                  {medicine.frequency} for {medicine.duration}
                  {medicine.instructions && <span className="block pl-4">Instructions: {medicine.instructions}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-right">
          <p className="font-medium">{prescription.doctorName}</p>
          {prescription.doctorQualification && (
            <p className="text-gray-600 text-sm">{prescription.doctorQualification}</p>
          )}
        </div>
      </div>
      <div className="flex justify-center">
        <Button onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? "Generating PDF..." : "Download Prescription"}
        </Button>
      </div>
    </div>
  )
}

