"use client"

import { useState, useEffect } from "react"
import { Search, User, Clock, PinIcon, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import ChatArea from "@/components/doctor/messages/chat-area"
import PatientChatItem from "@/components/doctor/messages/patient-chat-item"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useSession } from "next-auth/react"
import StartChatModal from "@/components/doctor/messages/start-chat-modal"

interface Patient {
  id: string
  name: string
  healthBuddyID?: string
  profileImage?: string
  lastMessage?: string
  lastMessageTime?: string
  unread?: number
  isPinned?: boolean
  conversationId?: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
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

      // Transform the data to match our Patient interface
      const patientsData = data.map((conversation: any) => ({
        id: conversation.otherParticipant.id,
        name: conversation.otherParticipant.name,
        healthBuddyID: conversation.otherParticipant.healthBuddyID,
        profileImage: conversation.otherParticipant.profileImage,
        lastMessage: conversation.lastMessage || "No messages yet",
        lastMessageTime: conversation.lastMessageTime
          ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "No messages",
        unread: 0, // We'll update this with actual unread count
        isPinned: false, // We'll need to add this feature to the backend
        conversationId: conversation.id,
      }))

      setPatients(patientsData)
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

  const handlePatientSelect = (patient: Patient) => {
    // If the patient has unread messages, mark them as read
    if (patient.unread && patient.unread > 0) {
      handleMarkAsRead(patient.id)
    }

    setSelectedPatient(patient)
    if (isMobile) {
      setShowChatOnMobile(true)
    }
  }

  const handleBackToList = () => {
    setShowChatOnMobile(false)
  }

  const handlePinPatient = (patientId: string) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => (patient.id === patientId ? { ...patient, isPinned: !patient.isPinned } : patient)),
    )

    toast({
      title: "Chat updated",
      description: `Chat ${patients.find((p) => p.id === patientId)?.isPinned ? "unpinned" : "pinned"} successfully`,
    })
  }

  const handleMarkAsRead = (patientId: string) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => (patient.id === patientId ? { ...patient, unread: 0 } : patient)),
    )
  }

  const handleStartChat = async (patient: Patient) => {
    // Check if we already have a conversation with this patient
    const existingPatient = patients.find((p) => p.id === patient.id)

    if (existingPatient) {
      // If we do, just select that patient
      handlePatientSelect(existingPatient)
    } else {
      try {
        // Create a conversation first to get the conversationId
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantId: patient.id,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create conversation")
        }

        const data = await response.json()

        // Add the patient to our list with the new conversationId
        const newPatient = {
          ...patient,
          lastMessage: "No messages yet",
          lastMessageTime: "Just now",
          unread: 0,
          isPinned: false,
          conversationId: data.conversationId,
        }

        setPatients((prev) => [...prev, newPatient])
        setSelectedPatient(newPatient)

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

  // Filter patients based on search query and active tab
  const getFilteredPatients = () => {
    let filtered = patients

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply tab filter
    if (activeTab === "unread") {
      filtered = filtered.filter((patient) => patient.unread > 0)
    }

    return filtered
  }

  const filteredPatients = getFilteredPatients()
  const pinnedPatients = filteredPatients.filter((patient) => patient.isPinned)
  const regularPatients = filteredPatients.filter((patient) => !patient.isPinned)

  // Determine what to show based on mobile state
  const showSidebar = !isMobile || (isMobile && !showChatOnMobile)
  const showChat = !isMobile || (isMobile && showChatOnMobile)

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <div className={`${isMobile ? "w-full" : "w-80"} border-r bg-white flex flex-col`}>
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-[#006D5B] mb-4">Messages</h1>
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
                  placeholder="Search patients"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button
                className="w-full mt-4 bg-[#006D5B] hover:bg-[#005A4B]"
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
                {pinnedPatients.length > 0 && (
                  <div className="pt-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center">
                      <PinIcon className="h-4 w-4 mr-2" /> Pinned
                    </div>
                    {pinnedPatients.map((patient) => (
                      <PatientChatItem
                        key={patient.id}
                        patient={patient}
                        isSelected={selectedPatient?.id === patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        onPin={handlePinPatient}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-2" /> Recent
                  </div>
                  {regularPatients.length > 0 ? (
                    regularPatients.map((patient) => (
                      <PatientChatItem
                        key={patient.id}
                        patient={patient}
                        isSelected={selectedPatient?.id === patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        onPin={handlePinPatient}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      {searchQuery
                        ? "No patients match your search"
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
          {selectedPatient ? (
            <ChatArea patient={selectedPatient} onBack={isMobile ? handleBackToList : undefined} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="bg-[#006D5B] rounded-full p-6 mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h2>
              <p className="text-gray-500 max-w-md">
                Select a patient from the sidebar or start a new chat to begin messaging.
              </p>
              <Button className="mt-6 bg-[#006D5B] hover:bg-[#005A4B]" onClick={() => setIsStartChatModalOpen(true)}>
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
        onSelectPatient={handleStartChat}
      />
    </div>
  )
}

