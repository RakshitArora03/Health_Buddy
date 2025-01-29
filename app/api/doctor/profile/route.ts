import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const doctor = await db.collection("doctors").findOne({ email: session.user.email })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({
      name: doctor.name || "",
      email: doctor.email || "",
      profileImage: doctor.profileImage || null,
      specialization: doctor.specialization || "",
      dateOfBirth: doctor.dateOfBirth || "",
      bloodGroup: doctor.bloodGroup || "",
      workingHours: doctor.workingHours || "",
    })
  } catch (error) {
    console.error("Error fetching doctor profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const updatedInfo = await request.json()

    const result = await db.collection("doctors").updateOne(
      { email: session.user.email },
      {
        $set: {
          name: updatedInfo.name,
          specialization: updatedInfo.specialization,
          gender: updatedInfo.gender,
          dateOfBirth: updatedInfo.dateOfBirth,
          contactNumber: updatedInfo.contactNumber,
          bloodGroup: updatedInfo.bloodGroup,
          workingHours: updatedInfo.workingHours,
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating doctor profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

