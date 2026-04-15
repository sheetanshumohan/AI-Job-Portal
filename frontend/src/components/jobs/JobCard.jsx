import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Bookmark, 
  ArrowRight,
  Sparkles,
  MessageCircle,
  FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const JobCard = ({ job, isSaved, onSave }) => {
  const isHighMatch = job.matchScore >= 80;

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 border border-slate-700/50 hover:border-brand-500/40 transition-all group relative overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Link Overlay */}
      <Link to={`/student/jobs/${job.id || job._id}`} className="absolute inset-0 z-10" />

      {/* Match Score Indicator (Top Right) */}
      <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-3xl border-l border-b flex items-center gap-2 font-bold text-[10px] tracking-widest uppercase transition-colors z-20 ${
        isHighMatch 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
          : 'bg-brand-500/10 border-brand-500/20 text-brand-400'
      }`}>
        <Sparkles size={12} className={isHighMatch ? 'animate-pulse' : ''} />
        {job.matchScore || 0}% Match
      </div>

      <div className="flex-1 space-y-5 relative z-20">
          <div className="flex-1 pr-12">
            <h3 className="text-white font-bold leading-tight group-hover:text-brand-400 transition-colors line-clamp-1">{job.title}</h3>
            <p className="text-brand-400/80 text-xs font-semibold mt-1 tracking-widers">{job.company}</p>
          </div>

        {/* Metas Grid */}
        <div className="grid grid-cols-2 gap-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin size={14} className="text-slate-600" />
            {job.location}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Briefcase size={14} className="text-slate-600" />
            {job.type}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <DollarSign size={14} className="text-slate-600" />
            {formatSalary(job.salary)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles size={14} className="text-slate-600" />
            {job.level}
          </div>
        </div>

        {/* Technology Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(job.technologies || job.skills || []).slice(0, 3).map((skill) => (
            <span key={skill} className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-400 text-[10px] font-bold uppercase transition-colors group-hover:border-brand-500/30">
              {skill}
            </span>
          ))}
          {(job.technologies || job.skills || []).length > 3 && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-500 text-[10px] font-bold uppercase">
              +{(job.technologies || job.skills).length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Suite - Multi-tiered */}
      <div className="mt-6 pt-6 border-t border-slate-700/30 space-y-3 relative z-20">
        {/* Secondary Actions */}
        <div className="flex gap-2">
           <Link 
             to={`/student/interview/${job.id || job._id}?mode=mock`}
             className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all border border-slate-700/50"
           >
             <MessageCircle size={14} /> Mock Interview
           </Link>
        </div>

        {/* Primary Actions */}
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave && onSave(job.id || job._id);
            }}
            className={`p-3 rounded-xl border transition-all group/save ${
              isSaved 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-rose-400'
            }`}
          >
            <Bookmark size={18} className={`${isSaved ? 'fill-rose-500' : ''} group-hover/save:scale-110 transition-all`} />
          </button>
          <Link 
            to={`/student/jobs/${job.id || job._id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-brand-600/20 group/apply"
          >
             Apply Now <ArrowRight size={16} className="group-hover/apply:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;
