import { SearchX, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyJobs = ({ onReset }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border border-slate-700/50"
    >
      <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-2xl animate-pulse" />
        <SearchX size={48} className="text-slate-700 relative z-10" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">No match found</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
        We couldn't find any jobs matching your current filters. Try adjusting your search or clearing filters to see more opportunities.
      </p>

      <button 
        onClick={onReset}
        className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-600/20"
      >
        <RefreshCcw size={18} /> Clear All Filters
      </button>
    </motion.div>
  );
};

export default EmptyJobs;
