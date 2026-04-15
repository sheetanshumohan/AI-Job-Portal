import { motion } from 'framer-motion';
import { Bookmark, Search, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedJobsEmpty = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border border-slate-700/50"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700">
          <Bookmark size={40} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-brand-600 border-4 border-slate-950 flex items-center justify-center text-white shadow-xl">
          <Search size={16} strokeWidth={3} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">Your watchlist is empty</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
        You haven't saved any jobs yet. Browse our intelligent listings to find your perfect match.
      </p>

      <Link 
        to="/student/jobs"
        className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-600/30 group"
      >
        <Briefcase size={18} /> Explore Jobs
      </Link>
    </motion.div>
  );
};

export default SavedJobsEmpty;
