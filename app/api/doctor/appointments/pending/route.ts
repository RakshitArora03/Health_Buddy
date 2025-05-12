import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Doctor from "@/models/Doctor"
import Patient from "@/models/Patient"
import Appointment from "@/models/Appointment"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the doctor
    const doctor = await Doctor.findOne({ email: session.user.email })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Get pending appointment requests for this doctor
    const pendingRequests = await Appointment.find({
      doctorId: doctor._id,
      status: "pending",
    }).sort({ date: 1, time: 1 })

    // Populate patient information
    const populatedRequests = await Promise.all(
      pendingRequests.map(async (request) => {
        const patient = await Patient.findById(request.patientId)
        return {
          ...request.toObject(),
          patientName: patient ? patient.name : "Unknown Patient",
          patientEmail: patient ? patient.email : "",
        }
      }),
    )

    return NextResponse.json(populatedRequests)
  } catch (error) {
    console.error("Error fetching pending requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

