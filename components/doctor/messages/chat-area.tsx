"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft, Check, CheckCheck } from "lucide-react"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { generateId } from "@/lib/utils"

interface Patient {
  id: string
  name: string
  healthBuddyID?: string
  profileImage?: string
}

interface Message {
  _id?: string
  id?: string
  conversationId: string
  senderId: string
  receiverId: string
  message: string
  timestamp: Date
  status?: "sent" | "delivered" | "seen"
}

interface ChatAreaProps {
  patient: Patient
  onBack?: () => void
}

export default function ChatArea({ patient, onBack }: ChatAreaProps) {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null)

  // Fetch or create conversation
  useEffect(() => {
    const getOrCreateConversation = async () => {
      try {
        setLoading(true)
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
          throw new Error("Failed to get conversation")
        }

        const data = await response.json()
        setConversationId(data.conversationId)
      } catch (error) {
        console.error("Error getting conversation:", error)
        toast({
          title: "Error",
          description: "Failed to load conversation. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    if (patient.id && session?.user?.id) {
      getOrCreateConversation()
    }

    return () => {
      if (polling) clearInterval(polling)
    }
  }, [patient.id, session?.user?.id, toast, polling])

  // Fetch messages when conversation is available
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let visibilityHandler: ((event: Event) => void) | null = null

    const fetchMessages = async () => {
      if (!conversationId) return

      try {
        const response = await fetch(`/api/messages/${conversationId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Fetched messages:", data.length)
        setMessages(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    if (conversationId) {
      console.log("Fetching messages for conversation:", conversationId)
      fetchMessages()

      // Set up polling with a better strategy
      interval = setInterval(() => {
        // Only fetch if the component is mounted and visible
        if (document.visibilityState === "visible") {
          fetchMessages()
        }
      }, 5000) // Poll every 5 seconds

      // Add event listener for visibility change
      visibilityHandler = () => {
        if (document.visibilityState === "visible") {
          fetchMessages() // Fetch immediately when tab becomes visible
        }
      }

      document.addEventListener("visibilitychange", visibilityHandler)

      return () => {
        console.log("Cleaning up message polling")
        if (interval) clearInterval(interval)
        if (visibilityHandler) {
          document.removeEventListener("visibilitychange", visibilityHandler)
        }
      }
    }

    return () => {
      console.log("Cleaning up when conversationId is not available")
      if (interval) clearInterval(interval)
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler)
      }
    }
  }, [conversationId, toast])

  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!conversationId) return

      try {
        await fetch("/api/messages/read", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
          }),
        })

        // Update local message status
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.receiverId === session?.user?.id && msg.status !== "seen" ? { ...msg, status: "seen" } : msg,
          ),
        )
      } catch (error) {
        console.error("Error marking messages as read:", error)
      }
    }

    if (conversationId && session?.user?.id) {
      // Only mark as read if there are unread messages
      const hasUnreadMessages = messages.some((msg) => msg.receiverId === session.user.id && msg.status !== "seen")

      if (hasUnreadMessages) {
        markMessagesAsRead()
      }
    }
  }, [conversationId, session?.user?.id]) // Remove messages from dependencies

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (message.trim() === "" || !conversationId) return

    const messageId = generateId()
    const newMessage: Message = {
      id: messageId,
      conversationId,
      senderId: session?.user?.id || "",
      receiverId: patient.id,
      message: message.trim(),
      timestamp: new Date(),
      status: "sent",
    }

    // Optimistically add message to UI
    setMessages((prev) => [...prev, newMessage])
    setMessage("")

    try {
      // Send message to server
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          receiverId: patient.id,
          message: newMessage.message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return format(date, "MMMM d, yyyy")
    }
  }

  const formatMessageTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = []

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp)
      const dateStr = formatMessageDate(messageDate)
      const existingGroup = groups.find((group) => group.date === dateStr)

      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({ date: dateStr, messages: [message] })
      }
    })

    return groups
  }

  const renderMessageStatus = (status: string | undefined) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <Check className="h-3 w-3 text-gray-400" />
      case "seen":
        return <CheckCheck className="h-3 w-3 text-[#006D5B]" />
      default:
        return null
    }
  }

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <>
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={patient.profileImage} alt={patient.name} />
            <AvatarFallback className="bg-[#006D5B] text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h2 className="font-medium text-gray-900">{patient.name}</h2>
            <p className="text-xs text-gray-500">
              {patient.healthBuddyID ? `ID: ${patient.healthBuddyID}` : "Patient"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">Send a message to start the conversation</p>
          </div>
        ) : (
          groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">{group.date}</span>
              </div>

              {group.messages.map((msg) => (
                <div
                  key={msg._id || msg.id}
                  className={`flex ${msg.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end space-x-2 max-w-[70%]">
                    {msg.senderId !== session?.user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={patient.profileImage} alt={patient.name} />
                        <AvatarFallback className="bg-[#006D5B] text-white">{initials}</AvatarFallback>
                      </Avatar>
                    )}

                    <div>
                      <div
                        className={`p-3 rounded-lg ${
                          msg.senderId === session?.user?.id
                            ? "bg-[#006D5B] text-white rounded-br-none"
                            : "bg-white border rounded-bl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span>{formatMessageTime(new Date(msg.timestamp))}</span>
                        {msg.senderId === session?.user?.id && (
                          <span className="ml-2 flex items-center">{renderMessageStatus(msg.status)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={message.trim() === ""}
            className="bg-[#006D5B] hover:bg-[#005A4B]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}

