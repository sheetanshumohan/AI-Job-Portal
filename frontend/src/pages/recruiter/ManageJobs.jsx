import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  Briefcase,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/axios';
import JobDetailDrawer from '../../components/recruiter/JobDetailDrawer';

const STATUS_CONFIG = {
  active: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
  draft: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: <Clock size={12} /> },
  paused: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <AlertCircle size={12} /> },
  closed: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <X size={12} /> },
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [activeStatusMenu, setActiveStatusMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/jobs/my-jobs');
      if (response.data.success) {
        setJobs(response.data.data.map(job => ({
          ...job,
          id: job._id,
          postedAt: new Date(job.createdAt).toLocaleDateString(),
          deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'
        })));
      }
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    setUpdatingStatusId(jobId);
    try {
      const response = await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
      if (response.data.success) {
        setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
        toast.success(`Job marked as ${newStatus}`);
      }
    } catch (error) {

      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setUpdatingStatusId(null);
      setActiveStatusMenu(null);
    }
  };

  const handleDelete = async (id) => {
    const loadingToast = toast.loading('Deleting job and notifying applicants...');
    try {
      const response = await api.delete(`/jobs/${id}`);
      if (response.data.success) {
        setJobs(prevJobs => prevJobs.filter(j => j.id !== id));
        toast.success('Job deleted and applicants notified successfully', { id: loadingToast });
        setShowDeleteModal(null);
      }
    } catch (error) {

      toast.error(error.response?.data?.message || 'Failed to delete job', { id: loadingToast });
      console.error(error);
    }
  };



  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || job.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Manage Postings</h1>
            <p className="text-slate-500 text-sm mt-1">Track and manage your {jobs.length} job listings</p>
          </div>
          <Link 
            to="/recruiter/jobs/create"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-brand-600/30 group"
          >
            <Plus size={18} /> Create New Job
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 sm:px-0">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search by job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-brand-500/50 outline-none transition-all placeholder:text-slate-600 shadow-xl"
            />
          </div>
          
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto no-scrollbar">
            {['all', 'active', 'draft', 'paused', 'closed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap
                  ${activeFilter === filter ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="glass-card border border-slate-700/50 overflow-hidden shadow-2xl mx-4 sm:mx-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Information</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Applicants</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Posted / Deadline</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <Loader2 className="animate-spin text-brand-500" size={32} />
                           <p className="text-slate-500 font-medium">Fetching your postings...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job, idx) => (
                      <motion.tr 
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-6 py-6">
                           <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => setViewingJob(job)}
                                className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors text-left outline-none"
                              >
                                {job.title}
                              </button>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                 <span className="flex items-center gap-1"><Briefcase size={10} /> {job.type}</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-700" />
                                 <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 font-medium relative">
                           <div className="relative">
                              <button 
                                onClick={() => setActiveStatusMenu(activeStatusMenu === job.id ? null : job.id)}
                                disabled={updatingStatusId === job.id}
                                className={`
                                   inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all
                                   ${STATUS_CONFIG[job.status].bg} ${STATUS_CONFIG[job.status].color} ${STATUS_CONFIG[job.status].border}
                                   ${updatingStatusId === job.id ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95 cursor-pointer'}
                                `}
                              >
                                 {updatingStatusId === job.id ? (
                                   <Loader2 size={12} className="animate-spin" />
                                 ) : (
                                   STATUS_CONFIG[job.status].icon
                                 )}
                                 {job.status}
                              </button>

                              <AnimatePresence>
                                {activeStatusMenu === job.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10" 
                                      onClick={() => setActiveStatusMenu(null)} 
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                      className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl z-20 overflow-hidden p-1.5"
                                    >
                                      {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                                        <button
                                          key={status}
                                          onClick={() => handleStatusUpdate(job.id, status)}
                                          className={`
                                            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                                            ${job.status === status ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                                          `}
                                        >
                                          <span className={config.color}>{config.icon}</span>
                                          {status}
                                          {job.status === status && <CheckCircle2 size={14} className="ml-auto text-brand-400" />}
                                        </button>
                                      ))}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                           </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                           <div className="flex flex-col items-center">
                              <span className="text-lg font-bold text-white leading-none">{job.applicants}</span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Candidates</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                 <Calendar size={12} /> {job.postedAt}
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                 Expires {job.deadline}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                                className="p-2.5 bg-slate-900 border border-slate-700/50 text-slate-400 hover:text-brand-400 hover:border-brand-500/30 rounded-xl transition-all shadow-lg"
                                title="View Applicants"
                              >
                                 <Users size={18} />
                              </button>
                              <button 
                                onClick={() => navigate(`/recruiter/jobs/edit/${job.id}`)}
                                className="p-2.5 bg-slate-900 border border-slate-700/50 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 rounded-xl transition-all shadow-lg"
                                title="Edit Job"
                              >
                                 <Edit3 size={18} />
                              </button>

                              <button 
                                onClick={() => setShowDeleteModal(job)}
                                className="p-2.5 bg-slate-900 border border-slate-700/50 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 rounded-xl transition-all shadow-lg"
                                title="Delete Job"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-32 text-center">
                         <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto border border-slate-800">
                               <AlertCircle className="text-slate-600" size={32} />
                            </div>
                            <h5 className="text-white font-bold">No jobs found</h5>
                            <p className="text-sm text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                            <button 
                              onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                              className="text-xs font-bold text-brand-400 uppercase tracking-widest hover:underline"
                            >
                               Clear All Filters
                            </button>
                         </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
          <div className="px-6 py-5 bg-slate-900/50 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Showing <span className="text-slate-300">{filteredJobs.length}</span> of <span className="text-slate-300">{jobs.length}</span> total postings
             </p>
             <div className="flex items-center gap-2">
                <button className="p-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg opacity-50 cursor-not-allowed">
                   <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                   {[1].map(p => (
                     <button key={p} className="w-8 h-8 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                        {p}
                     </button>
                   ))}
                </div>
                <button className="p-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg opacity-50 cursor-not-allowed">
                   <ChevronRight size={18} />
                </button>
             </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowDeleteModal(null)}
                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="relative max-w-sm w-full glass-card p-8 border border-white/10 shadow-2xl"
               >
                  <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                     <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-2">Delete Job Posting?</h3>
                  <p className="text-sm text-slate-400 text-center mb-8">
                    Are you sure you want to delete <span className="text-white font-bold">"{showDeleteModal.title}"</span>? This action is permanent and all associated applications will be archived.
                  </p>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => setShowDeleteModal(null)}
                       className="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                     >
                        Cancel
                     </button>
                     <button 
                       onClick={() => handleDelete(showDeleteModal.id)}
                       className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all"
                     >
                        Confirm Delete
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Job Details Drawer */}
        <JobDetailDrawer 
           job={viewingJob}
           isOpen={!!viewingJob}
           onClose={() => setViewingJob(null)}
           onDelete={(j) => {
             setViewingJob(null);
             setShowDeleteModal(j);
           }}
        />

      </div>
    </DashboardLayout>
  );
};

export default ManageJobs;
