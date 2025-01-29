"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MessageSquare, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientInfo } from "@/components/doctor/patient/PatientInfo"
import { PatientVisits } from "@/components/doctor/patient/PatientVisits"
import { PatientPrescriptions } from "@/components/doctor/patient/PatientPrescriptions"
import { PrescriptionModalWrapper } from "@/components/doctor/PrescriptionModalWrapper"

interface Patient {
  id: string
  name: string
  healthBuddyID: string
  profileImage?: string
  latestDiagnosis?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  height?: string
  weight?: string
  phoneNumber?: string
  address?: string
}

export default function PatientDetailsPage() {
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    // Fetch patient details
    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(`/api/doctor/patients/${params.patientId}/details`)
        if (!response.ok) throw new Error("Failed to fetch patient details")
        const data = await response.json()
        setPatient(data)
      } catch (error) {
        console.error("Error fetching patient details:", error)
      }
    }

    if (params.patientId) {
      fetchPatientDetails()
    }
  }, [params.patientId])

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading patient details...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Patient Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={patient.profileImage || "/placeholder.svg"} alt={patient.name} />
            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-gray-500">HealthID: {patient.healthBuddyID}</p>
            {patient.latestDiagnosis && (
              <p className="text-gray-600 mt-1">{patient.latestDiagnosis} - Latest diagnosis</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button className="bg-[#006D5B] hover:bg-[#005c4d]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <PrescriptionModalWrapper
              doctorName="Doctor Name Placeholder"  
              patientName={patient.name}
              patientId={patient.healthBuddyID}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-b w-full justify-start rounded-none h-auto p-0">
          <TabsTrigger
            value="info"
            className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-[#006D5B] data-[state=active]:text-[#006D5B] transition-none`}
          >
            Patient Info
          </TabsTrigger>
          <TabsTrigger
            value="visits"
            className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-[#006D5B] data-[state=active]:text-[#006D5B] transition-none`}
          >
            Visits
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-[#006D5B] data-[state=active]:text-[#006D5B] transition-none`}
          >
            Prescriptions
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="info" className="m-0">
            <PatientInfo patient={patient} />
          </TabsContent>
          <TabsContent value="visits" className="m-0">
            <PatientVisits patientId={patient.id} />
          </TabsContent>
          <TabsContent value="prescriptions" className="m-0">
            <PatientPrescriptions patientId={patient.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

