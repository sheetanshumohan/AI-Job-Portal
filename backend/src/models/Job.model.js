import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' },
    period: { type: String, default: 'per year' },
    isNegotiable: { type: Boolean, default: false },
    isDisclosed: { type: Boolean, default: true }
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: {
    type: [String],
    default: []
  },
  technologies: {
    type: [String],
    default: []
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Freelance'],
    default: 'Full-time'
  },
  workplaceType: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  education: {
    degree: String,
    fieldOfStudy: String
  },
  openings: {
    type: Number,
    default: 1
  },
  deadline: Date,
  experienceRange: {
    min: Number,
    max: Number
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Any', 'Entry Level', 'Intermediate'],
    default: 'Intermediate'
  },
  embedding: {
    type: [Number],
    select: false
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'paused', 'closed'],
    default: 'active'
  }

}, { timestamps: true });


const Job = mongoose.model('Job', jobSchema);

export default Job;
