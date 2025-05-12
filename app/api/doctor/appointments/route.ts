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

    // Get confirmed appointments for this doctor
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      status: { $ne: "pending" }, // Exclude pending appointments
    }).sort({ date: 1, time: 1 })

    // Populate patient information
    const populatedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await Patient.findById(appointment.patientId)
        return {
          ...appointment.toObject(),
          patientName: patient ? patient.name : "Unknown Patient",
          patientEmail: patient ? patient.email : "",
        }
      }),
    )

    return NextResponse.json(populatedAppointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

