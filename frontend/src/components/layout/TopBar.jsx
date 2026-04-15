import { Search, Menu, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const TopBar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  const getInitials = () => {
    if (!user) return '??';
    
    if (user.role === 'recruiter' && user.recruiterName) {
      const parts = user.recruiterName.split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }

    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }

    if (user.firstName) return user.firstName.slice(0, 2).toUpperCase();
    
    return user.email ? user.email.slice(0, 2).toUpperCase() : '??';
  };

  const getName = () => {
    if (!user) return 'Guest';
    if (user.role === 'recruiter') return user.recruiterName || 'Recruiter';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  };

  return (
    <header className="h-20 glass sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 border-b border-slate-700/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-white lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 focus-within:border-brand-500/50 transition-all w-64 md:w-80">
          <Search size={18} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search jobs, articles..." 
            className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-500 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="h-8 w-px bg-slate-700/50" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">
              {getName()}
            </p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              {user?.role || 'Student'}
            </p>
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 p-0.5 shadow-lg shadow-brand-500/20 cursor-pointer hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
              <span className="text-brand-400 font-bold text-sm">
                {getInitials()}
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl transition-all shadow-lg group ml-2"
            title="Logout"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
