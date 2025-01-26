import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function DELETE(request: NextRequest, props: { params: Promise<{ patientId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate and ensure the patientId exists
    const patientId = params?.patientId;
    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find the doctor by their email
    const doctor = await db.collection("doctors").findOne({ email: session.user.email });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Delete the doctor-patient relationship from the doctorPatients collection
    const result = await db.collection("doctorPatients").deleteOne({
      doctorId: doctor._id.toString(),
      patientId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Patient not found in doctor's list" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Patient removed successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/doctor/patients/[patientId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
