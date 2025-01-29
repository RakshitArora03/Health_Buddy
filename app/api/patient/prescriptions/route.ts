import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")

    const { db } = await connectToDatabase()

    // Find the patient
    const patient = await db.collection("patients").findOne({ email: session.user.email })
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Prepare the query
    const query: any = { patientId: patient._id.toString() }
    if (doctorId) {
      query.doctorId = doctorId
    }

    // Get the patient's prescriptions
    const prescriptions = await db.collection("prescriptions").find(query).sort({ createdAt: -1 }).toArray()

    const formattedPrescriptions = await Promise.all(
      prescriptions.map(async (prescription) => {
        const doctor = await db.collection("doctors").findOne({ _id: new ObjectId(prescription.doctorId) })
        return {
          id: prescription._id.toString(),
          doctorName: prescription.doctorName,
          doctorSpecialization: doctor?.specialization || "General Practitioner",
          date: prescription.createdAt,
          medicines: prescription.medicines,
          patientName: patient.name,
          patientId: patient._id.toString(),
          healthId: patient.healthBuddyUID,
          patientDetails: {
            age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined,
            gender: patient.gender,
          },
        }
      }),
    )

    return NextResponse.json(formattedPrescriptions)
  } catch (error) {
    console.error("Error fetching patient's prescriptions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateAge(dateOfBirth: string): string {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age.toString()
}

