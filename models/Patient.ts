import mongoose from "mongoose"

const PatientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    healthBuddyUID: {
      type: String,
      unique: true,
      sparse: true,
    },
    healthIdRegistered: {
      type: Boolean,
      default: false,
    },
    // Additional fields
    dateOfBirth: Date,
    gender: String,
    bloodGroup: String,
    height: String,
    weight: String,
    phoneNumber: String,
    address: String,
    profileImage: String,
  },
  { timestamps: true },
)

export default mongoose.models.Patient || mongoose.model("Patient", PatientSchema)

