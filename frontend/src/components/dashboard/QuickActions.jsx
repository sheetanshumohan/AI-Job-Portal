import { FileText, Search, Briefcase, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { 
    title: 'Analyze Resume', 
    desc: 'Get AI score & tips', 
    icon: <FileText className="text-brand-400" size={24} />, 
    color: 'from-brand-500/10 to-transparent',
    border: 'hover:border-brand-500/50',
    path: '/student/profile'
  },
  { 
    title: 'Browse Jobs', 
    desc: 'Find your next role', 
    icon: <Search className="text-emerald-400" size={24} />, 
    color: 'from-emerald-500/10 to-transparent',
    border: 'hover:border-emerald-500/50',
    path: '/student/jobs'
  },
  { 
    title: 'Track Apps', 
    desc: 'Manage applications', 
    icon: <Briefcase className="text-blue-400" size={24} />, 
    color: 'from-blue-500/10 to-transparent',
    border: 'hover:border-blue-500/50',
    path: '/student/applications'
  },
  { 
    title: 'Mock Interview', 
    desc: 'Practice with AI', 
    icon: <Briefcase className="text-amber-400" size={24} />, 
    color: 'from-amber-500/10 to-transparent',
    border: 'hover:border-amber-500/50',
    path: '/student/jobs' // Direct them to browse jobs to start an interview
  },
];

const QuickActions = ({ onAnalyze }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actions.map((action, index) => {
        const isAnalyzeAction = index === 0;
        
        const content = (
          <div className="flex items-start gap-4 h-full">
            <div className="p-2.5 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform shrink-0">
              {action.icon}
            </div>
            <div>
              <h4 className="text-white font-bold group-hover:text-white transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {action.desc}
              </p>
            </div>
          </div>
        );

        if (isAnalyzeAction) {
          return (
            <button
              key={action.title}
              onClick={onAnalyze}
              className={`flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br ${action.color} border border-slate-700/50 ${action.border} transition-all group text-left w-full`}
            >
              {content}
            </button>
          );
        }

        return (
          <Link 
            key={action.title}
            to={action.path}
            className={`flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br ${action.color} border border-slate-700/50 ${action.border} transition-all group text-left`}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;
