import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../../store/authStore';

// Validation Schemas
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "Numeric only"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const formVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
};

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Form, 3: Success
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  
  const { forgotPassword, resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Phase 1: Email Form
  const { register: regEmail, handleSubmit: handleEmailSubmit, formState: { errors: errEmail } } = useForm({
    resolver: zodResolver(emailSchema)
  });

  // Phase 2: Reset Form
  const { register: regReset, handleSubmit: handleResetSubmit, formState: { errors: errReset } } = useForm({
    resolver: zodResolver(resetSchema)
  });

  const onSendOTP = async (data) => {
    const { success, message } = await forgotPassword(data.email, role);
    if (success) {
      setEmail(data.email);
      setStep(2);
      toast.success(message || 'We have sent a verification code to your email.');
    } else {
      toast.error(message || 'Failed to send OTP');
    }
  };

  const onResetPassword = async (data) => {
    const { success, message } = await resetPassword(email, data.otp, data.password);
    if (success) {
      setStep(3);
      toast.success('Password reset successfully!');
    } else {
      toast.error(message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background relative z-10 flex items-center justify-center overflow-hidden">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 border border-slate-700/50"
      >
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-surface border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/10">
                  <ShieldCheck className="w-8 h-8 text-brand-400" />
                </div>
                <h2 className="text-3xl font-heading font-bold text-white mb-2 tracking-tight">Forgot Password?</h2>
                <p className="text-slate-400 text-sm font-medium">No worries, we'll send you reset instructions.</p>
              </div>

              {/* Role Switcher */}
              <div className="flex bg-surface p-1 rounded-xl mb-6 border border-slate-700/50">
                <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'student' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
                  Candidate
                </button>
                <button type="button" onClick={() => setRole('recruiter')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'recruiter' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
                  Recruiter
                </button>
              </div>

              <form onSubmit={handleEmailSubmit(onSendOTP)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Registered Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 transition-colors ${errEmail.email ? 'text-red-400' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
                    </div>
                    <input {...regEmail("email")} type="email" className={`block w-full pl-11 pr-3 py-3 bg-surface/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-sans ${errEmail.email ? 'border border-red-500/50 focus:border-red-500' : 'border border-slate-700 focus:border-brand-500'}`} placeholder="you@example.com" />
                  </div>
                  {errEmail.email && <p className="mt-1 text-xs text-red-400 font-medium">{errEmail.email.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Authorization Code"}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                  &lt; Back to log in
                </Link>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-heading font-bold text-white mb-2 tracking-tight">Set New Password</h2>
                <p className="text-slate-400 text-sm font-medium">Enter the 6-digit code sent to <span className="text-white">{(email)}</span></p>
              </div>

              <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Verification Code</label>
                  <input {...regReset("otp")} maxLength={6} type="text" className={`block w-full px-4 py-3 bg-surface/50 rounded-xl tracking-widest text-xl text-center font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${errReset.otp ? 'border border-red-500/50 focus:border-red-500' : 'border border-slate-700 focus:border-brand-500'}`} placeholder="------" />
                  {errReset.otp && <p className="mt-1 text-xs text-red-400 font-medium text-center">{errReset.otp.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors ${errReset.password ? 'text-red-400' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
                    </div>
                    <input {...regReset("password")} type="password" className={`block w-full pl-11 pr-3 py-3 bg-surface/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-sans ${errReset.password ? 'border border-red-500/50 focus:border-red-500' : 'border border-slate-700 focus:border-brand-500'}`} placeholder="••••••••" />
                  </div>
                  {errReset.password && <p className="mt-1 text-xs text-red-400 font-medium">{errReset.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors ${errReset.confirmPassword ? 'text-red-400' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
                    </div>
                    <input {...regReset("confirmPassword")} type="password" className={`block w-full pl-11 pr-3 py-3 bg-surface/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-sans ${errReset.confirmPassword ? 'border border-red-500/50 focus:border-red-500' : 'border border-slate-700 focus:border-brand-500'}`} placeholder="••••••••" />
                  </div>
                  {errReset.confirmPassword && <p className="mt-1 text-xs text-red-400 font-medium">{errReset.confirmPassword.message}</p>}
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] border-2 border-green-500">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </motion.div>
              <h2 className="text-3xl font-heading font-bold text-white mb-4 tracking-tight">Password Reset!</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">Your password has been successfully reset. You can now use your new password to log in to your account.</p>
              
              <Link to="/login" className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                Back to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
          
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
