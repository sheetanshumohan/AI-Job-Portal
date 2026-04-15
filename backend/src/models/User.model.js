import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['student', 'recruiter'],
    required: true
  },
  phoneNumber: String,
  
  // Student Specific Fields
  firstName: String,
  lastName: String,
  headline: {
    type: String,
    default: 'Aspirant'
  },
  bio: String,
  dateOfBirth: Date,
  gender: String,
  currentLocation: String,
  nationality: String,
  
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String
  },

  experiences: [
    {
      role: String,
      company: String,
      period: String,
      location: String,
      desc: String
    }
  ],

  education: [
    {
      degree: String,
      school: String,
      period: String,
      location: String
    }
  ],

  skills: [String],
  collegeName: String,
  degree: String,
  specialization: String,
  graduationYear: Number,
  resumeUrl: String,

  // Recruiter Specific Fields
  recruiterName: String,
  designation: String,
  companyName: String,
  companyWebsite: String,
  companyCity: String,
  companyCountry: String,
  companyLogo: String,
  companySize: String,
  industry: String,
  foundedYear: Number,
  companyDescription: String,
  linkedinUrl: String,

  // Auth & Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpires: Date,
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
  
  googleId: String,
  avatar: String,

  profileViews: {
    type: Number,
    default: 0
  },

  savedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }
  ],
  embedding: {
    type: [Number],
    select: false
  },

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
