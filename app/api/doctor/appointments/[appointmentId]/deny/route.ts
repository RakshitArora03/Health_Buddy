import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Doctor from "@/models/Doctor"
import Appointment from "@/models/Appointment"

export async function POST(req: NextRequest, { params }: { params: { appointmentId: string } }) {
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

    // Find the appointment
    const appointment = await Appointment.findById(params.appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Verify this doctor is authorized to deny this appointment
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the appointment status to denied
    appointment.status = "cancelled"
    await appointment.save()

    return NextResponse.json({ message: "Appointment request denied successfully" })
  } catch (error) {
    console.error("Error denying appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

