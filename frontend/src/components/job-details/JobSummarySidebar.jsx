import { 
  DollarSign, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Zap, 
  Calendar, 
  MessageCircle, 
  Building,
  Building2
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

// Force build trigger: Updated navigation logic
const JobSummarySidebar = ({ job, mode = 'student' }) => {
  if (!job) return null;

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
    if (!salary.isDisclosed) return 'Not disclosed';
    
    const currencySym = salary.currency === 'USD' ? '$' : '₹';
    const minStr = salary.min >= 1000 ? `${(salary.min / 1000).toFixed(0)}k` : salary.min;
    const maxStr = salary.max >= 1000 ? `${(salary.max / 1000).toFixed(0)}k` : salary.max;
    
    return `${currencySym}${minStr} - ${currencySym}${maxStr} ${salary.period}`;
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      {/* Summary Card */}
      <div className="glass-card p-6 border border-slate-700/50 shadow-2xl">
        <h3 className="text-white font-bold mb-6 text-lg">Job Summary</h3>
        
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 rounded-xl text-brand-400 border border-slate-700/50">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Salary range</p>
              <p className="text-white font-bold text-sm">{formatSalary(job.salary)}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 rounded-xl text-brand-400 border border-slate-700/50">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</p>
              <p className="text-white font-bold text-sm">{job.location || 'Remote'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 rounded-xl text-brand-400 border border-slate-700/50">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type / Workplace</p>
              <p className="text-white font-bold text-sm">{job.type} • {job.workplaceType}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 rounded-xl text-brand-400 border border-slate-700/50">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Open Positions</p>
              <p className="text-white font-bold text-sm">{job.openings} Openings</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 rounded-xl text-brand-400 border border-slate-700/50">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Posted / Deadline</p>
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">
                  {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className={`${new Date(job.deadline) < new Date() ? 'text-rose-400' : 'text-emerald-400'} font-bold text-[11px] uppercase tracking-wider`}>
                  {job.status === 'active' ? (new Date(job.deadline) < new Date() ? 'Expired' : 'Live') : job.status} • {job.deadline ? `Ends ${new Date(job.deadline).toLocaleDateString()}` : 'No deadline'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {mode === 'student' && (
          <RouterLink 
            to={`/student/apply/${job._id || job.id}`}
            className="w-full mt-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all hover:translate-y-[-2px]"
          >
            Apply Now <ArrowRight size={18} />
          </RouterLink>
        )}
      </div>

      {/* Recruiter Card */}
      <div className="glass-card p-6 border border-slate-700/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
          <Building size={64} className="text-brand-400" />
        </div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Hiring Company</h4>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden">
             <Building2 size={24} />
          </div>
          <div>
            <p className="text-white font-bold">{job.company}</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize">{job.location} • Verified</p>
          </div>
        </div>
        {mode === 'student' && (
          <button className="w-full py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-700/50 flex items-center justify-center gap-2 transition-all">
            <MessageCircle size={16} /> Quick Message
          </button>
        )}
      </div>
    </div>
  );
};

export default JobSummarySidebar;
