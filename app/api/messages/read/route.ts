import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Message from "@/models/Message"

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    await dbConnect()

    const userId = session.user.id

    // Mark messages as seen if user is the receiver
    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        status: { $ne: "seen" },
      },
      {
        $set: { status: "seen" },
      },
    )

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
}

