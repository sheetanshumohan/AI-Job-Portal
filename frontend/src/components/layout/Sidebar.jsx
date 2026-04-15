import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileCheck, 
  Bookmark, 
  Calendar, 
  Settings, 
  LogOut,
  X,
  Sparkles,
  User,
  Bell,
  PlusCircle,
  Users,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuthStore();

  const studentItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/student/dashboard' },
    { name: 'My Profile', icon: <User size={20} />, path: '/student/profile' },
    { name: 'My Applications', icon: <FileCheck size={20} />, path: '/student/applications' },
    { name: 'Find Jobs', icon: <Briefcase size={20} />, path: '/student/jobs' },
    { name: 'Saved Jobs', icon: <Bookmark size={20} />, path: '/student/saved' },
    { name: 'Notifications', icon: <Bell size={20} />, path: '/student/notifications' },
    { name: 'Interviews', icon: <Calendar size={20} />, path: '/student/interviews' },
  ];

  const recruiterItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/recruiter/dashboard' },
    { name: 'My Jobs', icon: <Briefcase size={20} />, path: '/recruiter/jobs' },
    { name: 'Post a Job', icon: <PlusCircle size={20} />, path: '/recruiter/jobs/create' },
    { name: 'My Profile', icon: <User size={20} />, path: '/recruiter/profile' },
    { name: 'Notifications', icon: <Bell size={20} />, path: '/recruiter/notifications' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/recruiter/analytics' },
  ];

  const navItems = user?.role === 'recruiter' ? recruiterItems : studentItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20 xl:w-64'}
        glass-sidebar flex flex-col
      `}>
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className={`font-heading font-bold text-xl tracking-tight text-white whitespace-nowrap transition-opacity duration-300 ${!isOpen ? 'lg:opacity-0 xl:opacity-100' : 'opacity-100'}`}>
              Hire<span className="text-brand-400">Sphere</span>
            </span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path.endsWith('/dashboard') || item.path.endsWith('/jobs')}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
              `}
            >
              <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className={`font-medium transition-opacity duration-300 ${!isOpen ? 'lg:opacity-0 xl:opacity-100' : 'opacity-100'}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>


        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-medium"
          >
            <LogOut size={20} />
            <span className={`font-medium transition-opacity duration-300 ${!isOpen ? 'lg:opacity-0 xl:opacity-100' : 'opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
