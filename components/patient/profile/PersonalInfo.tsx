"use client"

import type React from "react"

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

interface UserDetails {
  fullName: string
  userId: string
  healthBuddyUID: string
  profileImage: string
  phoneNumber: string
  dateOfBirth: string
  gender: string
  height: string
  weight: string
  bloodGroup: string
  healthIdRegistered: boolean
  email: string
  address: string
  fatherName?: string
}

interface PatientPersonalInfoProps {
  userDetails: UserDetails
  onUpdate?: () => void
}

export function PatientPersonalInfo(props: PatientPersonalInfoProps) {
  const { userDetails } = props
  const { data: session } = useSession()
  const [patientInfo, setPatientInfo] = useState<UserDetails>(userDetails)
  const [editableFields, setEditableFields] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchPatientInfo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/user-details?email=${session?.user?.email}`)
      if (response.ok) {
        const data = await response.json()
        setPatientInfo(data)
      } else {
        throw new Error("Failed to fetch patient info")
      }
    } catch (error) {
      console.error("Error fetching patient info:", error)
      toast.error("Failed to load patient information")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPatientInfo(userDetails)
  }, [userDetails])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("image", file)

      try {
        const response = await fetch("/api/patient/upload-profile-image", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setPatientInfo((prev) => ({ ...prev, profileImage: data.imageUrl }))
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
    setPatientInfo((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientInfo),
      })

      if (response.ok) {
        setEditableFields({})
        setHasChanges(false)
        toast.success("Profile updated successfully")

        // Call the onUpdate callback to refresh parent component data
        if (props.onUpdate) {
          props.onUpdate()
        }
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
    setPatientInfo(userDetails)
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
            <AvatarImage src={patientInfo.profileImage || "/placeholder.svg"} alt={patientInfo.fullName} />
            <AvatarFallback>{patientInfo.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Input
              id="profileImage"
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
            />
            <Label
              htmlFor="profileImage"
              className="cursor-pointer flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Picture
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <div className="flex items-center">
              <Input
                id="fullName"
                value={patientInfo.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                disabled={!editableFields.fullName}
                className={editableFields.fullName ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("fullName")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={patientInfo.email} disabled />
          </div>
          <div>
            <Label htmlFor="fatherName">Father's Name</Label>
            <div className="flex items-center">
              <Input
                id="fatherName"
                value={patientInfo.fatherName || ""}
                onChange={(e) => handleChange("fatherName", e.target.value)}
                placeholder="Enter your father's name"
                disabled={!editableFields.fatherName}
                className={editableFields.fatherName ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("fatherName")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <div className="flex items-center">
              <Select
                value={patientInfo.gender}
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
                value={patientInfo.dateOfBirth ? patientInfo.dateOfBirth.split("T")[0] : ""}
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
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex items-center">
              <Input
                id="phoneNumber"
                value={patientInfo.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                disabled={!editableFields.phoneNumber}
                className={editableFields.phoneNumber ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("phoneNumber")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <div className="flex items-center">
              <Input
                id="address"
                value={patientInfo.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter your address"
                disabled={!editableFields.address}
                className={editableFields.address ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("address")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <div className="flex items-center">
              <Select
                value={patientInfo.bloodGroup}
                onValueChange={(value) => handleChange("bloodGroup", value)}
                disabled={!editableFields.bloodGroup}
              >
                <SelectTrigger className={editableFields.bloodGroup ? "" : "opacity-50"}>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => handleEdit("bloodGroup")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <div className="flex items-center">
              <Input
                id="height"
                value={patientInfo.height}
                onChange={(e) => handleChange("height", e.target.value)}
                placeholder="Enter your height"
                disabled={!editableFields.height}
                className={editableFields.height ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("height")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <div className="flex items-center">
              <Input
                id="weight"
                value={patientInfo.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="Enter your weight"
                disabled={!editableFields.weight}
                className={editableFields.weight ? "" : "opacity-50"}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit("weight")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="healthBuddyUID">Health Buddy ID</Label>
            <Input id="healthBuddyUID" value={patientInfo.healthBuddyUID} disabled />
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

