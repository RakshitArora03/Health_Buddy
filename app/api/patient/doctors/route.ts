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

    const { db } = await connectToDatabase()

    // Find the patient
    const patient = await db.collection("patients").findOne({ email: session.user.email })
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Get the patient's doctors
    const patientDoctors = await db
      .collection("doctorPatients")
      .find({
        patientId: patient._id.toString(),
      })
      .toArray()

    // Get all doctor details
    const doctorIds = patientDoctors.map((dp) => new ObjectId(dp.doctorId))
    const doctors = await db
      .collection("doctors")
      .find({
        _id: { $in: doctorIds },
      })
      .toArray()

    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization || "General Practitioner",
      profileImage: doctor.profileImage,
    }))

    return NextResponse.json(formattedDoctors)
  } catch (error) {
    console.error("Error fetching patient's doctors:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { doctorId } = await request.json()
    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find the patient
    const patient = await db.collection("patients").findOne({ email: session.user.email })
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Check if relationship already exists
    const existingRelation = await db.collection("doctorPatients").findOne({
      doctorId: doctorId,
      patientId: patient._id.toString(),
    })

    if (existingRelation) {
      return NextResponse.json({ message: "Doctor already in your list", alreadyAdded: true })
    }

    // Create a conversation between patient and doctor
    await db.collection("conversations").insertOne({
      participants: [patient._id.toString(), doctorId],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create the doctor-patient relationship
    await db.collection("doctorPatients").insertOne({
      doctorId: doctorId,
      patientId: patient._id.toString(),
      createdAt: new Date(),
    })

    // Fetch the complete doctor data
    const doctor = await db.collection("doctors").findOne({ _id: new ObjectId(doctorId) })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    const formattedDoctor = {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization || "General Practitioner",
      profileImage: doctor.profileImage,
    }

    return NextResponse.json({ message: "Doctor added successfully", doctor: formattedDoctor })
  } catch (error) {
    console.error("Error adding doctor to patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

