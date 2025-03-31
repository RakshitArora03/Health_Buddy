import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Note from "@/models/Note"
import Patient from "@/models/Patient"
import { ObjectId } from "mongodb"

export async function PUT(request: Request, props: { params: Promise<{ noteId: string }> }) {
  try {
    const params = await props.params
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

    const { title, content, isPinned } = await request.json()
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (isPinned !== undefined) updateData.isPinned = isPinned

    // Update the note
    const note = await Note.findOneAndUpdate(
      { _id: new ObjectId(params.noteId), userId: patient._id.toString() },
      updateData,
      { new: true },
    )

    if (!note) {
      return NextResponse.json({ error: "Note not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ message: "Note updated successfully", note })
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ noteId: string }> }) {
  try {
    const params = await props.params
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

    // Delete the note
    const result = await Note.deleteOne({
      _id: new ObjectId(params.noteId),
      userId: patient._id.toString(),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Note not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

