import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import JobDetailsHeader from '../job-details/JobDetailsHeader';
import JobContentSection from '../job-details/JobContentSection';
import JobSummarySidebar from '../job-details/JobSummarySidebar';
import { useNavigate } from 'react-router-dom';

const JobDetailDrawer = ({ job, isOpen, onClose, onDelete }) => {
  const navigate = useNavigate();

  if (!job) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-slate-950 shadow-2xl z-[70] overflow-y-auto border-l border-white/10"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="h-6 w-px bg-slate-800" />
                <h2 className="text-lg font-bold text-white uppercase tracking-widest text-xs">Job Details Preview</h2>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(`/recruiter/jobs/edit/${job.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-all"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button 
                   onClick={() => onDelete(job)}
                   className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all"
                >
                   <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 space-y-12 pb-32">
              <JobDetailsHeader job={job} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                <div className="lg:col-span-2">
                   <JobContentSection job={job} />
                </div>
                <div className="lg:col-span-1">
                   <JobSummarySidebar job={job} mode="recruiter" />
                </div>
              </div>
            </div>

            {/* Footer Quick Actions */}
            <div className="fixed bottom-0 right-0 w-full max-w-4xl bg-slate-950/80 backdrop-blur-md border-t border-white/5 p-6 flex justify-end gap-4">
               <button 
                 onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                 className="flex-1 sm:flex-none px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-brand-600/30"
               >
                 View All Applicants
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JobDetailDrawer;
