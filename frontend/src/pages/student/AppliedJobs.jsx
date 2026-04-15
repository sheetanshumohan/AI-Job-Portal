import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ApplicationStatusFilter from '../../components/applications/ApplicationStatusFilter';
import ApplicationCard from '../../components/applications/ApplicationCard';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const statusMapping = {
  'Pending': 'applied',
  'Shortlisted': 'review',
  'Interview': 'interview',
  'Selected': 'offer',
  'Rejected': 'rejected'
};

const AppliedJobs = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/applications');
      if (data.success) {
        // Transform backend data to frontend structure
        const transformedData = data.data.map(app => {
          let visualStatus = statusMapping[app.status] || 'applied';
          const interviewData = app.interviewData;

          // Condition 1: If status is Interview but session hasn't happened yet, stay at 'review'
          if (app.status === 'Interview' && (!interviewData || interviewData.status !== 'completed')) {
            visualStatus = 'review';
          }

          // Condition 2: If status is Shortlisted, Selected, or Rejected AFTER an interview is completed (or just Selected overall), complete the bar
          if ((app.status === 'Selected') || ((app.status === 'Shortlisted' || app.status === 'Rejected') && interviewData?.status === 'completed')) {
            visualStatus = 'offer';
          }

          return {
            id: app._id,
            jobId: app.job?._id,
            title: app.job?.title || 'Unknown Role',
            company: app.job?.company || 'Unknown Company',
            location: app.job?.location || 'Remote',
            dateApplied: new Date(app.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: '2-digit', 
              year: 'numeric' 
            }),
            status: visualStatus,
            actualStatus: app.status,
            interviewStatus: interviewData?.status,
            resumeUrl: app.resumeUrl
          };
        });



        setApplications(transformedData);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      try {
        const { data } = await api.delete(`/applications/${id}`);
        if (data.success) {
          toast.success('Application withdrawn successfully');
          setApplications(prev => prev.filter(app => app.id !== id));
        }
      } catch (error) {
        console.error('Error withdrawing application:', error);
        toast.error(error.response?.data?.message || 'Failed to withdraw application');
      }
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(search.toLowerCase()) || 
                         app.company.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || app.status === activeTab;
    return matchesSearch && matchesTab;
  });


  const counts = {
    all: applications.length,
    applied: applications.filter(app => app.status === 'applied' || app.status === 'review').length,
    interview: applications.filter(app => app.status === 'interview').length,
    offer: applications.filter(app => app.status === 'offer').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Applications</h1>
            <p className="text-slate-500 mt-1 text-sm">Track your professional journey and pending offers</p>
          </div>
          <Link 
            to="/student/jobs"
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-600/20 w-fit"
          >
            Find More Jobs
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 sm:px-0">
          <ApplicationStatusFilter 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            counts={counts}
          />
          
          <div className="relative group min-w-[300px]">

            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="Search companies or roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700/50 rounded-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-all shadow-xl"
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="grid grid-cols-1 gap-6 px-4 sm:px-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Loading applications...</h3>
              <p className="text-slate-500 text-sm">Please wait while we fetch your journey</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ApplicationCard 
                    application={app} 
                    onWithdraw={handleWithdraw}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center glass-card border border-slate-700/50">
               <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 text-slate-700">
                  <SlidersHorizontal size={32} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No applications found</h3>
               <p className="text-slate-500 text-sm max-w-xs mx-auto">
                 We couldn't find any applications matching your current filter. Try adjusting your search or tabs.
               </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AppliedJobs;
