import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Message from "@/models/Message"
import Conversation from "@/models/Conversation"

export async function GET(req: NextRequest, props: { params: Promise<{ conversationId: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await props.params
    const conversationId = params.conversationId

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    await dbConnect()

    const userId = session.user.id

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (!conversation.participants.includes(userId)) {
      console.log("User not in conversation. User:", userId, "Participants:", conversation.participants)
      return NextResponse.json({ error: "Unauthorized access to conversation" }, { status: 403 })
    }

    // Get messages for this conversation
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 })

    console.log(`Found ${messages.length} messages for conversation ${conversationId}`)

    // Mark messages as seen if user is the receiver
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        status: { $ne: "seen" },
      },
      {
        $set: { status: "seen" },
      },
    )

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

