"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react"
import { format } from "date-fns"

interface Doctor {
  id: string
  name: string
  specialization: string
  profileImage?: string
}

interface Message {
  id: string
  content: string
  sender: "doctor" | "patient"
  timestamp: Date
  status?: "sent" | "delivered" | "read"
}

interface ChatAreaProps {
  doctor: Doctor
  onBack?: () => void
}

export default function ChatArea({ doctor, onBack }: ChatAreaProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages for demonstration
  useEffect(() => {
    // Generate some mock messages when doctor changes
    const mockMessages: Message[] = [
      {
        id: "1",
        content: `Hello, how are you feeling today?`,
        sender: "doctor",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: "2",
        content: "I'm feeling much better, thank you for asking.",
        sender: "patient",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
        status: "read",
      },
      {
        id: "3",
        content: "Have you been taking your medication regularly?",
        sender: "doctor",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
      },
      {
        id: "4",
        content: "Yes, I've been following the prescription exactly as you recommended.",
        sender: "patient",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21), // 21 hours ago
        status: "read",
      },
      {
        id: "5",
        content: "That's great to hear. Keep it up and let me know if you experience any side effects.",
        sender: "doctor",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
    ]

    setMessages(mockMessages)
  }, [doctor.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (message.trim() === "") return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "patient",
      timestamp: new Date(),
      status: "sent",
    }

    setMessages([...messages, newMessage])
    setMessage("")
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
      const dateStr = formatMessageDate(message.timestamp)
      const existingGroup = groups.find((group) => group.date === dateStr)

      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({ date: dateStr, messages: [message] })
      }
    })

    return groups
  }

  const initials = doctor.name
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
            <AvatarImage src={doctor.profileImage} alt={doctor.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800">{initials}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h2 className="font-medium text-gray-900">{doctor.name}</h2>
            <p className="text-xs text-gray-500">{doctor.specialization || "Doctor"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-blue-600">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-blue-600">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {groupMessagesByDate().map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">{group.date}</span>
            </div>

            {group.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-end space-x-2 max-w-[70%]">
                  {msg.sender === "doctor" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-800">{initials}</AvatarFallback>
                    </Avatar>
                  )}

                  <div>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.sender === "patient"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{formatMessageTime(msg.timestamp)}</span>
                      {msg.sender === "patient" && msg.status && (
                        <span className="ml-2">{msg.status === "read" ? "Read" : msg.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
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
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}

