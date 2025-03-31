"use client"

import { useState, useEffect } from "react"
import { Search, User, Clock, PinIcon, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import ChatArea from "@/components/patient/messages/chat-area"
import DoctorChatItem from "@/components/patient/messages/doctor-chat-item"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useSession } from "next-auth/react"
import StartChatModal from "@/components/patient/messages/start-chat-modal"

interface Doctor {
  id: string
  name: string
  specialization: string
  profileImage?: string
  lastMessage?: string
  lastMessageTime?: string
  unread?: number
  isPinned?: boolean
  conversationId?: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null)
  const [isStartChatModalOpen, setIsStartChatModalOpen] = useState(false)

  // Check if we're on mobile
  const isMobile = useMediaQuery("(max-width: 768px)")
  // State to track if we're viewing a chat on mobile
  const [showChatOnMobile, setShowChatOnMobile] = useState(false)

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations")
      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }
      const data = await response.json()

      // Transform the data to match our Doctor interface
      const doctorsData = data.map((conversation: any) => ({
        id: conversation.otherParticipant.id,
        name: conversation.otherParticipant.name,
        specialization: conversation.otherParticipant.specialization || "Doctor",
        profileImage: conversation.otherParticipant.profileImage,
        lastMessage: conversation.lastMessage || "No messages yet",
        lastMessageTime: conversation.lastMessageTime
          ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "No messages",
        unread: 0, // We'll update this with actual unread count
        isPinned: false, // We'll need to add this feature to the backend
        conversationId: conversation.id,
      }))

      setDoctors(doctorsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again later.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (session?.user?.id) {
      console.log("Setting up conversation polling")
      fetchConversations()

      // Set up polling with a longer interval and debounce
      interval = setInterval(() => {
        // Only fetch if the component is mounted and visible
        if (document.visibilityState === "visible") {
          fetchConversations()
        }
      }, 10000) // Poll every 10 seconds instead of 5

      // Add event listener for visibility change
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          fetchConversations() // Fetch immediately when tab becomes visible
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)

      return () => {
        console.log("Cleaning up conversation polling")
        if (interval) clearInterval(interval)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }

    return () => {
      console.log("Cleaning up when session is not available")
      if (interval) clearInterval(interval)
    }
  }, [session?.user?.id])

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

  const handleStartChat = async (doctor: Doctor) => {
    // Check if we already have a conversation with this doctor
    const existingDoctor = doctors.find((d) => d.id === doctor.id)

    if (existingDoctor) {
      // If we do, just select that doctor
      handleDoctorSelect(existingDoctor)
    } else {
      try {
        // Create a conversation first to get the conversationId
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantId: doctor.id,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create conversation")
        }

        const data = await response.json()

        // Add the doctor to our list with the new conversationId
        const newDoctor = {
          ...doctor,
          lastMessage: "No messages yet",
          lastMessageTime: "Just now",
          unread: 0,
          isPinned: false,
          conversationId: data.conversationId,
        }

        setDoctors((prev) => [...prev, newDoctor])
        setSelectedDoctor(newDoctor)

        if (isMobile) {
          setShowChatOnMobile(true)
        }
      } catch (error) {
        console.error("Error creating conversation:", error)
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive",
        })
      }
    }

    setIsStartChatModalOpen(false)
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
      filtered = filtered.filter((doctor) => doctor.unread > 0)
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

              <Button
                className="w-full mt-4 bg-[#1A75BC] hover:bg-blue-700"
                onClick={() => setIsStartChatModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
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
                          : "No conversations yet. Start a new chat!"}
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
                Select a doctor from the sidebar or start a new chat to begin messaging.
              </p>
              <Button className="mt-6 bg-[#1A75BC] hover:bg-blue-700" onClick={() => setIsStartChatModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Start Chat Modal */}
      <StartChatModal
        isOpen={isStartChatModalOpen}
        onClose={() => setIsStartChatModalOpen(false)}
        onSelectDoctor={handleStartChat}
      />
    </div>
  )
}

