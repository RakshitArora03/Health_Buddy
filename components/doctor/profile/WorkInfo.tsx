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

interface WorkInfo {
  clinicName: string
  clinicAddress: string
  consultationHours: string
  consultationMode: string
}

const fetchWorkInfo = async (setIsLoading, setWorkInfo) => {
  try {
    setIsLoading(true)
    const response = await fetch("/api/doctor/work-info")
    if (response.ok) {
      const data = await response.json()
      setWorkInfo(data)
    } else {
      throw new Error("Failed to fetch work info")
    }
  } catch (error) {
    console.error("Error fetching work info:", error)
    toast.error("Failed to load work information")
  } finally {
    setIsLoading(false)
  }
}

export function WorkInfo() {
  const { data: session } = useSession()
  const [workInfo, setWorkInfo] = useState<WorkInfo>({
    clinicName: "",
    clinicAddress: "",
    consultationHours: "",
    consultationMode: "",
  })
  const [editableFields, setEditableFields] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (session) {
      fetchWorkInfo(setIsLoading, setWorkInfo)
    }
  }, [session])

  const handleEdit = (field: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: string, value: string) => {
    setWorkInfo((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/doctor/work-info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workInfo),
      })

      if (response.ok) {
        setEditableFields({})
        setHasChanges(false)
        toast.success("Work information updated successfully")
      } else {
        throw new Error("Failed to update work information")
      }
    } catch (error) {
      console.error("Error updating work information:", error)
      toast.error("Failed to update work information")
    }
  }

  const handleCancel = () => {
    setEditableFields({})
    setHasChanges(false)
    fetchWorkInfo(setIsLoading, setWorkInfo)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clinicName">Clinic/Hospital Name</Label>
            <div className="flex items-center">
              <Input
                id="clinicName"
                value={workInfo.clinicName}
                onChange={(e) => handleChange("clinicName", e.target.value)}
                placeholder="Enter clinic or hospital name"
                disabled={!editableFields.clinicName}
                className={editableFields.clinicName ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("clinicName")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="clinicAddress">Clinic/Hospital Address</Label>
            <div className="flex items-center">
              <Textarea
                id="clinicAddress"
                value={workInfo.clinicAddress}
                onChange={(e) => handleChange("clinicAddress", e.target.value)}
                placeholder="Enter clinic or hospital address"
                disabled={!editableFields.clinicAddress}
                className={editableFields.clinicAddress ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("clinicAddress")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="consultationHours">Consultation Hours</Label>
            <div className="flex items-center">
              <Input
                id="consultationHours"
                value={workInfo.consultationHours}
                onChange={(e) => handleChange("consultationHours", e.target.value)}
                placeholder="Enter consultation hours"
                disabled={!editableFields.consultationHours}
                className={editableFields.consultationHours ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("consultationHours")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="consultationMode">Consultation Mode</Label>
            <div className="flex items-center">
              <Input
                id="consultationMode"
                value={workInfo.consultationMode}
                onChange={(e) => handleChange("consultationMode", e.target.value)}
                placeholder="Enter consultation mode (e.g., In-person, Online, Both)"
                disabled={!editableFields.consultationMode}
                className={editableFields.consultationMode ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("consultationMode")}>
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

