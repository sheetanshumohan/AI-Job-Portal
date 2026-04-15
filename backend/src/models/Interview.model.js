import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String },
      feedback: { type: String },
      score: { type: Number, min: 0, max: 10 }
    }
  ],
  overallScore: {
    type: Number,
    default: 0
  },
  overallFeedback: {
    type: String
  },
  status: {
    type: String,
    enum: ['started', 'completed'],
    default: 'started'
  },
  type: {
    type: String,
    enum: ['mock', 'interview'],
    default: 'interview'
  }
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
