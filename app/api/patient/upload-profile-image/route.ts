import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + "_" + file.name.replace(/\s/g, "_")
    const relativePath = `/uploads/${filename}`
    const absolutePath = path.join(process.cwd(), "public", relativePath)

    await writeFile(absolutePath, buffer)

    const { db } = await connectToDatabase()
    const result = await db
      .collection("patients")
      .updateOne({ email: session.user.email }, { $set: { profileImage: relativePath } })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update profile image" }, { status: 500 })
    }

    return NextResponse.json({ imageUrl: relativePath })
  } catch (error) {
    console.error("Error uploading profile image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

