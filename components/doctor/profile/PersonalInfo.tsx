"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { Pencil, Upload } from "lucide-react"

interface DoctorInfo {
  name: string
  email: string
  profileImage: string | null
  specialization: string
  gender: string
  dateOfBirth: string
  contactNumber: string
}

export function PersonalInfo() {
  const { data: session } = useSession()
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo>({
    name: "",
    email: "",
    profileImage: null,
    specialization: "",
    gender: "",
    dateOfBirth: "",
    contactNumber: "",
  })
  const [editableFields, setEditableFields] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDoctorInfo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/doctor/profile")
      if (response.ok) {
        const data = await response.json()
        setDoctorInfo(data)
      } else {
        throw new Error("Failed to fetch doctor info")
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error)
      toast.error("Failed to load doctor information")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchDoctorInfo()
    }
  }, [session])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("image", file)

      try {
        const response = await fetch("/api/doctor/upload-profile-image", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setDoctorInfo((prev) => ({ ...prev, profileImage: data.imageUrl }))
          toast.success("Profile image updated successfully")
        } else {
          throw new Error("Failed to upload image")
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error("Failed to upload profile image")
      }
    }
  }

  const handleEdit = (field: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: string, value: string) => {
    setDoctorInfo((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorInfo),
      })

      if (response.ok) {
        setEditableFields({})
        setHasChanges(false)
        toast.success("Profile updated successfully")
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  const handleCancel = () => {
    setEditableFields({})
    setHasChanges(false)
    if (session) {
      fetchDoctorInfo()
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-32 h-32">
            <AvatarImage
              src={doctorInfo.profileImage || "/assets/icons/profile-placeholder.png"}
              alt={doctorInfo.name}
            />
            <AvatarFallback>{doctorInfo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Input id="profileImage" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
            <Label
              htmlFor="profileImage"
              className="cursor-pointer flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Picture
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="flex items-center">
              <Input
                id="name"
                value={doctorInfo.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter your full name"
                disabled={!editableFields.name}
                className={editableFields.name ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("name")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={doctorInfo.email} disabled />
          </div>
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <div className="flex items-center">
              <Input
                id="specialization"
                value={doctorInfo.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
                placeholder="Enter your specialization"
                disabled={!editableFields.specialization}
                className={editableFields.specialization ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("specialization")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <div className="flex items-center">
              <Select
                value={doctorInfo.gender}
                onValueChange={(value) => handleChange("gender", value)}
                disabled={!editableFields.gender}
              >
                <SelectTrigger className={editableFields.gender ? "" : "opacity-50"}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => handleEdit("gender")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <div className="flex items-center">
              <Input
                id="dateOfBirth"
                type="date"
                value={doctorInfo.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                placeholder="Enter your date of birth"
                disabled={!editableFields.dateOfBirth}
                className={editableFields.dateOfBirth ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("dateOfBirth")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <div className="flex items-center">
              <Input
                id="contactNumber"
                value={doctorInfo.contactNumber}
                onChange={(e) => handleChange("contactNumber", e.target.value)}
                placeholder="Enter your contact number"
                disabled={!editableFields.contactNumber}
                className={editableFields.contactNumber ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("contactNumber")}>
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

