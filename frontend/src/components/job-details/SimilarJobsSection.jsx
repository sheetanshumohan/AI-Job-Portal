import { useState, useEffect } from 'react';
import { ArrowRight, Building2, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const SimilarJobsSection = ({ currentJobId }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSimilarJobs();
  }, [currentJobId]);
  
  const fetchSimilarJobs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/jobs');
      if (response.data.success) {
        // Filter out current job and limit to 3
        const filtered = response.data.data
          .filter(job => job.id !== currentJobId && job.status === 'active')
          .slice(0, 3);
        setJobs(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch similar jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
    if (!salary.isDisclosed) return 'Not disclosed';
    const currencySym = salary.currency === 'USD' ? '$' : '₹';
    return `${currencySym}${salary.min / 1000}k - ${currencySym}${salary.max / 1000}k`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
         <Loader2 className="animate-spin text-slate-700" size={24} />
      </div>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="space-y-8 py-12 border-t border-slate-700/30">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Similar Jobs</h2>
          <p className="text-sm text-slate-500 mt-1">Found based on your interest and skills</p>
        </div>
        <Link to="/student/jobs" className="flex items-center gap-2 text-brand-400 hover:text-brand-300 font-bold text-sm transition-colors">
          View All <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Link 
            key={job._id || job.id} 
            to={`/student/jobs/${job._id || job.id}`}
            className="glass-card p-6 border border-slate-700/50 hover:border-brand-500/30 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-2">
                 <Building2 size={24} className="text-slate-400" />
              </div>
              <div>
                <h4 className="text-white font-bold group-hover:text-brand-400 transition-colors line-clamp-1">{job.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                <MapPin size={12} className="text-slate-600" /> {job.location}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                <DollarSign size={12} className="text-slate-600" /> {formatSalary(job.salary)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-tighter bg-brand-500/10 px-2 py-0.5 rounded-full">New Match</span>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SimilarJobsSection;
