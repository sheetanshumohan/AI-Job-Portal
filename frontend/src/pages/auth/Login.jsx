import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Briefcase, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';
import { GoogleLogin } from '@react-oauth/google';

// Validation Schema using Zod
const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }).min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional(),
});

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const Login = () => {
  const [role, setRole] = useState('student');
  
  const { login, googleLogin, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  const onSubmit = async (data) => {
    const { success, message, needsVerification, data: resData } = await login(data.email, data.password, role, data.rememberMe);
    
    if (success) {
      if (needsVerification) {
        toast.error('Email not verified. Please enter your OTP.');
        navigate('/verify-email');
      } else {
        toast.success('Welcome back!');
        const userRole = resData?.data?.role || role; 
        navigate(userRole === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
      }
    } else {
      toast.error(message || 'Failed to login');
    }
  };

  // Google Login is handled via the inline GoogleLogin component below

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 pt-32 bg-background overflow-hidden">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full glass p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 border border-slate-700/50"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm font-medium">Continue your journey with AI Job Portal</p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-surface p-1 rounded-xl mb-8 border border-slate-700/50">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${role === 'student' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <UserIcon className="w-4 h-4" /> Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${role === 'recruiter' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Briefcase className="w-4 h-4" /> Recruiter
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
              </div>
              <input {...register("email")} type="email" autoComplete="off" className={`block w-full pl-11 pr-3 py-3 bg-surface/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-sans ${errors.email ? 'border border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border border-slate-700 focus:border-brand-500 focus:ring-brand-500/30'}`} placeholder="you@example.com" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
              </div>
              <input {...register("password")} type="password" autoComplete="new-password" className={`block w-full pl-11 pr-3 py-3 bg-surface/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-sans ${errors.password ? 'border border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border border-slate-700 focus:border-brand-500 focus:ring-brand-500/30'}`} placeholder="••••••••" />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" {...register("rememberMe")} className="w-4 h-4 rounded border-slate-600 text-brand-600 focus:ring-brand-500/50 focus:ring-offset-background bg-surface cursor-pointer" />
              <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</Link>
          </div>

          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 active:translate-y-0">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-3 bg-surface/50 text-slate-500 glass rounded-full">Or continue with</span></div>
        </div>

        <div className="mt-6 flex justify-center w-full min-h-[44px]">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              console.log('Google Login credential response received:', credentialResponse);
              const result = await googleLogin(credentialResponse.credential, role);
              console.log('Backend response for googleLogin:', result);
              if (result.success) {
                toast.success(result.data?.message || 'Google Login success!');
                const userRole = result.data?.data?.role || role;
                navigate(userRole === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
              } else {
                console.error('Backend Google Login failed:', result.message);
                toast.error(result.message || 'Google Login failed on backend');
              }
            }}
            onError={() => {
              console.error('Google Sign-In Failed');
              toast.error('Google Sign-In Failed');
            }}
            theme="filled_dark"
            shape="pill"
            width="384"
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account? <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">Register for free</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
