import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ message: "Analysis ID is required" }, { status: 400 })
  }

  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("analyses").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "Analysis deleted successfully" })
    } else {
      return NextResponse.json({ message: "Analysis not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting analysis:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

