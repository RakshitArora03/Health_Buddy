import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Message from "@/models/Message"
import Conversation from "@/models/Conversation"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { conversationId, receiverId, message } = body

    if (!conversationId || !receiverId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    const senderId = session.user.id

    // Verify the conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (!conversation.participants.includes(senderId)) {
      return NextResponse.json({ error: "Unauthorized to send message in this conversation" }, { status: 403 })
    }

    // Create new message
    const newMessage = await Message.create({
      conversationId,
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
      status: "sent",
    })

    console.log("Created new message:", newMessage)

    // Update conversation with last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastMessageTime: new Date(),
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

