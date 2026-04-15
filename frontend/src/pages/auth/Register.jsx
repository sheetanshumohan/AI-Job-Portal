import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, ArrowRight, ArrowLeft, Check, Loader2, UploadCloud, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../../store/authStore';

// === SCHEMAS ===
const baseSchema = {
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
};

const studentSchema = z.object({
  ...baseSchema,
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  currentLocation: z.string().optional(),
  nationality: z.string().optional(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  skills: z.string().optional(), // comma separated
  collegeName: z.string().optional(),
  degree: z.string().optional(),
  specialization: z.string().optional(),
  graduationYear: z.string().optional(),
});

const recruiterSchema = z.object({
  ...baseSchema,
  companyName: z.string().min(2, "Company name is required"),
  recruiterName: z.string().min(2, "Recruiter name is required"),
  companyWebsite: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  companyLocation: z.string().optional(),
  companyDescription: z.string().optional(),
});

// === COMPONENTS ===
const Register = () => {
  const [role, setRole] = useState('student');
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const { register: registerAction, verifyEmail, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Student Form
  const { register: regStudent, handleSubmit: handleStudent, formState: { errors: errS }, trigger: triggerS } = useForm({
    resolver: zodResolver(studentSchema),
    mode: 'onTouched'
  });

  // Recruiter Form
  const { register: regRecruiter, handleSubmit: handleRecruiter, formState: { errors: errR } } = useForm({
    resolver: zodResolver(recruiterSchema),
    mode: 'onTouched'
  });

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const nextStep = async (fieldsToValidate) => {
    const isStepValid = await triggerS(fieldsToValidate);
    if (isStepValid) setStep((prev) => prev + 1);
  };

  const submitRegistration = async (data) => {
    // We use FormData to handle file upload
    const formData = new FormData();
    
    // Add base fields
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('role', role);

    // Add profile data based on role
    Object.keys(data).forEach(key => {
      if (key !== 'email' && key !== 'password' && key !== 'resume') {
        if (key === 'skills' && role === 'student' && data[key]) {
           const skillsArray = data[key].split(',').map(s => s.trim());
           formData.append('skills', JSON.stringify(skillsArray));
        } else {
           formData.append(key, data[key]);
        }
      }
    });

    if (file) {
      formData.append('resume', file);
    }

    const { success, message, data: resData } = await registerAction(formData);
    
    if (success) {
      toast.success('Account created! Please verify your email.');
      setShowOtpModal(true);
    } else {
      toast.error(message || 'Registration failed');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return toast.error("OTP must be 6 digits");
    setOtpLoading(true);
    const { success, message } = await verifyEmail(otp);
    setOtpLoading(false);
    
    if (success) {
      toast.success('Email verified successfully!');
      setShowOtpModal(false);
      navigate(role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
    } else {
      toast.error(message || 'Verification failed');
    }
  };

  // Student Steps Configuration
  const studentSteps = [
    { title: "Personal Info", fields: ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'dateOfBirth', 'gender'] },
    { title: "Education", fields: ['collegeName', 'degree', 'specialization', 'graduationYear'] },
    { title: "Experience & Skills", fields: ['skills', 'linkedinUrl', 'githubUrl', 'portfolioUrl'] },
    { title: "Resume", fields: [] }
  ];

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background relative z-10 flex items-center justify-center">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full">
        
        {/* Header & Role Toggle */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-heading font-bold text-white mb-2">Create your account</h2>
          <p className="text-slate-400">Join the next-generation AI hiring platform</p>
        </div>

        <div className="flex bg-surface p-1 rounded-xl mb-8 border border-slate-700 max-w-sm mx-auto shadow-lg">
          <button onClick={() => { setRole('student'); setStep(1); }} className={`flex-1 flex justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'student' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <User className="w-4 h-4" /> Candidate
          </button>
          <button onClick={() => setRole('recruiter')} className={`flex-1 flex justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'recruiter' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <Briefcase className="w-4 h-4" /> Recruiter
          </button>
        </div>

        <div className="glass-card p-8 sm:p-10 border border-slate-700/50 relative overflow-hidden">
          
          {/* STUDENT FLOW (Multi-step) */}
          {role === 'student' && (
            <div>
              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-800 -z-10 -translate-y-1/2"></div>
                <div className="absolute left-0 top-1/2 h-1 bg-brand-500 -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
                {studentSteps.map((s, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step > i + 1 ? 'bg-brand-500 border-brand-500 text-white' : step === i + 1 ? 'bg-surface border-brand-500 text-brand-400' : 'bg-surface border-slate-700 text-slate-500'}`}>
                    {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                ))}
              </div>

              <form onSubmit={handleStudent(submitRegistration)}>
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="text-xl font-heading font-semibold text-white mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">First Name</label>
                        <input {...regStudent('firstName')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                        {errS.firstName && <p className="text-red-400 text-xs mt-1">{errS.firstName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Last Name</label>
                        <input {...regStudent('lastName')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                        {errS.lastName && <p className="text-red-400 text-xs mt-1">{errS.lastName.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Email <span className="text-brand-400">*</span></label>
                      <input {...regStudent('email')} type="email" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                      {errS.email && <p className="text-red-400 text-xs mt-1">{errS.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Password <span className="text-brand-400">*</span></label>
                      <input {...regStudent('password')} type="password" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                      {errS.password && <p className="text-red-400 text-xs mt-1">{errS.password.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Phone Number</label>
                        <input {...regStudent('phoneNumber')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Date of Birth</label>
                        <input {...regStudent('dateOfBirth')} type="date" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-slate-200" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Gender</label>
                      <select {...regStudent('gender')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-slate-200">
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button type="button" onClick={() => nextStep(studentSteps[0].fields)} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg flex items-center gap-2 hover:bg-brand-500 transition-colors">
                        Next step <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="text-xl font-heading font-semibold text-white mb-4">Educational Background</h3>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">College/University Name</label>
                      <input {...regStudent('collegeName')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Degree</label>
                        <select {...regStudent('degree')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-slate-200">
                          <option value="">Select Degree...</option>
                          <option value="High School">High School</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Bachelor's">Bachelor's</option>
                          <option value="Master's">Master's</option>
                          <option value="PhD">PhD</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Graduation Year</label>
                        <input {...regStudent('graduationYear')} type="number" placeholder="2024" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Specialization/Major</label>
                      <input {...regStudent('specialization')} placeholder="e.g. Computer Science" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 glass text-slate-300 rounded-lg flex items-center gap-2 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button type="button" onClick={() => nextStep(studentSteps[1].fields)} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg flex items-center gap-2 hover:bg-brand-500 transition-colors">
                        Next step <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="text-xl font-heading font-semibold text-white mb-4">Experience & Presence</h3>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Skills Tags (comma separated)</label>
                      <input {...regStudent('skills')} placeholder="React, Node.js, Python, AWS" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div className="space-y-4 mt-4">
                      <input {...regStudent('linkedinUrl')} placeholder="LinkedIn URL" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
                      <input {...regStudent('githubUrl')} placeholder="GitHub URL" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
                      <input {...regStudent('portfolioUrl')} placeholder="Portfolio/Personal Website URL" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
                    </div>
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 glass text-slate-300 rounded-lg flex items-center gap-2 hover:text-white transition-colors">
                         <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button type="button" onClick={() => nextStep(studentSteps[2].fields)} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg flex items-center gap-2 hover:bg-brand-500 transition-colors">
                        Next step <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="text-xl font-heading font-semibold text-white mb-4">Upload Resume</h3>
                    <div className="border-2 border-dashed border-slate-600 hover:border-brand-500 bg-surface/30 rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer group">
                      <input type="file" className="hidden" id="resumeUpload" onChange={onFileChange} accept=".pdf,.doc,.docx" />
                      <label htmlFor="resumeUpload" className="flex flex-col items-center cursor-pointer w-full h-full">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-600/20 group-hover:scale-110 transition-all">
                          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-400" />
                        </div>
                        <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-slate-500 text-sm mb-4">PDF, DOC, DOCX (Max 5MB)</p>
                        {file && (
                          <div className="px-4 py-2 bg-brand-500/10 text-brand-300 rounded-lg border border-brand-500/30 font-medium text-sm flex items-center gap-2">
                            <Check className="w-4 h-4" /> {file.name}
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 glass text-slate-300 rounded-lg flex items-center gap-2 hover:text-white transition-colors">
                         <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button type="submit" disabled={isLoading} className="px-8 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2 font-bold shadow-lg disabled:opacity-50 transition-all">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          )}

          {/* RECRUITER FLOW (Single-step Card base) */}
          {role === 'recruiter' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-heading font-semibold text-white mb-6">Company Information</h3>
              <form onSubmit={handleRecruiter(submitRegistration)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Recruiter Name <span className="text-brand-400">*</span></label>
                    <input {...regRecruiter('recruiterName')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                    {errR.recruiterName && <p className="text-red-400 text-xs mt-1">{errR.recruiterName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Company Name <span className="text-brand-400">*</span></label>
                    <input {...regRecruiter('companyName')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                    {errR.companyName && <p className="text-red-400 text-xs mt-1">{errR.companyName.message}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Email (Work) <span className="text-brand-400">*</span></label>
                    <input {...regRecruiter('email')} type="email" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                    {errR.email && <p className="text-red-400 text-xs mt-1">{errR.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Password <span className="text-brand-400">*</span></label>
                    <input {...regRecruiter('password')} type="password" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                    {errR.password && <p className="text-red-400 text-xs mt-1">{errR.password.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Phone Number</label>
                    <input {...regRecruiter('phoneNumber')} className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Company Website</label>
                    <input {...regRecruiter('companyWebsite')} placeholder="https://" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Company Location</label>
                  <input {...regRecruiter('companyLocation')} placeholder="City, State" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Company Description</label>
                  <textarea {...regRecruiter('companyDescription')} rows="3" className="w-full bg-surface/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none resize-none"></textarea>
                </div>

                <button type="submit" disabled={isLoading} className="w-full mt-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Recruiter Account"}
                </button>
              </form>
            </motion.div>
          )}

        </div>

        <p className="mt-8 text-center text-slate-400">
          Already have an account? <Link to="/login" className="text-brand-400 font-medium hover:text-brand-300 transition-colors">Sign in</Link>
        </p>

      </motion.div>

      {/* OTP Modal Overlay (Framer Motion) */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface glass border border-slate-700 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative"
            >
              <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-6 border border-brand-500/30">
                <KeyRound className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white mb-2">Verify Your Email</h3>
              <p className="text-slate-400 text-sm mb-6">We've sent a 6-digit verification code to your email. Please enter it below.</p>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  maxLength={6} 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-background border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors font-mono" 
                  placeholder="------" 
                />
                <button 
                  onClick={handleVerifyOtp} 
                  disabled={otp.length !== 6 || otpLoading} 
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-all font-sans"
                >
                  {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                </button>
                <div className="text-center pt-2">
                  <button onClick={() => setShowOtpModal(false)} className="text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
