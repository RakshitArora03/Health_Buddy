"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { HomeIcon as House, User, Calendar, FileText, FileCheck, Clipboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import AddNoteModal from "@/components/patient/AddNoteModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PrescriptionPreview } from "@/components/patient/PrescriptionPreview"
import { format } from "date-fns"

interface Doctor {
  id: string
  name: string
  specialization: string
  profileImage?: string
}

interface Prescription {
  id: string
  doctorName: string
  doctorSpecialization: string
  date: string
  medicines: any[]
  type: "e-prescription"
}

interface Analysis {
  _id: string
  title: string
  image: string
  analysis: string
  createdAt: string
  isPinned: boolean
  type: "analyzed"
}

export default function PatientDashboard() {
  const { data: session } = useSession()
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    fullName: "",
    profileImage: null,
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    height: "",
    weight: "",
    phoneNumber: "",
    healthBuddyUID: "",
  })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [calendarDates, setCalendarDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true)
  const [notes, setNotes] = useState<any[]>([])
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)

  // Fetch patient details
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        if (session?.user?.email) {
          const response = await fetch(`/api/user-details?email=${session.user.email}`)
          if (response.ok) {
            const data = await response.json()
            console.log("Fetched patient details:", data)
            setPatientDetails(data)
          } else {
            console.error("Failed to fetch patient details")
          }
        }
      } catch (error) {
        console.error("Error fetching patient details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchPatientDetails()
    }
  }, [session])

  // Fetch patient's doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true)
        const response = await fetch("/api/patient/doctors")
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched doctors:", data)
          setDoctors(data)
        } else {
          console.error("Failed to fetch doctors")
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
      } finally {
        setLoadingDoctors(false)
      }
    }

    if (session?.user?.id) {
      fetchDoctors()
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

  // Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoadingPrescriptions(true)
        // Fetch e-prescriptions
        const prescriptionsResponse = await fetch("/api/patient/prescriptions")
        let prescriptionsData = []
        if (prescriptionsResponse.ok) {
          prescriptionsData = await prescriptionsResponse.json()
          // Add type to each prescription
          prescriptionsData = prescriptionsData.map((p: any) => ({ ...p, type: "e-prescription" }))
        }

        // Fetch analyzed prescriptions
        const analysesResponse = await fetch(
          `/api/get-analyses?userId=${encodeURIComponent(session?.user?.email || "")}`,
        )
        let analysesData = []
        if (analysesResponse.ok) {
          analysesData = await analysesResponse.json()
          // Add type to each analysis
          analysesData = analysesData.map((a: any) => ({ ...a, type: "analyzed" }))
        }

        setPrescriptions(prescriptionsData)
        setAnalyses(analysesData)
      } catch (error) {
        console.error("Error fetching prescriptions:", error)
      } finally {
        setLoadingPrescriptions(false)
      }
    }

    if (session?.user?.email) {
      fetchPrescriptions()
    }
  }, [session])

  const refreshNotes = async () => {
    setLoadingNotes(true)
    try {
      const response = await fetch("/api/patient/notes")
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else {
        console.error("Failed to fetch notes")
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoadingNotes(false)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      refreshNotes()
    }
  }, [session])

  const currentDate = new Date()
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Empty appointments array - will be populated with real data later
  const appointments: any[] = []

  const SectionHeader = ({ title, children, href }: { title: string; children?: React.ReactNode; href: string }) => (
    <div className="bg-[#1A75BC] text-white p-4 rounded-lg mb-2 flex justify-between items-center">
      <Link href={href} className="text-xl font-semibold hover:underline">
        {title}
      </Link>
      {children}
    </div>
  )

  const formatAnalysis = (analysis: string) => {
    const lines = analysis.split("\n")
    const formattedContent = []
    let currentSection = { title: "", content: [] as string[] }
    let inList = false

    for (const line of lines) {
      if (line.startsWith("**") && line.endsWith("**")) {
        if (currentSection.title) {
          formattedContent.push(currentSection)
          currentSection = { title: "", content: [] as string[] }
        }
        currentSection.title = line.replace(/\*\*/g, "")
      } else if (line.trim().startsWith("*")) {
        inList = true
        currentSection.content.push(line)
      } else if (line.trim() !== "") {
        if (inList && !line.trim().startsWith("*")) {
          inList = false
          currentSection.content.push("<br>")
        }
        currentSection.content.push(line)
      } else if (line.trim() === "" && inList) {
        inList = false
        currentSection.content.push("<br>")
      }
    }

    if (currentSection.title) {
      formattedContent.push(currentSection)
    }

    return formattedContent.map((section, index) => (
      <div key={index} className="mb-4">
        <h4 className="font-semibold text-lg mb-2">{section.title}</h4>
        <div className="pl-4">
          {section.content.map((line, lineIndex) => {
            if (line.trim().startsWith("*")) {
              // List item
              return (
                <li key={lineIndex} className="mb-1">
                  {line.replace("*", "").trim()}
                </li>
              )
            } else if (line.trim() === "<br>") {
              // Line break
              return <br key={lineIndex} />
            } else {
              // Regular paragraph
              return (
                <p key={lineIndex} className="mb-1">
                  {line}
                </p>
              )
            }
          })}
        </div>
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#DAF8FA] to-[#8FC4E3] p-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - 60% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Banner */}
            <Card className="bg-[#1A75BC] text-white pt-4 pr-4 pl-4 pb-0 md:pt-4 relative overflow-hidden">
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
                  <h1 className="text-2xl font-bold mt-2">
                    Good Day, {patientDetails.fullName || patientDetails.name || session?.user?.name || "Patient"}!
                  </h1>
                  <p className="mt-1">Have a Nice Day!</p>
                </div>
                <div className="relative w-full md:w-1/3 h-32 md:h-40">
                  <Image
                    src="/assets/images/patient-illustration.png"
                    alt="Patient"
                    width={200}
                    height={200}
                    objectFit="contain"
                    objectPosition="right bottom"
                  />
                </div>
              </div>
            </Card>

            {/* Doctors List Section */}
            <div>
              <SectionHeader title="My Doctors" href="/patient/doctors">
                <Link href="/patient/doctors">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-[#1A75BC] border-[#1A75BC] hover:bg-blue-200 hover:text-[#1A75BC] transition-colors"
                  >
                    View All
                  </Button>
                </Link>
              </SectionHeader>
              <Card className="p-4">
                {loadingDoctors ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading doctors...</p>
                  </div>
                ) : doctors.length > 0 ? (
                  <div className="space-y-3">
                    {doctors.map((doctor) => (
                      <div key={doctor.id} className="p-3 rounded-lg flex justify-between items-center bg-blue-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center mr-3">
                            {doctor.profileImage ? (
                              <Image
                                src={doctor.profileImage || "/placeholder.svg"}
                                alt={doctor.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#1A75BC] hover:bg-blue-200 hover:text-[#1A75BC] transition-colors"
                          onClick={() => router.push(`/patient/doctors/${doctor.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No doctors added yet</p>
                    <Button className="mt-4 bg-[#1A75BC] hover:bg-blue-700">
                      <Link href="/patient/doctors">Add Doctors</Link>
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Prescriptions Section */}
            <div>
              <SectionHeader title="Prescriptions" href="/patient/prescriptions">
                <Link href="/patient/prescriptions">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-[#1A75BC] border-[#1A75BC] hover:bg-blue-200 hover:text-[#1A75BC] transition-colors"
                  >
                    View All
                  </Button>
                </Link>
              </SectionHeader>
              <Card className="p-4">
                {loadingPrescriptions ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading prescriptions...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.length === 0 && analyses.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No prescriptions found</p>
                        <Button
                          className="mt-4 bg-[#1A75BC] hover:bg-blue-700"
                          onClick={() => router.push("/patient/prescriptions")}
                        >
                          Go to Prescriptions
                        </Button>
                      </div>
                    ) : (
                      <>
                        {[...prescriptions, ...analyses]
                          .sort((a, b) => {
                            const dateA = new Date(a.type === "e-prescription" ? a.date : a.createdAt)
                            const dateB = new Date(b.type === "e-prescription" ? b.date : b.createdAt)
                            return dateB.getTime() - dateA.getTime()
                          })
                          .slice(0, 2) // Take only the latest 2
                          .map((item, index) => (
                            <div
                              key={item.type === "e-prescription" ? item.id : item._id}
                              className="p-3 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() =>
                                item.type === "e-prescription"
                                  ? setSelectedPrescription(item)
                                  : setSelectedAnalysis(item)
                              }
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 mr-3">
                                  {item.type === "e-prescription" ? (
                                    <FileText className="text-blue-600" />
                                  ) : (
                                    <FileCheck className="text-green-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium">
                                      {item.type === "e-prescription"
                                        ? `Prescription from ${item.doctorName}`
                                        : item.title}
                                    </p>
                                    <span
                                      className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                        item.type === "e-prescription"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {item.type === "e-prescription" ? "E-Prescription" : "Analyzed"}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {item.type === "e-prescription"
                                      ? `${item.doctorSpecialization} • ${new Date(item.date).toLocaleDateString()}`
                                      : `Analyzed on ${new Date(item.createdAt).toLocaleDateString()}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        <div className="text-center mt-4">
                          <Button
                            className="bg-[#1A75BC] hover:bg-blue-700"
                            onClick={() => router.push("/patient/prescriptions")}
                          >
                            View All Prescriptions
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Notes Section */}
            <div>
              <SectionHeader title="Notes" href="/patient/notes">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#1A75BC] border-[#1A75BC] hover:bg-blue-200 hover:text-[#1A75BC] transition-colors"
                  onClick={() => setIsAddNoteModalOpen(true)}
                >
                  Add Note
                </Button>
              </SectionHeader>
              <Card className="p-4">
                {loadingNotes ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading notes...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No notes found</p>
                        <Button
                          variant="outline"
                          className="mt-4 text-[#1A75BC] border-[#1A75BC]"
                          onClick={() => setIsAddNoteModalOpen(true)}
                        >
                          Add Your First Note
                        </Button>
                      </div>
                    ) : (
                      <>
                        {notes
                          .slice(0, 2) // Take only the latest 2 notes
                          .map((note) => (
                            <div
                              key={note._id}
                              className="p-3 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => setSelectedNote(note)}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 mr-3">
                                  <Clipboard className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium">{note.title}</p>
                                    {note.isPinned && (
                                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                        Pinned
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-1">{note.content}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Added: {new Date(note.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        <div className="text-center mt-4">
                          <Button
                            variant="outline"
                            className="text-[#1A75BC] border-[#1A75BC]"
                            onClick={() => router.push("/patient/notes")}
                          >
                            View All Notes
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column - 40% */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Profile */}
            <div>
              <SectionHeader title="My Profile" href="/patient/profile">
                {/* Add any additional header content here if needed */}
              </SectionHeader>
              <Card className="p-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-20 mb-4 ">
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <Image
                        src={patientDetails.profileImage || "/assets/icons/profile-placeholder.png"}
                        alt="Patient Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">
                        {patientDetails.fullName || patientDetails.name || session?.user?.name || "Patient Name"}
                      </h3>
                      <p className="text-lg text-gray-600 mt-2">
                        {patientDetails.healthBuddyUID ? `ID: ${patientDetails.healthBuddyUID}` : "No Health ID"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 w-full text-center text-sm">
                    <div>
                      <p className="text-gray-500">Date Of Birth</p>
                      <p className="font-medium">
                        {patientDetails.dateOfBirth
                          ? new Date(patientDetails.dateOfBirth).toLocaleDateString()
                          : "--/--/--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Blood Group</p>
                      <p className="font-medium">{patientDetails.bloodGroup || "--"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-medium">{patientDetails.gender || "--"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Height</p>
                      <p className="font-medium">{patientDetails.height ? `${patientDetails.height} cm` : "--"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Weight</p>
                      <p className="font-medium">{patientDetails.weight ? `${patientDetails.weight} kg` : "--"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{patientDetails.phoneNumber || "--"}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* My Calendar */}
            <div>
              <SectionHeader title="My Calendar" href="/patient/appointments">
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
                        ${date.toDateString() === new Date().toDateString() ? "bg-[#1A75BC] text-white" : "bg-gray-100"}
                      `}
                    >
                      {date.getDate()}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <div>
              <SectionHeader title="Upcoming Appointments" href="/patient/appointments">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#1A75BC] border-[#1A75BC] hover:bg-[#1A75BC] hover:text-white transition-colors"
                >
                  Schedule
                </Button>
              </SectionHeader>
              <Card className="p-4">
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 rounded-lg flex justify-between items-center bg-blue-50 border border-blue-100"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mr-3">
                            <Calendar className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.doctorName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No appointments scheduled</p>
                    <Button className="mt-4 bg-[#1A75BC] hover:bg-blue-700">Schedule Appointment</Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onNoteAdded={refreshNotes}
      />
      {/* Prescription Preview Modal */}
      <Dialog
        open={!!selectedPrescription || !!selectedAnalysis}
        onOpenChange={() => {
          setSelectedPrescription(null)
          setSelectedAnalysis(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPrescription ? "E-Prescription" : selectedAnalysis ? "Analysis Report" : ""}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[50vh] w-full">
            {selectedPrescription && <PrescriptionPreview prescription={selectedPrescription} />}
            {selectedAnalysis && (
              <div className="prose">
                <Image
                  src={selectedAnalysis.image || "/public/assets/icons/blue-profile-placeholder.png"}
                  alt={selectedAnalysis.title}
                  width={600}
                  height={400}
                  className="w-full rounded-md"
                />
                <h2 className="text-xl font-bold mt-4">{selectedAnalysis.title}</h2>
                <p className="text-gray-500">Analyzed on {new Date(selectedAnalysis.createdAt).toLocaleDateString()}</p>
                {formatAnalysis(selectedAnalysis.analysis)}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Note Preview Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="whitespace-pre-wrap">{selectedNote?.content}</p>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Created: {selectedNote && format(new Date(selectedNote.createdAt), "PPP")}
            {selectedNote && selectedNote.updatedAt !== selectedNote.createdAt && (
              <div>Updated: {format(new Date(selectedNote.updatedAt), "PPP")}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Preview Dialog */}
      <Dialog open={!!selectedPrescription} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Prescription Details</DialogTitle>
          {selectedPrescription && <PrescriptionPreview prescription={selectedPrescription} />}
        </DialogContent>
      </Dialog>

      {/* Analysis Preview Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <ScrollArea className="h-full max-h-[90vh]">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedAnalysis?.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                  {selectedAnalysis?.image ? (
                    <Image
                      src={selectedAnalysis.image || "/assets/images/Image-Placeholder.png"}
                      alt="Prescription"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No image available</div>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg overflow-y-auto max-h-[500px]">
                  <h3 className="font-semibold text-xl mb-4">Analysis:</h3>
                  <div className="text-sm space-y-2 prose max-w-none">
                    {selectedAnalysis && formatAnalysis(selectedAnalysis.analysis)}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

