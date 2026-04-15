import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Trash2, 
  ExternalLink, 
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedJobCard = ({ job, onRemove }) => {
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
    if (!salary.isDisclosed) return 'Not disclosed';
    
    const currencySym = salary.currency === 'USD' ? '$' : '₹';
    const minStr = salary.min >= 1000 ? `${(salary.min / 1000).toFixed(0)}k` : salary.min;
    const maxStr = salary.max >= 1000 ? `${(salary.max / 1000).toFixed(0)}k` : salary.max;
    
    return `${currencySym}${minStr} - ${currencySym}${maxStr} ${salary.period}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 border border-slate-700/50 hover:border-brand-500/30 transition-all group overflow-hidden relative"
    >
      {/* Decorative Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl -z-10 group-hover:bg-brand-500/10 transition-colors" />

      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="space-y-1.5 pt-1">
            <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><Building2 size={14} className="text-brand-500/70" /> {job.company}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-500/70" /> {job.location}</span>
              <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-emerald-500/70" /> {formatSalary(job.salary)}</span>
            </div>
          </div>

        {/* AI Match Badge */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
          <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider transition-colors ${
            job.matchScore >= 80 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-brand-500/10 border-brand-500/20 text-brand-400'
          }`}>
            <Sparkles size={12} className={job.matchScore >= 80 ? 'animate-pulse' : ''} />
            {job.matchScore || 0}% Match
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Saved Position</p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-2 mt-8 pt-6 border-t border-slate-800/50">
        <Link 
          to={`/student/jobs/${job._id || job.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold transition-all border border-slate-700/50"
        >
          <ExternalLink size={14} /> Details
        </Link>
        <Link 
          to={`/student/interview/${job._id || job.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-brand-600/20"
        >
          <MessageCircle size={14} /> Mock Interview
        </Link>
        <button 
          onClick={() => onRemove(job._id || job.id)}
          className="p-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all border border-rose-500/10 flex items-center justify-center"
          title="Remove from saved"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default SavedJobCard;
