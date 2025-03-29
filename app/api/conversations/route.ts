import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Conversation from "@/models/Conversation"
import Doctor from "@/models/Doctor"
import Patient from "@/models/Patient"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the current user based on email and user type
    const userType = session.user.userType || "patient"
    let currentUser

    if (userType === "doctor") {
      currentUser = await Doctor.findOne({ email: session.user.email })
    } else {
      currentUser = await Patient.findOne({ email: session.user.email })
    }

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = currentUser._id.toString()

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    }).sort({ updatedAt: -1 })

    // Get the other participant details for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipantId = conversation.participants.find((id) => id !== userId)

        let otherParticipant
        if (userType === "doctor") {
          otherParticipant = await Patient.findById(otherParticipantId).select("name profileImage healthBuddyUID")
        } else {
          otherParticipant = await Doctor.findById(otherParticipantId).select("name profileImage specialization")
        }

        if (!otherParticipant) {
          return null
        }

        return {
          id: conversation._id,
          otherParticipant: {
            id: otherParticipant._id,
            name: otherParticipant.name,
            profileImage: otherParticipant.profileImage,
            healthBuddyID: otherParticipant.healthBuddyUID,
            specialization: otherParticipant.specialization,
          },
          lastMessage: conversation.lastMessage,
          lastMessageTime: conversation.lastMessageTime,
          updatedAt: conversation.updatedAt,
        }
      }),
    )

    // Filter out null values (conversations with deleted participants)
    const validConversations = conversationsWithDetails.filter((conv) => conv !== null)

    return NextResponse.json(validConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { participantId } = body

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Find the current user
    const userType = session.user.userType || "patient"
    let currentUser

    if (userType === "doctor") {
      currentUser = await Doctor.findOne({ email: session.user.email })
    } else {
      currentUser = await Patient.findOne({ email: session.user.email })
    }

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = currentUser._id.toString()

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    })

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [userId, participantId],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log("Created new conversation:", conversation._id, "between", userId, "and", participantId)
    } else {
      console.log("Found existing conversation:", conversation._id, "between", userId, "and", participantId)
    }

    return NextResponse.json({ conversationId: conversation._id })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}

