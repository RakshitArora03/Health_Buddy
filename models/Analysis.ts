import mongoose from 'mongoose'

const AnalysisSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: String,
  analysis: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema)

