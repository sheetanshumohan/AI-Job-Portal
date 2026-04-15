import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  FileText, 
  TrendingUp, 
  Zap, 
  ArrowUpRight,
  Target,
  Bookmark,
  Calendar
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AnalyticsChart from '../../components/dashboard/AnalyticsChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import QuickActions from '../../components/dashboard/QuickActions';
import AnalyzeResumeModal from '../../components/dashboard/AnalyzeResumeModal';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dashboardStats, setDashboardStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    interviews: 0,
    profileViews: 0,
    matchScore: 0,
    upcomingInterviews: []
  });
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/student/stats');
        if (response.data.success) {
          setDashboardStats(prev => ({
            ...prev,
            ...response.data.data
          }));
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Applied Jobs', value: (dashboardStats.appliedJobs ?? 0).toString(), icon: <Briefcase size={20} />, trend: 'Updated', color: 'text-brand-400', path: '/student/applications' },
    { label: 'Saved Jobs', value: (dashboardStats.savedJobs ?? 0).toString(), icon: <Bookmark size={20} />, trend: 'Watchlist', color: 'text-amber-400', path: '/student/saved' },
    { label: 'Interviews', value: (dashboardStats.interviews ?? 0).toString(), icon: <Calendar size={20} />, trend: 'Scheduled', color: 'text-emerald-400', path: '/student/interviews' },
    { label: 'Profile Views', value: (dashboardStats.profileViews ?? 0).toString(), icon: <TrendingUp size={20} />, trend: 'Growth', color: 'text-purple-400', path: '/student/profile' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-brand-400">{user?.firstName || 'Candidate'}</span>! 👋
            </h1>
            <p className="text-slate-400 mt-1 font-medium">
              Your resume score is looking great today. Check out new matches!
            </p>
          </div>

        </div>

        {/* Stats Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div 
              key={stat.label} 
              variants={item}
              className="glass-card p-6 flex flex-col group hover:border-brand-500/30 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => navigate(stat.path)}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {stat.icon}
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-slate-900 border border-slate-700/50 group-hover:bg-brand-500/10 transition-colors ${stat.color}`}>
                  {stat.icon}
                </div>
                <ArrowUpRight size={16} className="text-slate-600 group-hover:text-brand-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Analytics Chart */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-400" />
                Performance Analytics
              </h2>
              <select className="bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500/50 transition-colors">
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="glass-card p-6">
              <AnalyticsChart />
            </div>

            {/* Resume Match Score Card (Secondary Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 bg-gradient-to-br from-brand-600/10 to-indigo-600/10 border-brand-500/20 relative group overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-brand-400 mb-4">
                    <Target size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Match Score</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                       <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="transparent"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-brand-500"
                            strokeWidth="3"
                            strokeDasharray={`${dashboardStats.matchScore || 0}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">{dashboardStats.matchScore}%</span>
                        </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {dashboardStats.matchScore >= 80 ? 'Excellent!' : dashboardStats.matchScore >= 60 ? 'Good!' : 'Keep Improving!'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {dashboardStats.matchScore >= 80 
                          ? 'Your resume matches technical roles perfectly.' 
                          : 'Try adding more keywords to improve your match rate.'}
                      </p>
                      <button 
                        onClick={() => navigate('/student/profile')}
                        className="mt-4 text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                      >
                        Improve Score <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all" />
              </div>

              <div className="glass-card p-6 relative group overflow-hidden">
                <div className="flex items-center gap-2 text-emerald-400 mb-4">
                  <Zap size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Quick Actions</span>
                </div>
                <QuickActions onAnalyze={() => setIsAnalyzeModalOpen(true)} />
              </div>
            </div>
          </div>

          <AnalyzeResumeModal 
            isOpen={isAnalyzeModalOpen} 
            onClose={() => setIsAnalyzeModalOpen(false)} 
          />

          {/* Right Sidebar Widgets */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock size={20} className="text-amber-400" />
                  Recent Activity
                </h2>
                <button 
                  onClick={() => navigate('/student/notifications')}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="glass-card p-6">
                <ActivityFeed />
              </div>
            </section>



            {/* Real Upcoming Interviews */}
            <div className="glass-card p-6 border-slate-700/50">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-white font-bold">Interviews</h3>
                 <span className={`px-2 py-0.5 rounded-full ${dashboardStats.upcomingInterviews?.length > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'} text-[10px] font-bold uppercase`}>
                   {dashboardStats.upcomingInterviews?.length || 0} {dashboardStats.upcomingInterviews?.length === 1 ? 'ACTIVE' : 'ACTIVE'}
                 </span>
               </div>
               
               <div className="space-y-4">
                 {dashboardStats.upcomingInterviews?.length > 0 ? (
                   dashboardStats.upcomingInterviews.map((interview) => (
                     <motion.div 
                       key={interview.id}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-brand-500/30 transition-all group cursor-pointer"
                       onClick={() => navigate(`/student/interview/${interview.jobId}`)}
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/10 transition-colors">
                            <Calendar size={16} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                             Requested on {new Date(interview.date).toLocaleDateString()}
                           </p>
                           <p className="text-sm font-bold text-white mt-0.5 truncate group-hover:text-brand-400 transition-colors">
                             {interview.company} - {interview.jobTitle}
                           </p>
                         </div>
                       </div>
                     </motion.div>
                   ))
                 ) : (
                   <div className="text-center py-6 border-2 border-dashed border-slate-800/50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No scheduled sessions</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
