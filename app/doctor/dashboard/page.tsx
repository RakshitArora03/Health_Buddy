"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { HomeIcon as House, Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function DoctorDashboard() {
  const { data: session } = useSession()
  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    profileImage: null,
    specialization: "",
    dateOfBirth: "",
    bloodGroup: "",
    workingHours: "",
  })
  const [calendarDates, setCalendarDates] = useState<Date[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [nextPatient, setNextPatient] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [confirmDenyOpen, setConfirmDenyOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch("/api/doctor/profile")
        if (response.ok) {
          const data = await response.json()
          setDoctorDetails(data)
        } else {
          console.error("Failed to fetch doctor details")
        }
      } catch (error) {
        console.error("Error fetching doctor details:", error)
      }
    }

    fetchDoctorDetails()
  }, [])

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        // Fetch pending appointment requests
        const pendingResponse = await fetch("/api/doctor/appointments/pending")

        // Fetch confirmed appointments
        const appointmentsResponse = await fetch("/api/doctor/appointments")

        if (pendingResponse.ok && appointmentsResponse.ok) {
          const pendingData = await pendingResponse.json()
          const appointmentsData = await appointmentsResponse.json()

          // Set pending requests
          setPendingRequests(pendingData)

          // Filter today's appointments
          const today = new Date()
          const todayString = format(today, "yyyy-MM-dd")

          const todaysAppointments = appointmentsData
            .filter((app: any) => {
              const appDate = new Date(app.date)
              return format(appDate, "yyyy-MM-dd") === todayString && app.status === "confirmed"
            })
            .sort((a: any, b: any) => {
              // Sort by time
              return a.time.localeCompare(b.time)
            })

          setTodayAppointments(todaysAppointments)

          // Find next patient (first upcoming appointment)
          const now = new Date()
          const currentTime = now.getHours() * 60 + now.getMinutes()

          const upcomingAppointments = appointmentsData
            .filter((app: any) => {
              const appDate = new Date(app.date)
              if (format(appDate, "yyyy-MM-dd") !== todayString) return false
              if (app.status !== "confirmed") return false

              // Convert appointment time to minutes
              const [hours, minutes] = app.time.split(":").map(Number)
              const appTimeInMinutes = hours * 60 + minutes

              return appTimeInMinutes > currentTime
            })
            .sort((a: any, b: any) => {
              // Sort by time
              return a.time.localeCompare(b.time)
            })

          if (upcomingAppointments.length > 0) {
            setNextPatient(upcomingAppointments[0])
          }
        } else {
          console.error("Failed to fetch appointments")
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchAppointments()
    }
  }, [session])

  useEffect(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const dates = []

    const sunday = new Date(today)
    sunday.setDate(today.getDate() - currentDay)

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + i)
      dates.push(date)
    }

    setCalendarDates(dates)
  }, [])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/doctor/appointments/${requestId}/accept`, {
        method: "POST",
      })

      if (response.ok) {
        // Remove from pending requests
        setPendingRequests(pendingRequests.filter((req) => req._id !== requestId))

        // Refresh today's appointments
        const appointmentsResponse = await fetch("/api/doctor/appointments")
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json()

          // Filter today's appointments
          const today = new Date()
          const todayString = format(today, "yyyy-MM-dd")

          const todaysAppointments = appointmentsData
            .filter((app: any) => {
              const appDate = new Date(app.date)
              return format(appDate, "yyyy-MM-dd") === todayString && app.status === "confirmed"
            })
            .sort((a: any, b: any) => {
              // Sort by time
              return a.time.localeCompare(b.time)
            })

          setTodayAppointments(todaysAppointments)
        }

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

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
  }

  const handleAccept = () => {
    if (selectedRequest) {
      handleAcceptRequest(selectedRequest._id)
      setSelectedRequest(null)
    }
  }

  const handleOpenDenyDialog = () => {
    setConfirmDenyOpen(true)
  }

  const handleDeny = () => {
    if (selectedRequest) {
      handleDenyRequest(selectedRequest._id)
      setConfirmDenyOpen(false)
      setSelectedRequest(null)
    }
  }

  const currentDate = new Date()
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const SectionHeader = ({ title, children, href }: { title: string; children?: React.ReactNode; href: string }) => (
    <div className="bg-[#006D5B] text-white p-4 rounded-lg mb-2 flex justify-between items-center">
      <Link href={href} className="text-xl font-semibold hover:underline">
        {title}
      </Link>
      {children}
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Banner */}
          <Card className="bg-[#006D5B] text-white pt-4 pr-4 pl-4 pb-0 md:pt-4  relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="z-10 mb-4 md:mb-0">
                <div className="flex items-center space-x-2 text-sm">
                  <House className="w-6 h-6 text-white" />
                  <span>
                    {currentDate.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mt-2">Good Day, Dr {session?.user?.name}!</h1>
                <p className="mt-1">Have a Nice Day!</p>
              </div>
              <div className="relative w-full md:w-1/3 h-32 md:h-40">
                <Image
                  src="/assets/images/doctor-illustration.png"
                  alt="Doctor"
                  layout="fill"
                  objectPosition="right bottom"
                />
              </div>
            </div>
          </Card>

          {/* Today's Appointments */}
          <div>
            <SectionHeader title="Today's Appointments" href="/doctor/schedule">
              {/* Add any additional header content here if needed */}
            </SectionHeader>
            <Card className="p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading appointments...</p>
                </div>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment._id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment.patientName}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{appointment.type === "online" ? "Online Consultation" : "In-Person Visit"}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Confirmed</Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="bg-[#006D5B] hover:bg-[#005c4d]">
                          View Details
                        </Button>
                        {appointment.type === "online" && (
                          <Button size="sm" variant="outline">
                            Start Call
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              )}
            </Card>
          </div>

          {/* Appointment Requests */}
          <div>
            <SectionHeader title="Appointment Requests" href="/doctor/schedule">
              {pendingRequests.length > 0 && (
                <Badge className="bg-red-500 text-white">{pendingRequests.length} New</Badge>
              )}
            </SectionHeader>
            <Card className="p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading appointment requests...</p>
                </div>
              ) : pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div key={request._id} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{request.patientName}</h3>
                          <p className="text-sm text-gray-500">{request.patientEmail}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{format(new Date(request.date), "MMMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{request.time}</span>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500">Pending</Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#006D5B] hover:bg-[#005c4d]"
                          onClick={() => handleViewDetails(request)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                          onClick={() => handleAcceptRequest(request._id)}
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
                    </div>
                  ))}
                  {pendingRequests.length > 3 && (
                    <div className="text-center mt-2">
                      <Link href="/doctor/schedule">
                        <Button variant="link" className="text-[#006D5B]">
                          View all {pendingRequests.length} requests
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending appointment requests</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column - 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Profile */}
          <div>
            <SectionHeader title="My Profile" href="/doctor/profile">
              {/* Add any additional header content here if needed */}
            </SectionHeader>
            <Card className="p-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-20 mb-4 ">
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src={doctorDetails.profileImage || "/assets/icons/profile-placeholder.png"}
                      alt="Doctor Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">Dr. {doctorDetails.name}</h3>
                    <p className="text-lg text-gray-600 mt-2">{doctorDetails.specialization || "Specialization"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full text-center text-sm">
                  <div>
                    <p className="text-gray-500">Date Of Birth</p>
                    <p className="font-medium">{doctorDetails.dateOfBirth || "--/--/--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Blood</p>
                    <p className="font-medium">{doctorDetails.bloodGroup || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Working Hours</p>
                    <p className="font-medium">{doctorDetails.workingHours || "--:-- - --:--"}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* My Calendar */}
          <div>
            <SectionHeader title="My Calendar" href="/doctor/schedule">
              <span className="text-white">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
            </SectionHeader>
            <Card className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {days.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                {/* Date cells */}
                {calendarDates.map((date, index) => (
                  <div
                    key={index}
                    className={`
                      text-center p-2 rounded-lg text-sm
                      ${date.toDateString() === new Date().toDateString() ? "bg-[#006D5B] text-white" : "bg-gray-100"}
                    `}
                  >
                    {date.getDate()}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Next Patient Details */}
          <div>
            <SectionHeader title="Next Patient Details" href="/doctor/patients">
              {/* Add any additional header content here if needed */}
            </SectionHeader>
            <Card className="p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading next patient...</p>
                </div>
              ) : nextPatient ? (
                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      {nextPatient.patientProfileImage ? (
                        <Image
                          src={nextPatient.patientProfileImage || "/placeholder.svg"}
                          alt={nextPatient.patientName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-500">{nextPatient.patientName.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{nextPatient.patientName}</h3>
                      <p className="text-sm text-gray-500">{nextPatient.patientEmail}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{format(new Date(nextPatient.date), "MMMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{nextPatient.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">
                        {nextPatient.type === "online" ? "Online Consultation" : "In-Person Visit"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className="bg-green-500 mt-1">Confirmed</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-[#006D5B] hover:bg-[#005c4d]" size="sm">
                      <Link href={`/doctor/patients/${nextPatient.patientId}`}>View Patient</Link>
                    </Button>
                    {nextPatient.type === "online" && (
                      <Button variant="outline" size="sm">
                        Start Call
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming patients scheduled</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

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
                <p className="capitalize">{selectedRequest.paymentMethod?.replace("-", " ") || "Not specified"}</p>
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
    </div>
  )
}

