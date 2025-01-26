import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Patient from "@/models/Patient"

function generateUID() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString()
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const formData = await request.json()

    console.log("Received form data:", formData)

    const { email, ...healthIdData } = formData

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    console.log("Searching for user with email:", email)
    let user = await Patient.findOne({ email })

    if (!user) {
      console.log("User not found, creating new user")
      user = new Patient({ email })
    } else {
      console.log("User found:", user)
    }

    // Generate a unique 10-digit UID
    const healthBuddyUID = generateUID()

    // Update user information
    Object.assign(user, {
      ...healthIdData,
      healthBuddyUID,
      healthIdRegistered: true,
    })

    console.log("Saving user:", user)
    await user.save()

    console.log("User saved successfully")
    return NextResponse.json(
      {
        message: "Health ID registered successfully",
        userId: user._id.toString(),
        healthBuddyUID,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error registering Health ID:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

