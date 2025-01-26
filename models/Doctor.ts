import mongoose from 'mongoose'

const DoctorSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  specialization: String,
  licenseNumber: String,
}, { timestamps: true })

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema)

