"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, Clock, MapPin, Video, FileText, Check, X, Pencil } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AppointmentDetailsModalProps {
  appointment: any
  isOpen: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onReschedule: () => void
  onJoinCall: () => void
}

export function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onReschedule,
  onJoinCall,
}: AppointmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [notes, setNotes] = useState(appointment.notes || "")
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  const appointmentDate = new Date(appointment.date)
  const isUpcoming = appointmentDate >= new Date() && appointment.status !== "cancelled"
  const isOnline = appointment.type === "online"
  const isConfirmed = appointment.status === "confirmed"
  const isPending = appointment.status === "pending"
  const isPast = appointmentDate < new Date() || appointment.status === "completed"

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

  const handleSaveNotes = () => {
    // Here you would save the notes to your backend
    console.log("Saving notes:", notes)
    setIsEditingNotes(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>View and manage appointment information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="patient">Patient Info</TabsTrigger>
            <TabsTrigger value="notes">Medical Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-medium">{appointment.patientName}</h3>
                <p className="text-sm text-gray-500">
                  {appointment.patientAge} years, {appointment.patientGender}
                </p>
              </div>
              <div className="ml-auto">{renderStatusBadge(appointment.status)}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Date: {format(new Date(appointment.date), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Time: {appointment.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Location: {appointment.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Consultation Type:</span>
                  <Badge variant="outline" className="ml-2">
                    {appointment.type === "online" ? "Online Consultation" : "In-Person Visit"}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Payment Method:</span>
                  <span className="text-sm ml-2">{appointment.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Reason:</span>
                  <p className="text-sm mt-1">{appointment.reason}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patient" className="space-y-4 mt-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={appointment.patientProfileImage} alt={appointment.patientName} />
                <AvatarFallback>{appointment.patientName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{appointment.patientName}</h3>
                <p className="text-sm text-gray-500">
                  {appointment.patientAge} years, {appointment.patientGender}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Patient History</h4>
                <p className="text-sm">
                  This is where you would display the patient's medical history, allergies, and other relevant
                  information.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Previous Visits</h4>
                <p className="text-sm">This is where you would display the patient's previous visits and treatments.</p>
              </div>

              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  // Navigate to patient profile
                  window.location.href = `/doctor/patients/${appointment.patientId}`
                }}
              >
                View Full Patient Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Medical Notes</h4>
                {!isEditingNotes && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Notes
                  </Button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter medical notes, observations, and treatment plan"
                    className="min-h-[200px]"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNotes(appointment.notes || "")
                        setIsEditingNotes(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNotes}>Save Notes</Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md min-h-[200px]">
                  {notes ? (
                    <p className="whitespace-pre-wrap">{notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">No medical notes have been added yet.</p>
                  )}
                </div>
              )}

              {isPast && appointment.status === "completed" && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Medical Report
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-wrap gap-2 mt-4">
          {isPending && (
            <>
              <Button variant="default" className="bg-green-500 hover:bg-green-600" onClick={onApprove}>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive" onClick={onReject}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}

          {isUpcoming && isConfirmed && (
            <Button variant="outline" onClick={onReschedule}>
              Reschedule
            </Button>
          )}

          {isUpcoming && isOnline && isConfirmed && (
            <Button variant="default" className="bg-[#006D5B] hover:bg-[#005A4B]" onClick={onJoinCall}>
              <Video className="h-4 w-4 mr-2" />
              Join Video Call
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

