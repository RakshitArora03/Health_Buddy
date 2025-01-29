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
      medicalLicenseNumber: doctor.medicalLicenseNumber || "",
      yearsOfExperience: doctor.yearsOfExperience || "",
      qualifications: doctor.qualifications || "",
      affiliatedHospitals: doctor.affiliatedHospitals || "",
    })
  } catch (error) {
    console.error("Error fetching doctor professional info:", error)
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
          medicalLicenseNumber: updatedInfo.medicalLicenseNumber,
          yearsOfExperience: updatedInfo.yearsOfExperience,
          qualifications: updatedInfo.qualifications,
          affiliatedHospitals: updatedInfo.affiliatedHospitals,
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 })
    }

    return NextResponse.json({ message: "Professional info updated successfully" })
  } catch (error) {
    console.error("Error updating doctor professional info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

