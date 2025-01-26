import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { title, image, analysis, userId } = await request.json()

    if (!title || !analysis || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await db.collection("analyses").insertOne({
      title,
      image,
      analysis,
      userId,
      createdAt: new Date(),
      isPinned: false,
    })

    if (result.insertedId) {
      return NextResponse.json({ message: "Analysis saved successfully" }, { status: 201 })
    } else {
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error saving analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

