import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, props: { params: Promise<{ patientId: string }> }) {
  const params = await props.params;
  try {
    const { db } = await connectToDatabase()

    const patient = await db.collection("patients").findOne({
      _id: new ObjectId(params.patientId),
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: patient._id.toString(),
      name: patient.name || patient.fullName,
      healthBuddyID: patient.healthBuddyUID,
      profileImage: patient.profileImage,
      latestDiagnosis: patient.latestDiagnosis,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      height: patient.height,
      weight: patient.weight,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
    })
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

