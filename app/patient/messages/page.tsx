"use client"

import { useState, useEffect } from "react"
import { Search, User, Clock, PinIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import ChatArea from "@/components/patient/messages/chat-area"
import DoctorChatItem from "@/components/patient/messages/doctor-chat-item"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Doctor {
  id: string
  name: string
  specialization: string
  profileImage?: string
  lastMessage?: string
  lastMessageTime?: string
  unread?: number
  isPinned?: boolean
}

export default function MessagesPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  // Check if we're on mobile
  const isMobile = useMediaQuery("(max-width: 768px)")
  // State to track if we're viewing a chat on mobile
  const [showChatOnMobile, setShowChatOnMobile] = useState(false)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/patient/doctors")
        if (!response.ok) {
          throw new Error("Failed to fetch doctors")
        }
        const data = await response.json()

        // Add mock last message data for demonstration
        const doctorsWithMessages = data.map((doctor: Doctor, index: number) => ({
          ...doctor,
          lastMessage:
            index % 3 === 0
              ? "Hello, how are you feeling today?"
              : index % 3 === 1
                ? "Your test results look good."
                : "Remember to take your medication regularly.",
          lastMessageTime: index % 2 === 0 ? "10:30" : "Yesterday",
          unread: index % 4 === 0 ? 2 : 0,
          isPinned: index % 5 === 0,
        }))

        setDoctors(doctorsWithMessages)
        if (doctorsWithMessages.length > 0) {
          setSelectedDoctor(doctorsWithMessages[0])
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast({
          title: "Error",
          description: "Failed to load doctors. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [toast])

  // Reset mobile view state when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setShowChatOnMobile(false)
    }
  }, [isMobile])

  const handleDoctorSelect = (doctor: Doctor) => {
    // If the doctor has unread messages, mark them as read
    if (doctor.unread && doctor.unread > 0) {
      handleMarkAsRead(doctor.id)
    }

    setSelectedDoctor(doctor)
    if (isMobile) {
      setShowChatOnMobile(true)
    }
  }

  const handleBackToList = () => {
    setShowChatOnMobile(false)
  }

  const handlePinDoctor = (doctorId: string) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) => (doctor.id === doctorId ? { ...doctor, isPinned: !doctor.isPinned } : doctor)),
    )

    toast({
      title: "Chat updated",
      description: `Chat ${doctors.find((d) => d.id === doctorId)?.isPinned ? "unpinned" : "pinned"} successfully`,
    })
  }

  const handleMarkAsRead = (doctorId: string) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) => (doctor.id === doctorId ? { ...doctor, unread: 0 } : doctor)),
    )
  }

  // Filter doctors based on search query and active tab
  const getFilteredDoctors = () => {
    let filtered = doctors

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((doctor) => doctor.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply tab filter
    if (activeTab === "unread") {
      filtered = filtered.filter((doctor) => doctor.unread && doctor.unread > 0)
    }

    return filtered
  }

  const filteredDoctors = getFilteredDoctors()
  const pinnedDoctors = filteredDoctors.filter((doctor) => doctor.isPinned)
  const regularDoctors = filteredDoctors.filter((doctor) => !doctor.isPinned)

  // Determine what to show based on mobile state
  const showSidebar = !isMobile || (isMobile && !showChatOnMobile)
  const showChat = !isMobile || (isMobile && showChatOnMobile)

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <div className={`${isMobile ? "w-full" : "w-80"} border-r bg-white flex flex-col`}>
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600 mb-4">Messages</h1>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="all" className="flex-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">
                  Unread
                </TabsTrigger>
              </TabsList>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search doctors"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {pinnedDoctors.length > 0 && (
                  <div className="pt-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center">
                      <PinIcon className="h-4 w-4 mr-2" /> Pinned
                    </div>
                    {pinnedDoctors.map((doctor) => (
                      <DoctorChatItem
                        key={doctor.id}
                        doctor={doctor}
                        isSelected={selectedDoctor?.id === doctor.id}
                        onClick={() => handleDoctorSelect(doctor)}
                        onPin={handlePinDoctor}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-2" /> Recent
                  </div>
                  {regularDoctors.length > 0 ? (
                    regularDoctors.map((doctor) => (
                      <DoctorChatItem
                        key={doctor.id}
                        doctor={doctor}
                        isSelected={selectedDoctor?.id === doctor.id}
                        onClick={() => handleDoctorSelect(doctor)}
                        onPin={handlePinDoctor}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      {searchQuery
                        ? "No doctors match your search"
                        : activeTab === "unread"
                          ? "No unread messages"
                          : "No doctors found"}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main chat area */}
      {showChat && (
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedDoctor ? (
            <ChatArea doctor={selectedDoctor} onBack={isMobile ? handleBackToList : undefined} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="bg-blue-500 rounded-full p-6 mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h2>
              <p className="text-gray-500 max-w-md">
                Select a doctor from the sidebar to view your conversation history and send messages.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

