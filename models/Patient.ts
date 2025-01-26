import mongoose from "mongoose"

const PatientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    fullName: String,
    fatherName: String,
    address: String,
    phoneNumber: String,
    gender: String,
    height: String,
    weight: String,
    bloodGroup: String,
    dateOfBirth: Date,
    profileImage: String,
    healthBuddyUID: {
      type: String,
      unique: true,
      sparse: true,
    },
    healthIdRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Patient || mongoose.model("Patient", PatientSchema)

