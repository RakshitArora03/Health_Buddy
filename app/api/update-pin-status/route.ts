import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: Request) {
  try {
    const { id, isPinned } = await request.json()

    if (!id || typeof isPinned !== "boolean") {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db
      .collection("analyses")
      .updateOne({ _id: new ObjectId(id) }, { $set: { isPinned: isPinned } })

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: "Pin status updated successfully" })
    } else {
      return NextResponse.json({ message: "Analysis not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating pin status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

