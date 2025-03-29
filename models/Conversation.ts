import mongoose, { Schema, type Document } from "mongoose"

export interface IConversation extends Document {
  participants: string[]
  lastMessage?: string
  lastMessageTime?: Date
  updatedAt: Date
  createdAt: Date
}

const ConversationSchema: Schema = new Schema(
  {
    participants: {
      type: [String],
      required: true,
    },
    lastMessage: {
      type: String,
    },
    lastMessageTime: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Create a compound index on participants to efficiently find conversations
ConversationSchema.index({ participants: 1 })

export default mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema)

