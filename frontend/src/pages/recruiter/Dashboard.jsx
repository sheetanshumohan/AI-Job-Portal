import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Download, 
  MoreHorizontal, 
  ChevronRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../../lib/axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RecruiterStats from '../../components/recruiter/RecruiterStats';
import JobAnalytics from '../../components/recruiter/JobAnalytics';
import RecentActivity from '../../components/recruiter/RecentActivity';

const RecruiterDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/recruiter/dashboard-summary');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleExportReports = async () => {
    try {
      setExporting(true);
      const response = await api.get('/recruiter/export-data', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recruitment_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
     return (
       <DashboardLayout>
         <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
         </div>
       </DashboardLayout>
     );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-10 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 px-4 sm:px-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-brand-600/10 rounded-lg border border-brand-500/20">
                 <Sparkles className="text-brand-400" size={24} />
               </div>
               <h1 className="text-3xl font-bold text-white tracking-tight">Recruiter Command Center</h1>
            </div>
            <p className="text-slate-500 text-sm">Welcome back! Your AI resume analyzer has processed <span className="text-brand-400 font-bold">{data?.stats?.totalApplicants || 0}</span> applicants to date.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <button 
               onClick={handleExportReports}
               disabled={exporting}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700/50 text-slate-300 rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
             >
                {exporting ? (
                  <Loader2 size={16} className="animate-spin text-brand-500" />
                ) : (
                  <Download size={16} />
                )}
                {exporting ? 'Generating...' : 'Export Reports'}
             </button>
             <Link 
               to="/recruiter/jobs/create"
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-50 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-brand-600/30 group"
             >
                <Plus size={18} /> Create New Job
             </Link>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="px-4 sm:px-0">
          <RecruiterStats stats={data?.stats} />
        </div>

        {/* Analytics & Activity Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-4 sm:px-0">
          
          {/* Main Chart Column */}
          <div className="xl:col-span-2 space-y-8">
            <JobAnalytics />

            {/* AI Insights Banner */}
            <motion.div 
               whileHover={{ scale: 1.005 }}
               className="p-6 rounded-3xl bg-gradient-to-r from-brand-600/20 to-indigo-600/20 border border-brand-500/20 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-brand-400">
                    <TrendingUp size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Performance Insight</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Your match quality has increased by {data?.aiInsight?.matchImprovement || 0}%</h3>
                  <p className="text-sm text-slate-400 max-w-xl">
                    By adding "Cultural Fit" parameters to your job descriptions, our AI is filtering 15% more relevant candidates before they reach your inbox.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Activity & Sidebar Notifications */}
          <div className="xl:col-span-1 space-y-8">
            <RecentActivity activities={data?.recentActivities} />
            
            {/* Short-cut Quick Links Card */}
            <div className="glass-card p-6 border border-slate-700/50">
               <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Pipeline Shortcuts</h4>
               <div className="space-y-3">
                  {[
                    { label: 'Review Pending Applicants', count: data?.shortcuts?.pendingApplicants || 0, link: '/recruiter/jobs' },
                    { label: 'Review Shortlisted Candidates', count: data?.shortcuts?.shortlistedCount || 0, link: '/recruiter/jobs' },
                    { label: 'Pending Interview Feedbacks', count: data?.shortcuts?.interviewsPending || 0, link: '/recruiter/interviews' },
                    { label: 'Expiring Job Postings', count: data?.shortcuts?.expiringJobs || 0, link: '/recruiter/jobs' },
                  ].map((link, i) => (
                    <Link key={i} to={link.link} className="w-full group flex items-center justify-between p-4 bg-slate-900 shadow-xl border border-slate-800 rounded-2xl hover:border-brand-500/30 transition-all">
                       <span className="text-sm text-slate-400 font-medium group-hover:text-white transition-colors">{link.label}</span>
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-400">{link.count}</span>
                          <ChevronRight size={14} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
                       </div>
                    </Link>
                  ))}
               </div>
            </div>
          </div>

        </div>

        {/* Footer Quick Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
           {/* Recruiter Notifications Snippet */}
           <div className="lg:col-span-4 flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                 <p className="text-xs font-medium text-slate-500 italic">"AI match scores are automatically calculated for all new resumes..."</p>
              </div>
              <Link to="/recruiter/notifications" className="text-[10px] font-bold text-brand-500 uppercase tracking-widest hover:underline">
                 View Notification Center
              </Link>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
