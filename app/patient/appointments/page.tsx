"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Clock, MapPin, Plus, Search, Grid, List, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { AppointmentRequestModal } from "@/components/patient/appointments/appointment-request-modal"
import { AppointmentDetailsModal } from "@/components/patient/appointments/appointment-details-modal"
import { AppointmentCalendarView } from "@/components/patient/appointments/appointment-calendar-view"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Replace the APPOINTMENTS constant with:
const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<any | null>(null)
  const { toast } = useToast()

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/appointments")
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      } else {
        console.error("Failed to fetch appointments")
        setAppointments([])
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  // Filter appointments based on search query, date, status, and type
  const filterAppointments = (appointments: any[]) => {
    return appointments.filter((appointment) => {
      // Search filter
      const searchFilter = searchQuery
        ? appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.doctorSpecialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.reason?.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      // Date filter
      const dateFilter = selectedDate
        ? format(new Date(appointment.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
        : true

      // Status filter
      const statusFilter = selectedStatus ? appointment.status === selectedStatus : true

      // Type filter
      const typeFilter = selectedType ? appointment.type === selectedType : true

      return searchFilter && dateFilter && statusFilter && typeFilter
    })
  }

  // Then update the getAppointmentsByTab function:
  const getAppointmentsByTab = (tab: string) => {
    const today = new Date()

    switch (tab) {
      case "upcoming":
        return appointments.filter(
          (appointment) =>
            new Date(appointment.date) >= today &&
            (appointment.status === "confirmed" || appointment.status === "pending"),
        )
      case "pending":
        return appointments.filter((appointment) => appointment.status === "pending")
      case "past":
        return appointments.filter(
          (appointment) =>
            new Date(appointment.date) < today ||
            appointment.status === "completed" ||
            appointment.status === "cancelled",
        )
      default:
        return appointments
    }
  }

  const filteredAppointments = filterAppointments(getAppointmentsByTab(activeTab))

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

  // Function to handle appointment actions
  const handleReschedule = (appointmentId: string) => {
    // Logic to handle reschedule
    console.log("Reschedule appointment:", appointmentId)
  }

  const handleCancelConfirmation = (appointment: any) => {
    setAppointmentToCancel(appointment)
    setIsCancelDialogOpen(true)
  }

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return

    try {
      const response = await fetch(`/api/appointments/${appointmentToCancel._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Update the appointment status locally
        setAppointments(
          appointments.map((app) => (app._id === appointmentToCancel._id ? { ...app, status: "cancelled" } : app)),
        )

        toast({
          title: "Appointment Cancelled",
          description: `Your appointment with Dr. ${appointmentToCancel.doctorName} has been cancelled successfully.`,
        })

        // Close the dialog
        setIsCancelDialogOpen(false)
        setAppointmentToCancel(null)

        // If the appointment details modal is open, close it
        if (selectedAppointment && selectedAppointment._id === appointmentToCancel._id) {
          setSelectedAppointment(null)
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to cancel appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleJoinCall = (appointmentId: string) => {
    // Logic to join video call
    console.log("Join call for appointment:", appointmentId)
  }

  // Function to render appointment card
  const renderAppointmentCard = (appointment: any) => {
    const appointmentDate = new Date(appointment.date)
    const isUpcoming = appointmentDate >= new Date() && appointment.status !== "cancelled"
    const isOnline = appointment.type === "online"
    const isConfirmed = appointment.status === "confirmed"

    return (
      <Card key={appointment._id || appointment.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{appointment.doctorName}</CardTitle>
              <CardDescription>{appointment.doctorSpecialty}</CardDescription>
            </div>
            {renderStatusBadge(appointment.status)}
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
            <span>
              {appointment.location || (appointment.type === "online" ? "Online Consultation" : "In-Person Visit")}
            </span>
          </div>
          {appointment.type && (
            <Badge variant="outline" className="mt-2">
              {appointment.type === "online" ? "Online Consultation" : "In-Person Visit"}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
            View Details
          </Button>

          {isUpcoming && isConfirmed && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment._id)}>
                Reschedule
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleCancelConfirmation(appointment)}>
                Cancel
              </Button>
            </>
          )}

          {isUpcoming && isOnline && isConfirmed && (
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => handleJoinCall(appointment._id)}
            >
              <Video className="h-4 w-4 mr-2" />
              Join Call
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">My Appointments</h1>
        <div className="flex flex-wrap w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search appointments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
          >
            {viewMode === "list" ? (
              <>
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar View</span>
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List View</span>
              </>
            )}
          </Button>
          <Button className="bg-[#1A75BC] hover:bg-blue-700" onClick={() => setIsRequestModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Find a Doctor & Book Appointment
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            {selectedDate && (
              <div className="p-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)} className="w-full">
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value={undefined}>All Statuses</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="in-person">In-Person</SelectItem>
            <SelectItem value={undefined}>All Types</SelectItem>
          </SelectContent>
        </Select>

        {(selectedDate || selectedStatus || selectedType || searchQuery) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedDate(undefined)
              setSelectedStatus(undefined)
              setSelectedType(undefined)
              setSearchQuery("")
            }}
            className="text-red-500 hover:text-red-700"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        {viewMode === "list" ? (
          <>
            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAppointments.map((appointment) => renderAppointmentCard(appointment))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No upcoming appointments found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || selectedDate || selectedStatus || selectedType
                      ? "Try adjusting your filters or"
                      : "You don't have any upcoming appointments."}
                  </p>
                  <Button onClick={() => setIsRequestModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAppointments.map((appointment) => renderAppointmentCard(appointment))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No pending appointment requests</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || selectedDate || selectedStatus || selectedType
                      ? "Try adjusting your filters or"
                      : "You don't have any pending appointment requests."}
                  </p>
                  <Button onClick={() => setIsRequestModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAppointments.map((appointment) => renderAppointmentCard(appointment))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-gray-600">No past appointments found</h3>
                  <p className="text-gray-500">
                    {searchQuery || selectedDate || selectedStatus || selectedType
                      ? "Try adjusting your filters"
                      : "You don't have any past appointments."}
                  </p>
                </div>
              )}
            </TabsContent>
          </>
        ) : (
          <TabsContent value={activeTab} forceMount>
            <AppointmentCalendarView appointments={filteredAppointments} onAppointmentClick={setSelectedAppointment} />
          </TabsContent>
        )}
      </Tabs>

      {/* Appointment Request Modal */}
      <AppointmentRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          // Refresh appointments after successful request
          fetchAppointments()
        }}
      />

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onReschedule={() => handleReschedule(selectedAppointment._id)}
          onCancel={() => handleCancelConfirmation(selectedAppointment)}
          onJoinCall={() => handleJoinCall(selectedAppointment._id)}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {appointmentToCancel && (
              <div className="space-y-2">
                <p>
                  <strong>Doctor:</strong> {appointmentToCancel.doctorName}
                </p>
                <p>
                  <strong>Date:</strong> {format(new Date(appointmentToCancel.date), "MMMM d, yyyy")}
                </p>
                <p>
                  <strong>Time:</strong> {appointmentToCancel.time}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Don't Cancel
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AppointmentsPage

