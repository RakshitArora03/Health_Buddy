"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PinIcon } from "lucide-react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"

interface Patient {
  id: string
  name: string
  healthBuddyID?: string
  profileImage?: string
  lastMessage?: string
  lastMessageTime?: string
  unread?: number
  isPinned?: boolean
}

interface PatientChatItemProps {
  patient: Patient
  isSelected: boolean
  onClick: () => void
  onPin: (patientId: string) => void
  onMarkAsRead: (patientId: string) => void
}

export default function PatientChatItem({ patient, isSelected, onClick, onPin, onMarkAsRead }: PatientChatItemProps) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPin(patient.id)
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkAsRead(patient.id)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors",
            isSelected && "bg-[#E6F2F0] hover:bg-[#E6F2F0]",
          )}
          onClick={onClick}
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.profileImage} alt={patient.name} />
              <AvatarFallback className="bg-[#006D5B] text-white">{initials}</AvatarFallback>
            </Avatar>
          </div>

          <div className="ml-3 flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="font-medium text-gray-900 truncate flex items-center">
                {patient.name}
                {patient.isPinned && <PinIcon className="h-3 w-3 ml-1 text-gray-400" />}
              </div>
              <div className="flex items-center">
                {patient.unread > 0 ? (
                  <Badge className="h-5 mr-2 px-1.5 flex items-center justify-center rounded-full bg-[#006D5B]">
                    {patient.unread}
                  </Badge>
                ) : null}
                <span className="text-xs text-gray-500">{patient.lastMessageTime}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 truncate">{patient.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handlePin}>{patient.isPinned ? "Unpin chat" : "Pin chat"}</ContextMenuItem>
        {patient.unread > 0 && <ContextMenuItem onClick={handleMarkAsRead}>Mark as read</ContextMenuItem>}
      </ContextMenuContent>
    </ContextMenu>
  )
}

