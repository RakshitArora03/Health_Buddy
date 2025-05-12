"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PendingAppointmentsListProps {
  pendingRequests: any[]
  isLoading: boolean
  onAccept: (requestId: string) => void
  onDeny: (requestId: string) => void
}

export function PendingAppointmentsList({
  pendingRequests,
  isLoading,
  onAccept,
  onDeny,
}: PendingAppointmentsListProps) {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [confirmDenyOpen, setConfirmDenyOpen] = useState(false)

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
  }

  const handleAccept = () => {
    if (selectedRequest) {
      onAccept(selectedRequest._id)
      setSelectedRequest(null)
    }
  }

  const handleOpenDenyDialog = () => {
    setConfirmDenyOpen(true)
  }

  const handleDeny = () => {
    if (selectedRequest) {
      onDeny(selectedRequest._id)
      setConfirmDenyOpen(false)
      setSelectedRequest(null)
    }
  }

  return (
    <>
      <Card className="bg-transparent shadow-none border-none">
        {/* <CardHeader>
          <CardTitle>Pending Appointment Requests</CardTitle>
        </CardHeader> */}
        <CardContent>
          {isLoading ? (
            <p>Loading pending requests...</p>
          ) : pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((request) => (
                <Card key={request._id} className="hover:shadow-md transition-shadow w-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{request.patientName}</CardTitle>
                        <p className="text-sm text-gray-500">{request.patientEmail}</p>
                      </div>
                      <Badge className="bg-yellow-500">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{format(new Date(request.date), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{request.time}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{request.type === "online" ? "Online Consultation" : "In-Person Visit"}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button className="bg-[#006D5B] hover:bg-[#005c4d]" size="sm" onClick={() => handleViewDetails(request)}>
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                        onClick={() => {
                          setSelectedRequest(request)
                          handleAccept()
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                        onClick={() => {
                          setSelectedRequest(request)
                          handleOpenDenyDialog()
                        }}
                      >
                        Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending appointment requests.</p>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Appointment Request Details</DialogTitle>
              <DialogDescription>Review the details of this appointment request.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Patient</h4>
                  <p className="font-medium">{selectedRequest.patientName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                  <p className="font-medium">
                    {format(new Date(selectedRequest.date), "MMMM d, yyyy")} at {selectedRequest.time}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                <p className="font-medium">
                  {selectedRequest.type === "online" ? "Online Consultation" : "In-Person Visit"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Reason for Appointment</h4>
                <p>{selectedRequest.reason}</p>
              </div>

              {selectedRequest.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Additional Notes</h4>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                <p className="capitalize">{selectedRequest.paymentMethod.replace("-", " ")}</p>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                onClick={handleAccept}
              >
                Accept Request
              </Button>
              <Button
                variant="outline"
                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                onClick={handleOpenDenyDialog}
              >
                Deny Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Deny Dialog */}
      <Dialog open={confirmDenyOpen} onOpenChange={setConfirmDenyOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deny Appointment Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to deny this appointment request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmDenyOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeny}>
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

