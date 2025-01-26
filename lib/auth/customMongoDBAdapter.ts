import { MongoDBAdapter } from "@auth/mongodb-adapter"
import type { Adapter } from "next-auth/adapters"
import clientPromise from "@/lib/mongodb"
import Doctor from "@/models/Doctor"
import Patient from "@/models/Patient"

export function CustomMongoDBAdapter(): Adapter {
  const baseAdapter = MongoDBAdapter(clientPromise)

  return {
    ...baseAdapter,
    createUser: async (user) => {
      const { userType, ...userData } = user
      const Model = userType === "doctor" ? Doctor : Patient
      const newUser = new Model(userData)
      await newUser.save()
      return newUser
    },
    getUser: async (id) => {
      const doctorUser = await Doctor.findById(id)
      if (doctorUser) return { ...doctorUser.toObject(), userType: "doctor" }
      const patientUser = await Patient.findById(id)
      if (patientUser) return { ...patientUser.toObject(), userType: "patient" }
      return null
    },
    getUserByEmail: async (email) => {
      const doctorUser = await Doctor.findOne({ email })
      if (doctorUser) return { ...doctorUser.toObject(), userType: "doctor" }
      const patientUser = await Patient.findOne({ email })
      if (patientUser) return { ...patientUser.toObject(), userType: "patient" }
      return null
    },
    getUserByAccount: async ({ providerAccountId, provider }) => {
      const account = await baseAdapter.getUserByAccount({ providerAccountId, provider })
      if (!account) return null
      return await baseAdapter.getUser(account.userId)
    },
    updateUser: async (user) => {
      const { userType, ...userData } = user
      const Model = userType === "doctor" ? Doctor : Patient
      const updatedUser = await Model.findByIdAndUpdate(user.id, userData, { new: true })
      return updatedUser ? { ...updatedUser.toObject(), userType } : null
    },
    deleteUser: async (userId) => {
      const doctorUser = await Doctor.findByIdAndDelete(userId)
      if (doctorUser) return { ...doctorUser.toObject(), userType: "doctor" }
      const patientUser = await Patient.findByIdAndDelete(userId)
      if (patientUser) return { ...patientUser.toObject(), userType: "patient" }
      return null
    },
  }
}

