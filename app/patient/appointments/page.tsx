"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showBookDialog, setShowBookDialog] = useState(false)

  // Placeholder data for upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "April 15, 2025",
      time: "10:30 AM",
      location: "City Medical Center, Room 305",
      status: "confirmed",
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialty: "Dermatologist",
      date: "April 22, 2025",
      time: "2:15 PM",
      location: "Westside Health Clinic",
      status: "pending",
    },
  ]

  // Placeholder data for past appointments
  const pastAppointments = [
    {
      id: 3,
      doctorName: "Dr. Emily Rodriguez",
      specialty: "General Physician",
      date: "March 10, 2025",
      time: "9:00 AM",
      location: "Downtown Medical Plaza",
      status: "completed",
    },
    {
      id: 4,
      doctorName: "Dr. James Wilson",
      specialty: "Neurologist",
      date: "February 28, 2025",
      time: "11:45 AM",
      location: "Neurology Center",
      status: "completed",
    },
    {
      id: 5,
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "January 15, 2025",
      time: "3:30 PM",
      location: "City Medical Center, Room 305",
      status: "cancelled",
    },
  ]

  // Filter appointments based on search query
  const filteredUpcoming = upcomingAppointments.filter(
    (app) =>
      app.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPast = pastAppointments.filter(
    (app) =>
      app.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  // Function to render appointment card
  const renderAppointmentCard = (appointment: any) => (
    <Card key={appointment.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{appointment.doctorName}</CardTitle>
            <CardDescription>{appointment.specialty}</CardDescription>
          </div>
          {renderStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mb-2">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center mb-2">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <span>{appointment.time}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          <span>{appointment.location}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">My Appointments</h1>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search appointments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowBookDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {filteredUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUpcoming.map(renderAppointmentCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-600 mb-2">No upcoming appointments found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? "Try a different search term or" : "You don't have any upcoming appointments."}
              </p>
              <Button onClick={() => setShowBookDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {filteredPast.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPast.map(renderAppointmentCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-600">No past appointments found</h3>
              <p className="text-gray-500">
                {searchQuery ? "Try a different search term" : "You don't have any past appointments."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Book Appointment Dialog (Placeholder) */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>Fill in the details below to schedule an appointment with a doctor.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-center text-gray-500 italic">
              This is a placeholder. Appointment booking functionality will be implemented in a future update.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowBookDialog(false)}>Book Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

