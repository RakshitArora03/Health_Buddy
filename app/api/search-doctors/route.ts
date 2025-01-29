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
    const doctors = await db
      .collection("doctors")
      .find({
        $or: [{ name: { $regex: query, $options: "i" } }, { specialization: { $regex: query, $options: "i" } }],
      })
      .limit(10)
      .toArray()

    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor._id.toString(),
      name: doctor.name || "Unknown",
      specialization: doctor.specialization || "General Practitioner",
      profileImage: doctor.profileImage || null,
    }))

    return NextResponse.json(formattedDoctors)
  } catch (error) {
    console.error("Error searching doctors:", error)
    return NextResponse.json({ error: "Failed to search doctors" }, { status: 500 })
  }
}

