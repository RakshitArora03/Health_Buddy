import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const { db } = await connectToDatabase()
    const patients = await db
      .collection("patients")
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { healthBuddyUID: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
      .limit(10)
      .toArray()

    const formattedPatients = patients.map((patient) => ({
      id: patient._id.toString(),
      name: patient.name,
      healthBuddyID: patient.healthBuddyUID || "N/A",
      profileImage: patient.profileImage || null,
    }))

    return NextResponse.json(formattedPatients)
  } catch (error) {
    console.error("Error searching patients:", error)
    return NextResponse.json({ error: "Failed to search patients" }, { status: 500 })
  }
}

