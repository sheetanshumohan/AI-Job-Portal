import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApplySuccess = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-10 text-center"
    >
      <div className="relative mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 relative z-10"
        >
          <CheckCircle2 size={56} strokeWidth={2.5} />
        </motion.div>
        
        {/* Animated Rings */}
        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-x-0 inset-y-0 border-2 border-emerald-500/30 rounded-full"
        />
      </div>

      <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Application Submitted!</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
        Great job! Your application has been sent to the recruiter. We'll notify you as soon as there's an update on your status.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          to="/student/dashboard"
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-600 text-white rounded-2xl font-bold transition-all group"
        >
          <LayoutDashboard size={18} /> Back to Dashboard
        </Link>
        <Link 
          to="/student/jobs"
          className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-600/30 group"
        >
          Browse More Jobs <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ApplySuccess;
