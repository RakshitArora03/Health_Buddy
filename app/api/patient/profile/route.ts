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
    const patient = await db.collection("patients").findOne({ email: session.user.email })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({
      fullName: patient.name || patient.fullName || "",
      email: patient.email || "",
      profileImage: patient.profileImage || null,
      phoneNumber: patient.phoneNumber || "",
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      height: patient.height || "",
      weight: patient.weight || "",
      address: patient.address || "",
      fatherName: patient.fatherName || "",
      healthBuddyUID: patient.healthBuddyUID || "",
      healthIdRegistered: patient.healthIdRegistered || false,
    })
  } catch (error) {
    console.error("Error fetching patient profile:", error)
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

    const result = await db.collection("patients").updateOne(
      { email: session.user.email },
      {
        $set: {
          name: updatedInfo.fullName,
          fullName: updatedInfo.fullName,
          gender: updatedInfo.gender,
          dateOfBirth: updatedInfo.dateOfBirth,
          phoneNumber: updatedInfo.phoneNumber,
          bloodGroup: updatedInfo.bloodGroup,
          height: updatedInfo.height,
          weight: updatedInfo.weight,
          address: updatedInfo.address,
          fatherName: updatedInfo.fatherName,
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating patient profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

