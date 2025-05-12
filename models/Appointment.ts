import mongoose from "mongoose"

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["online", "in-person"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    documents: [
      {
        type: String,
      },
    ],
    medicalNotes: {
      type: String,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    followUpDate: {
      type: Date,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema)

