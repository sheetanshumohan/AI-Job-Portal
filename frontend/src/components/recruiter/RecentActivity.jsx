import { motion } from 'framer-motion';
import { User, Mail, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'apply': return <User size={14} className="text-blue-400" />;
      case 'shortlist': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'interview': return <Calendar size={14} className="text-amber-400" />;
      case 'reject': return <XCircle size={14} className="text-rose-400" />;
      case 'select': return <CheckCircle2 size={14} className="text-brand-400" />;
      default: return <Clock size={14} className="text-slate-400" />;
    }
  };

  const getActivityBg = (type) => {
    switch (type) {
      case 'apply': return 'bg-blue-500/10';
      case 'shortlist': return 'bg-emerald-500/10';
      case 'interview': return 'bg-amber-500/10';
      case 'reject': return 'bg-rose-500/10';
      case 'select': return 'bg-brand-500/10';
      default: return 'bg-slate-500/10';
    }
  };

  const formatTime = (time) => {
    try {
      return new Date(time).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return time;
    }
  };

  return (
    <div className="glass-card p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
           Recent Activity
        </h3>
        <Link 
          to="/recruiter/notifications"
          className="text-[10px] font-bold text-brand-400 uppercase tracking-widest hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-6 relative">
        {/* Timeline Line */}
        <div className="absolute top-0 bottom-0 left-[19px] w-[1px] bg-slate-800" />

        {activities.length > 0 ? (
          activities.map((activity, idx) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4 relative z-10"
            >
              <div className={`w-10 h-10 rounded-full ${getActivityBg(activity.type)} flex items-center justify-center border border-slate-800 flex-shrink-0 shadow-lg`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 pb-6 border-b border-slate-800 last:border-0 last:pb-0">
                 <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                      {activity.title}
                    </h4>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      <Clock size={10} /> {formatTime(activity.time)}
                    </span>
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed">
                   {activity.content}
                 </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Clock className="text-slate-700 mb-4" size={40} />
            <p className="text-slate-400 text-sm">No recent activity to show.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
