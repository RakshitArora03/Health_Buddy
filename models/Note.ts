import mongoose, { Schema, type Document } from "mongoose"

export interface INote extends Document {
  userId: string
  title: string
  content: string
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

const NoteSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema)

