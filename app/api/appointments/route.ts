import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Patient from "@/models/Patient"
import Doctor from "@/models/Doctor"
import Appointment from "@/models/Appointment"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the patient
    const patient = await Patient.findOne({ email: session.user.email })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Get appointments for this patient
    const appointments = await Appointment.find({ patientId: patient._id }).sort({ date: 1, time: 1 })

    // Populate doctor information
    const populatedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const doctor = await Doctor.findById(appointment.doctorId)
        return {
          ...appointment.toObject(),
          doctorName: doctor ? doctor.name : "Unknown Doctor",
          doctorSpecialty: doctor ? doctor.specialty || "" : "",
          doctorProfileImage: doctor ? doctor.profileImage || "/placeholder.svg" : "/placeholder.svg",
          location: doctor ? doctor.address || "Medical Center" : "Medical Center",
        }
      }),
    )

    return NextResponse.json(populatedAppointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    await dbConnect()

    // Find the patient
    const patient = await Patient.findOne({ email: session.user.email })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Verify the doctor exists
    const doctor = await Doctor.findById(data.doctorId)

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Create a new appointment
    const newAppointment = new Appointment({
      patientId: patient._id,
      doctorId: data.doctorId,
      date: data.date,
      time: data.time,
      status: "pending",
      type: data.consultationType,
      reason: data.reason,
      notes: data.notes || "",
      paymentMethod: data.paymentMethod,
    })

    await newAppointment.save()

    // Return the new appointment with doctor info
    const appointmentWithDoctor = {
      ...newAppointment.toObject(),
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty || "",
      doctorProfileImage: doctor.profileImage || "/placeholder.svg",
      location: doctor.address || "Medical Center",
    }

    return NextResponse.json({
      message: "Appointment requested successfully",
      appointment: appointmentWithDoctor,
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

