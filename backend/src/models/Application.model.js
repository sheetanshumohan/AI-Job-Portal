import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Shortlisted', 'Interview', 'Rejected', 'Selected'],
    default: 'Pending'
  },
  resumeUrl: {
    type: String,
    required: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiAnalysis: {
    strengths: [String],
    gaps: [String]
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
