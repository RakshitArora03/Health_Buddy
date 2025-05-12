"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingAppointmentsList } from "@/components/doctor/appointments/pending-appointments-list"
import { UpcomingAppointmentsList } from "@/components/doctor/appointments/upcoming-appointments-list"
import { AppointmentCalendarView } from "@/components/doctor/appointments/appointment-calendar-view"
import { Button } from "@/components/ui/button"
import { Calendar, List } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const { toast } = useToast()

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        // Fetch confirmed appointments
        const appointmentsResponse = await fetch("/api/doctor/appointments")

        // Fetch pending appointment requests
        const pendingResponse = await fetch("/api/doctor/appointments/pending")

        if (appointmentsResponse.ok && pendingResponse.ok) {
          const appointmentsData = await appointmentsResponse.json()
          const pendingData = await pendingResponse.json()

          setAppointments(appointmentsData)
          setPendingRequests(pendingData)
        } else {
          toast({
            title: "Error",
            description: "Failed to load appointments",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [toast])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/doctor/appointments/${requestId}/accept`, {
        method: "POST",
      })

      if (response.ok) {
        // Update local state
        const updatedRequest = await response.json()

        // Remove from pending and add to appointments
        setPendingRequests(pendingRequests.filter((req) => req._id !== requestId))
        setAppointments([...appointments, updatedRequest])

        toast({
          title: "Success",
          description: "Appointment request accepted",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to accept appointment request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDenyRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/doctor/appointments/${requestId}/deny`, {
        method: "POST",
      })

      if (response.ok) {
        // Remove from pending requests
        setPendingRequests(pendingRequests.filter((req) => req._id !== requestId))

        toast({
          title: "Success",
          description: "Appointment request denied",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to deny appointment request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error denying request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Schedule</h1>
        <Button
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
        >
          {viewMode === "list" ? (
            <>
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar View</span>
            </>
          ) : (
            <>
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List View</span>
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>

        {viewMode === "list" ? (
          <>
            <TabsContent value="upcoming">
              <UpcomingAppointmentsList
                appointments={appointments.filter(
                  (app) => new Date(app.date) >= new Date() && app.status === "confirmed",
                )}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="pending">
              <PendingAppointmentsList
                pendingRequests={pendingRequests}
                isLoading={isLoading}
                onAccept={handleAcceptRequest}
                onDeny={handleDenyRequest}
              />
            </TabsContent>

            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle>Past Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading past appointments...</p>
                  ) : appointments.filter((app) => new Date(app.date) < new Date() || app.status === "completed")
                      .length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Past appointments would be rendered here */}
                      <p>Past appointments list</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No past appointments found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <TabsContent value="upcoming" forceMount>
            <AppointmentCalendarView
              appointments={[
                ...appointments.filter((app) => app.status === "confirmed"),
                ...pendingRequests.map((req) => ({ ...req, status: "pending" })),
              ]}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

