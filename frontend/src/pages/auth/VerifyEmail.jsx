import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowRight, Loader2, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const { verifyEmail, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated and verified
  useEffect(() => {
    if (isAuthenticated && user?.isVerified) {
      navigate(user?.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("OTP must be 6 digits");
    
    setOtpLoading(true);
    const { success, message } = await verifyEmail(otp);
    setOtpLoading(false);
    
    if (success) {
      toast.success('Email verified successfully!');
      const updatedUser = useAuthStore.getState().user;
      navigate(updatedUser?.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
    } else {
      toast.error(message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 bg-background overflow-hidden">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 border border-slate-700/50"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-500/30">
            <KeyRound className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-white mb-2 tracking-tight">Verify Your Email</h2>
          <p className="text-slate-400 text-sm font-medium">
            We've sent a 6-digit verification code to <span className="text-brand-400 font-semibold">{user?.email || 'your email'}</span>.
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
              Enter 6-digit Code
            </label>
            <input 
              type="text" 
              maxLength={6} 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
              className="w-full text-center tracking-[0.5em] text-3xl font-bold bg-surface/50 border border-slate-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono placeholder:text-slate-700" 
              placeholder="000000"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={otp.length !== 6 || otpLoading} 
            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-brand-500/20"
          >
            {otpLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify Account <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-500">
            Didn't receive the code? <button className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Resend OTP</button>
          </p>
          <button 
            onClick={() => navigate('/login')} 
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
