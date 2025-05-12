"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, MapPin, Video } from "lucide-react"
import { format } from "date-fns"

interface UpcomingAppointmentsListProps {
  appointments: any[]
  isLoading: boolean
}

export function UpcomingAppointmentsList({ appointments, isLoading }: UpcomingAppointmentsListProps) {
  const handleStartCall = (appointmentId: string) => {
    // Logic to start video call
    console.log("Starting call for appointment:", appointmentId)
  }

  return (
    <Card className="bg-transparent shadow-none border-none">
      {/* <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader> */}
      <CardContent>
        {isLoading ? (
          <p>Loading appointments...</p>
        ) : appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment._id} className="hover:shadow-md transition-shadow w-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{appointment.patientName}</CardTitle>
                      <p className="text-sm text-gray-500">{appointment.patientEmail}</p>
                    </div>
                    <Badge className="bg-green-500">Confirmed</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
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
                    <span>{appointment.type === "online" ? "Online Consultation" : "In-Person Visit"}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button className="bg-[#006D5B] hover:bg-[#005c4d]" size="sm">View Details</Button>
                    {appointment.type === "online" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                        onClick={() => handleStartCall(appointment._id)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Start Call
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming appointments scheduled.</p>
        )}
      </CardContent>
    </Card>
  )
}

