import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Note from "@/models/Note"
import Patient from "@/models/Patient"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    // Find the patient
    const patient = await Patient.findOne({ email: session.user.email })
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Create a new note
    const note = new Note({
      userId: patient._id.toString(),
      title,
      content,
      isPinned: false,
    })

    await note.save()

    return NextResponse.json({ message: "Note created successfully", note })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    // Find the patient
    const patient = await Patient.findOne({ email: session.user.email })
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Get all notes for this patient
    const notes = await Note.find({ userId: patient._id.toString() }).sort({ isPinned: -1, createdAt: -1 }).lean()

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

