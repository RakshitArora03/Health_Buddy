import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Fetch the analyzed prescriptions using email instead of _id
    const analyses = await db
      .collection("analyses")
      .find({ userId: session.user.email }) // Corrected: Query using email
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(analyses)
  } catch (error) {
    console.error("Error fetching analyzed prescriptions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
