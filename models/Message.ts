import mongoose, { Schema, type Document } from "mongoose"

export interface IMessage extends Document {
  conversationId: string
  senderId: string
  receiverId: string
  message: string
  timestamp: Date
  status: "sent" | "delivered" | "seen"
}

const MessageSchema: Schema = new Schema({
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent",
  },
})

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)

