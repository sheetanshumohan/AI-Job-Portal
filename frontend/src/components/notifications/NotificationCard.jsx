import { motion } from 'framer-motion';
import { 
  Bell, 
  Briefcase, 
  FileText, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  Clock,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationCard = ({ notification, isCompleted, onMarkRead, onDelete }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'application': return <Briefcase className="text-brand-400" size={20} />;
      case 'interview': return <Calendar className="text-amber-400" size={20} />;
      case 'ai': return <Zap className="text-purple-400" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  const isInterviewAction = notification.actionUrl?.includes('/student/interview/');
  const actionText = (isCompleted && isInterviewAction) 
    ? 'View Screening Results' 
    : notification.action;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-card p-5 border-l-4 transition-all hover:bg-slate-800/50 group ${
        notification.read ? 'border-l-slate-700/50' : 'border-l-brand-500'
      }`}
    >
      <div className="flex gap-4">
        <div className={`p-3 rounded-xl bg-slate-900 border border-slate-700/50 h-fit transition-transform group-hover:scale-110`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`font-bold text-sm ${notification.read ? 'text-slate-400' : 'text-white'}`}>
                {notification.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <div className="flex items-center gap-1">
               <span className="text-[10px] font-medium text-slate-600 whitespace-nowrap">
                {notification.time}
              </span>
              <button 
                onClick={() => onDelete(notification.id)}
                className="p-1.5 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {notification.action && (
            <div className="flex items-center gap-3 pt-1">
              {notification.actionUrl ? (
                <Link 
                  to={notification.actionUrl}
                  className={`text-xs font-bold transition-colors flex items-center gap-1 ${
                    isCompleted 
                      ? 'text-emerald-400 hover:text-emerald-300' 
                      : 'text-brand-400 hover:text-brand-300 underline underline-offset-4'
                  }`}
                >
                  {actionText} <ArrowRight size={14} />
                </Link>
              ) : (
                <button className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-wider underline underline-offset-4">
                  {notification.action}
                </button>
              )}
              
              {!notification.read && (
                <button 
                  onClick={() => onMarkRead(notification.id)}
                  className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Mark as read
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
