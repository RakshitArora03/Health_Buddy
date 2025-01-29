import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import Patient from "@/models/Patient"
import Doctor from "@/models/Doctor"

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { name, email, password, userType } = await req.json()

    if (!name || !email || !password || !userType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Select the appropriate model based on userType
    const Model = userType === "doctor" ? Doctor : Patient

    const existingUser = await Model.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new Model({
      name,
      email,
      password: hashedPassword,
      // Add specific fields based on user type
      ...(userType === "doctor" ? { specialization: "", licenseNumber: "" } : { healthIdRegistered: false }),
    })

    await newUser.save()

    return NextResponse.json(
      {
        message: "User created successfully",
        userType,
        userId: newUser._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

