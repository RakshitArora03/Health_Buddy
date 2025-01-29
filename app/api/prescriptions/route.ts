import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const prescriptionData = await request.json()

    // Get doctor's details
    const doctor = await db.collection("doctors").findOne({ email: session.user.email })
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    const prescription = {
      ...prescriptionData,
      patientId: prescriptionData.patientId,
      healthId: prescriptionData.healthId,
      doctorId: doctor._id.toString(),
      doctorName: doctor.name,
      doctorQualification: doctor.qualifications || "",
      clinicAddress: doctor.clinicAddress || "",
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection("prescriptions").insertOne(prescription)

    return NextResponse.json({
      message: "Prescription saved successfully",
      prescriptionId: result.insertedId,
    })
  } catch (error) {
    console.error("Error saving prescription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const prescriptions = await db
      .collection("prescriptions")
      .find({ patientId: patientId })
      .sort({ createdAt: -1 })
      .toArray()

    console.log("Fetched prescriptions for patientId:", patientId, "Count:", prescriptions.length)

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

