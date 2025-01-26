import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  userType: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true,
  },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)

