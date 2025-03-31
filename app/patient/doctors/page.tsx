"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus } from "lucide-react"
import { AddDoctorModal } from "@/components/patient/AddDoctorModal"

interface Doctor {
  id: string
  name: string
  specialization: string
  profileImage?: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/patient/doctors")
        if (!response.ok) throw new Error("Failed to fetch doctors")
        const data = await response.json()
        setDoctors(data)
        setFilteredDoctors(data)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredDoctors(filtered)
  }, [searchQuery, doctors])

  const handleAddDoctor = (newDoctor: Doctor) => {
    setDoctors((prevDoctors) => [...prevDoctors, newDoctor])
  }

  if (isLoading) {
    return <div className="text-center mt-8">Loading doctors...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Doctors</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search doctors..."
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
          <Button className="flex gap-2 bg-[#1A75BC] hover:bg-blue-700" onClick={() => setIsAddDoctorModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Doctor
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.profileImage || "/placeholder.svg"} alt={doctor.name} />
                  <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{doctor.name}</h2>
                  <p className="text-gray-500">{doctor.specialization}</p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-[#1A75BC] hover:bg-blue-700" onClick={() => router.push(`/patient/doctors/${doctor.id}`)}>
                View
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredDoctors.length === 0 && <p className="text-center text-gray-500 mt-8">No doctors found.</p>}

      <AddDoctorModal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        onAddDoctor={handleAddDoctor}
        doctors={doctors}
      />
    </div>
  )
}

