"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock, MapPin, Video, FileText, Upload } from "lucide-react"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface AppointmentDetailsModalProps {
  appointment: any
  isOpen: boolean
  onClose: () => void
  onReschedule: () => void
  onCancel: () => void
  onJoinCall: () => void
}

export function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  onCancel,
  onJoinCall,
}: AppointmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const isUpcoming = new Date(appointment.date) >= new Date() && appointment.status !== "cancelled"
  const isOnline = appointment.type === "online"
  const isConfirmed = appointment.status === "confirmed"
  const isPast = new Date(appointment.date) < new Date() || appointment.status === "completed"

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      // Here you would implement the file upload logic
      console.log("Uploading file:", selectedFile.name)
      // Reset the selected file after upload
      setSelectedFile(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Appointment Details</span>
            {renderStatusBadge(appointment.status)}
          </DialogTitle>
          <DialogDescription>View and manage your appointment information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="doctor">Doctor Info</TabsTrigger>
            {isPast ? (
              <TabsTrigger value="prescription">Prescription</TabsTrigger>
            ) : (
              <TabsTrigger value="documents">Documents</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="flex items-center mb-2">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>{format(new Date(appointment.date), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                {appointment.location || (appointment.type === "online" ? "Online Consultation" : "In-Person Visit")}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Consultation Type</h4>
              <Badge variant="outline">
                {appointment.type === "online" ? "Online Consultation" : "In-Person Visit"}
              </Badge>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Reason for Appointment</h4>
              <p className="text-sm text-gray-600">{appointment.reason || "Not specified"}</p>
            </div>

            {appointment.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm text-gray-600">{appointment.notes}</p>
              </div>
            )}

            {appointment.paymentMethod && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Payment Method</h4>
                <p className="text-sm text-gray-600">{appointment.paymentMethod}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="doctor" className="space-y-4 mt-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={appointment.doctorProfileImage || "/placeholder.svg"} alt={appointment.doctorName} />
                <AvatarFallback>
                  {appointment.doctorName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{appointment.doctorName}</h3>
                <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Navigate to doctor's profile
                  window.location.href = `/patient/doctors/${appointment.doctorId}`
                }}
              >
                View Doctor's Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="prescription" className="space-y-4 mt-4">
            {isPast ? (
              appointment.status === "completed" ? (
                <div>
                  <h4 className="text-sm font-medium mb-2">Prescription Details</h4>
                  <div className="p-4 border rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600 italic">
                      Prescription information will be displayed here if available.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        // Navigate to prescriptions
                        window.location.href = "/patient/prescriptions"
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View All Prescriptions
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No prescription available for this appointment.</p>
                </div>
              )
            ) : null}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Upload Documents</h4>
              <p className="text-sm text-gray-500 mb-4">
                Upload any relevant medical documents or reports for this appointment.
              </p>

              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="document">Document</Label>
                  <Input id="document" type="file" onChange={handleFileChange} />
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                    <Button size="sm" onClick={handleUpload}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-wrap gap-2 mt-4">
          {isUpcoming && isConfirmed && (
            <>
              <Button variant="outline" onClick={onReschedule}>
                Reschedule
              </Button>
              <Button variant="destructive" onClick={onCancel}>
                Cancel Appointment
              </Button>
            </>
          )}

          {isUpcoming && isOnline && isConfirmed && (
            <Button variant="default" className="bg-blue-500 hover:bg-blue-600" onClick={onJoinCall}>
              <Video className="h-4 w-4 mr-2" />
              Join Call
            </Button>
          )}

          <Button variant={isUpcoming && (isConfirmed || isOnline) ? "outline" : "default"} onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

