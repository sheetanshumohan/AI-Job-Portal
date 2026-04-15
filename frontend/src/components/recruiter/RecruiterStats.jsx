import { motion } from 'framer-motion';
import { Briefcase, Users, UserCheck, Calendar, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card p-6 border border-slate-700/50 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl -z-10 group-hover:bg-${color}-500/10 transition-colors`} />
    
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shadow-lg`}>
        <Icon size={22} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>

    <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
  </motion.div>
);

const RecruiterStats = ({ stats }) => {
  const statsConfig = [
    { 
      title: 'Total Jobs Posted', 
      value: stats?.totalJobs || '0', 
      icon: FileText, 
      color: 'blue', 
      trend: 'up', 
      trendValue: '+0%' 
    },
    { 
      title: 'Active Jobs', 
      value: stats?.activeJobs || '0', 
      icon: Briefcase, 
      color: 'brand', 
      trend: 'up', 
      trendValue: '+0' 
    },
    { 
      title: 'Total Applicants', 
      value: stats?.totalApplicants?.toLocaleString() || '0', 
      icon: Users, 
      color: 'purple', 
      trend: 'up', 
      trendValue: '+0%' 
    },
    { 
      title: 'Shortlisted', 
      value: stats?.shortlistedCount || '0', 
      icon: UserCheck, 
      color: 'emerald', 
      trend: 'up', 
      trendValue: '+0%' 
    },
    { 
      title: 'Interviews', 
      value: stats?.interviewCount || '0', 
      icon: Calendar, 
      color: 'amber', 
      trend: 'up', 
      trendValue: '+0%' 
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {statsConfig.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </div>
  );
};

export default RecruiterStats;
