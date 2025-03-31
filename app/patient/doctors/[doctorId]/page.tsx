"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorInfo } from "@/components/patient/doctor/DoctorInfo"
import { DoctorVisits } from "@/components/patient/doctor/DoctorVisits"
import { DoctorPrescriptions } from "@/components/patient/doctor/DoctorPrescriptions"

interface Doctor {
  id: string
  name: string
  specialization: string
  profileImage?: string
  qualifications?: string
  experience?: string
  clinicAddress?: string
  consultationHours?: string
}

export default function DoctorDetailsPage() {
  const params = useParams()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch(`/api/patient/doctors/${params.doctorId}`)
        if (!response.ok) throw new Error("Failed to fetch doctor details")
        const data = await response.json()
        setDoctor(data)
      } catch (error) {
        console.error("Error fetching doctor details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.doctorId) {
      fetchDoctorDetails()
    }
  }, [params.doctorId])

  if (isLoading) {
    return <div className="text-center mt-8">Loading doctor details...</div>
  }

  if (!doctor) {
    return <div className="text-center mt-8">Doctor not found</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Doctor Header */}
      <Card className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={doctor.profileImage || "/placeholder.svg"} alt={doctor.name} />
            <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{doctor.name}</h1>
            <p className="text-gray-500">{doctor.specialization}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-b w-full justify-start rounded-none h-auto p-0">
          <TabsTrigger
            value="info"
            className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 transition-none whitespace-nowrap text-sm sm:text-base flex-shrink-0`}
          >
            Doctor Info
          </TabsTrigger>
          <TabsTrigger
            value="visits"
            className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 transition-none whitespace-nowrap text-sm sm:text-base flex-shrink-0`}
          >
            Visits
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions" 
            className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 transition-none whitespace-nowrap text-sm sm:text-base flex-shrink-0`}
          >
            Prescriptions
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="info" className="m-0">
            <DoctorInfo doctor={doctor} />
          </TabsContent>
          <TabsContent value="visits" className="m-0">
            <DoctorVisits doctorId={doctor.id} />
          </TabsContent>
          <TabsContent value="prescriptions" className="m-0">
            <DoctorPrescriptions doctorId={doctor.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

