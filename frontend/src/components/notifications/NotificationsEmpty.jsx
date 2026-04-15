import { motion } from 'framer-motion';
import { BellOff, Loader2 } from 'lucide-react';

const NotificationsEmpty = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center glass-card border border-slate-700/50"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 relative">
          <BellOff size={40} />
          {/* Decorative Pulse */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-800 animate-ping opacity-20" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Zero interruptions</h3>
      <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
        You're all caught up! When you get new application status updates or job matches, they'll show up here.
      </p>
    </motion.div>
  );
};

export default NotificationsEmpty;
