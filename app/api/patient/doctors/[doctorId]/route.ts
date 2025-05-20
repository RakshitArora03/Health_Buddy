import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, props: { params: Promise<{ doctorId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    const { db } = await connectToDatabase()

    const doctor = await db.collection("doctors").findOne({
      _id: new ObjectId(params.doctorId),
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization || "General Practitioner",
      profileImage: doctor.profileImage,
      qualifications: doctor.qualifications,
      experience: doctor.yearsOfExperience,
      clinicAddress: doctor.clinicAddress,
      consultationHours: doctor.consultationHours,
    })
  } catch (error) {
    console.error("Error fetching doctor details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

