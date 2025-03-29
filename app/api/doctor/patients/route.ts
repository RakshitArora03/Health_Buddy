import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { patientId } = await request.json()
    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find the doctor
    const doctor = await db.collection("doctors").findOne({ email: session.user.email })
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Check if relationship already exists
    const existingRelation = await db.collection("doctorPatients").findOne({
      doctorId: doctor._id.toString(),
      patientId: patientId,
    })

    if (existingRelation) {
      return NextResponse.json({ message: "Patient already in your list", alreadyAdded: true })
    }

    // Create a conversation between doctor and patient
    if (!existingRelation) {
      // Create a conversation between doctor and patient
      await db.collection("conversations").insertOne({
        participants: [doctor._id.toString(), patientId],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Create the doctor-patient relationship
    await db.collection("doctorPatients").insertOne({
      doctorId: doctor._id.toString(),
      patientId: patientId,
      createdAt: new Date(),
    })

    // Fetch the complete patient data
    const patient = await db.collection("patients").findOne({ _id: new ObjectId(patientId) })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const formattedPatient = {
      id: patient._id.toString(),
      name: patient.name || patient.fullName,
      healthBuddyID: patient.healthBuddyUID,
      profileImage: patient.profileImage,
    }

    return NextResponse.json({ message: "Patient added successfully", patient: formattedPatient })
  } catch (error) {
    console.error("Error adding patient to doctor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Find the doctor
    const doctor = await db.collection("doctors").findOne({ email: session.user.email })
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Get the doctor's patients
    const doctorPatients = await db
      .collection("doctorPatients")
      .find({
        doctorId: doctor._id.toString(),
      })
      .toArray()

    // Get all patient details
    const patientIds = doctorPatients.map((dp) => dp.patientId) // Use string IDs
    const patients = await db
      .collection("patients")
      .find({
        _id: { $in: patientIds.map((id) => new ObjectId(id)) },
      })
      .toArray()

    const formattedPatients = patients.map((patient) => ({
      id: patient._id.toString(),
      name: patient.name || patient.fullName,
      healthBuddyID: patient.healthBuddyUID,
      profileImage: patient.profileImage,
    }))

    return NextResponse.json(formattedPatients)
  } catch (error) {
    console.error("Error fetching doctor's patients:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

