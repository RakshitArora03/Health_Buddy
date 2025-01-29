import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { writeFile } from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const doctor = await db.collection("doctors").findOne({ email: session.user.email })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({
      medicalLicenseCertificate: doctor.medicalLicenseCertificate || null,
      degreeCertificate: doctor.degreeCertificate || null,
      additionalCertifications: doctor.additionalCertifications || [],
    })
  } catch (error) {
    console.error("Error fetching verification documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string

    if (!file || !documentType) {
      return NextResponse.json({ error: "File and document type are required" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + "_" + file.name.replace(/\s/g, "_")
    const relativePath = `/uploads/verification/${filename}`
    const absolutePath = path.join(process.cwd(), "public", relativePath)

    await writeFile(absolutePath, buffer)

    const { db } = await connectToDatabase()
    let updateField = {}

    if (documentType === "additionalCertifications") {
      updateField = { $push: { additionalCertifications: relativePath } }
    } else {
      updateField = { $set: { [documentType]: relativePath } }
    }

    const result = await db.collection("doctors").updateOne({ email: session.user.email }, updateField)

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
    }

    return NextResponse.json({ message: "Document uploaded successfully", path: relativePath })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentType = searchParams.get("documentType")
    const documentPath = searchParams.get("documentPath")

    if (!documentType || !documentPath) {
      return NextResponse.json({ error: "Document type and path are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    let updateField = {}

    if (documentType === "additionalCertifications") {
      updateField = { $pull: { additionalCertifications: documentPath } }
    } else {
      updateField = { $set: { [documentType]: null } }
    }

    const result = await db.collection("doctors").updateOne({ email: session.user.email }, updateField)

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
    }

    return NextResponse.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

