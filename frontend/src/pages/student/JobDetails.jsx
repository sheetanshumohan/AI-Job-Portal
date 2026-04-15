import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import JobDetailsHeader from '../../components/job-details/JobDetailsHeader';
import JobContentSection from '../../components/job-details/JobContentSection';
import JobSummarySidebar from '../../components/job-details/JobSummarySidebar';
import SimilarJobsSection from '../../components/job-details/SimilarJobsSection';
import api from '../../lib/axios';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/jobs/${id}`);
      if (response.data.success) {
        setJob(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load job details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
           <Loader2 className="animate-spin text-brand-500 mb-4" size={32} />
           <p className="font-bold tracking-widest text-xs uppercase">Loading job intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
           <p className="font-bold tracking-widest text-xs uppercase mb-4 text-rose-400">Job not found</p>
           <button 
              onClick={() => navigate('/student/jobs')}
              className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest"
           >
              Back to Browse
           </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-all group w-fit outline-none"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Go Back
        </button>

        {/* Page Hero */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <JobDetailsHeader job={job} />
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Main Info Column (Left) */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <JobContentSection job={job} />
            </motion.div>
          </div>

          {/* Sticky Sidebar Column (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <JobSummarySidebar job={job} mode="student" />
          </motion.div>

        </div>

        {/* Foot Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <SimilarJobsSection currentJobId={id} />
        </motion.div>
      </div>

       {/* Floating Apply Bottom Bar (Mobile Only) */}
       <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 pt-6 bg-gradient-to-t from-background via-background to-transparent z-40">
          <Link 
            to={`/student/apply/${id}`}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl shadow-brand-600/40"
          >
            Apply Now
          </Link>
       </div>
    </DashboardLayout>
  );
};

export default JobDetails;
