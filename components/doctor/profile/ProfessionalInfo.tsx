"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { Pencil } from "lucide-react"

interface ProfessionalInfo {
  medicalLicenseNumber: string
  yearsOfExperience: string
  qualifications: string
  affiliatedHospitals: string
}

const fetchProfessionalInfo = async (setIsLoading, setProfessionalInfo) => {
  try {
    setIsLoading(true)
    const response = await fetch("/api/doctor/professional-info")
    if (response.ok) {
      const data = await response.json()
      setProfessionalInfo(data)
    } else {
      throw new Error("Failed to fetch professional info")
    }
  } catch (error) {
    console.error("Error fetching professional info:", error)
    toast.error("Failed to load professional information")
  } finally {
    setIsLoading(false)
  }
}

export function ProfessionalInfo() {
  const { data: session } = useSession()
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    medicalLicenseNumber: "",
    yearsOfExperience: "",
    qualifications: "",
    affiliatedHospitals: "",
  })
  const [editableFields, setEditableFields] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (session) {
      fetchProfessionalInfo(setIsLoading, setProfessionalInfo)
    }
  }, [session])

  const handleEdit = (field: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: string, value: string) => {
    setProfessionalInfo((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/doctor/professional-info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(professionalInfo),
      })

      if (response.ok) {
        setEditableFields({})
        setHasChanges(false)
        toast.success("Professional information updated successfully")
      } else {
        throw new Error("Failed to update professional information")
      }
    } catch (error) {
      console.error("Error updating professional information:", error)
      toast.error("Failed to update professional information")
    }
  }

  const handleCancel = () => {
    setEditableFields({})
    setHasChanges(false)
    fetchProfessionalInfo(setIsLoading, setProfessionalInfo)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="medicalLicenseNumber">Medical License Number</Label>
            <div className="flex items-center">
              <Input
                id="medicalLicenseNumber"
                value={professionalInfo.medicalLicenseNumber}
                onChange={(e) => handleChange("medicalLicenseNumber", e.target.value)}
                placeholder="Enter your medical license number"
                disabled={!editableFields.medicalLicenseNumber}
                className={editableFields.medicalLicenseNumber ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("medicalLicenseNumber")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
            <div className="flex items-center">
              <Input
                id="yearsOfExperience"
                value={professionalInfo.yearsOfExperience}
                onChange={(e) => handleChange("yearsOfExperience", e.target.value)}
                placeholder="Enter your years of experience"
                disabled={!editableFields.yearsOfExperience}
                className={editableFields.yearsOfExperience ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("yearsOfExperience")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="qualifications">Qualifications</Label>
            <div className="flex items-center">
              <Textarea
                id="qualifications"
                value={professionalInfo.qualifications}
                onChange={(e) => handleChange("qualifications", e.target.value)}
                placeholder="Enter your qualifications (e.g., MBBS, MD, MS)"
                disabled={!editableFields.qualifications}
                className={editableFields.qualifications ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("qualifications")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="affiliatedHospitals">Affiliated Hospitals/Clinics</Label>
            <div className="flex items-center">
              <Textarea
                id="affiliatedHospitals"
                value={professionalInfo.affiliatedHospitals}
                onChange={(e) => handleChange("affiliatedHospitals", e.target.value)}
                placeholder="Enter your affiliated hospitals or clinics"
                disabled={!editableFields.affiliatedHospitals}
                className={editableFields.affiliatedHospitals ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("affiliatedHospitals")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {hasChanges && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel Changes
            </Button>
            <Button onClick={handleSave}>Apply and Save</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

