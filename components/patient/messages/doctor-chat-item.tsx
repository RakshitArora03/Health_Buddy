"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PinIcon } from "lucide-react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"

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

interface DoctorChatItemProps {
  doctor: Doctor
  isSelected: boolean
  onClick: () => void
  onPin: (doctorId: string) => void
  onMarkAsRead: (doctorId: string) => void
}

export default function DoctorChatItem({ doctor, isSelected, onClick, onPin, onMarkAsRead }: DoctorChatItemProps) {
  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPin(doctor.id)
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkAsRead(doctor.id)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors",
            isSelected && "bg-blue-50 hover:bg-blue-50",
          )}
          onClick={onClick}
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.profileImage} alt={doctor.name} />
              <AvatarFallback className="bg-blue-100 text-blue-800">{initials}</AvatarFallback>
            </Avatar>
          </div>

          <div className="ml-3 flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="font-medium text-gray-900 truncate flex items-center">
                {doctor.name}
                {doctor.isPinned && <PinIcon className="h-3 w-3 ml-1 text-gray-400" />}
              </div>
              <div className="flex items-center">
                {doctor.unread > 0 ? (
                  <Badge className="h-5 mr-2 px-1.5 flex items-center justify-center rounded-full bg-blue-500">
                    {doctor.unread}
                  </Badge>
                ) : null}
                <span className="text-xs text-gray-500">{doctor.lastMessageTime}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 truncate">{doctor.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handlePin}>{doctor.isPinned ? "Unpin chat" : "Pin chat"}</ContextMenuItem>
        {doctor.unread > 0 && <ContextMenuItem onClick={handleMarkAsRead}>Mark as read</ContextMenuItem>}
      </ContextMenuContent>
    </ContextMenu>
  )
}

