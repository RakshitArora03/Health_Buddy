import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Patient from "@/models/Patient"
import Appointment from "@/models/Appointment"

export async function GET(req: NextRequest, { params }: { params: { appointmentId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the appointment
    const appointment = await Appointment.findById(params.appointmentId)
      .populate("doctorId", "name specialty profileImage")
      .populate("patientId", "name email")

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check if the user is authorized to view this appointment
    const patient = await Patient.findOne({ email: session.user.email })

    if (!patient || appointment.patientId._id.toString() !== patient._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { appointmentId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    await dbConnect()

    // Find the appointment
    const appointment = await Appointment.findById(params.appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check if the user is authorized to update this appointment
    const patient = await Patient.findOne({ email: session.user.email })

    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the appointment
    if (data.status) {
      appointment.status = data.status
    }

    if (data.date) {
      appointment.date = data.date
    }

    if (data.time) {
      appointment.time = data.time
    }

    if (data.notes) {
      appointment.notes = data.notes
    }

    await appointment.save()

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment,
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { appointmentId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the appointment
    const appointment = await Appointment.findById(params.appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check if the user is authorized to delete this appointment
    const patient = await Patient.findOne({ email: session.user.email })

    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(params.appointmentId)

    return NextResponse.json({
      message: "Appointment cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

