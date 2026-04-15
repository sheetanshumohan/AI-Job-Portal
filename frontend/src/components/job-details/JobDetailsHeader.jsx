import { Building2, Share2, MapPin, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const JobDetailsHeader = ({ job }) => {
  if (!job) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
        <span>Jobs</span>
        <span className="text-slate-700">/</span>
        <span>{job.type}</span>
        <span className="text-slate-700">/</span>
        <span className="text-brand-400 truncate max-w-[200px]">{job.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">{job.title}</h1>
              {job.status === 'active' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Live
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 font-bold text-brand-400 bg-brand-400/5 px-3 py-1 rounded-lg border border-brand-500/10">
                <Building2 size={16} /> {job.company}
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin size={16} /> {job.location}
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                 {job.status === 'active' ? 'Actively Hiring' : job.status}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
            className="p-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700/50 transition-all group"
          >
            <Share2 size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsHeader;
