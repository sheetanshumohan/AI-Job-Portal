import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, User, LogOut, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Jobs', path: '/jobs' },
  { name: 'Features', path: '/features' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 ease-in-out border-b ${
        scrolled 
          ? 'bg-surface/60 backdrop-blur-md border-slate-700/50 shadow-lg' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-brand-500/20 p-2.5 rounded-xl group-hover:bg-brand-500/30 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                <Briefcase className="h-6 w-6 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                AI Job Portal
              </span>
            </Link>
          </div>

          {/* Desktop Nav - Centered with underline animations */}
          <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="relative group text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-400 transition-all duration-300 ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <Link 
                  to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'} 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface/50 border border-slate-700 hover:border-slate-500 hover:bg-surface text-sm font-medium text-slate-200 transition-all shadow-sm"
                >
                  <User className="h-4 w-4 text-brand-400" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all group"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                >
                  Log in
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-surface/50 focus:outline-none transition-colors border border-transparent hover:border-slate-700"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-b border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`block text-lg font-medium transition-colors ${
                    location.pathname === link.path ? 'text-brand-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-slate-800 my-4" />
              
              {isAuthenticated ? (
                <div className="space-y-4">
                  <Link 
                    to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'} 
                    className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-white"
                  >
                    <User className="h-5 w-5 text-brand-400" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex w-full items-center gap-3 text-lg font-medium text-red-400 hover:text-red-300 text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4 pt-2">
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center w-full px-5 py-3 rounded-xl bg-surface border border-slate-700 text-white text-base font-medium hover:bg-slate-800 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center justify-center w-full px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-base font-semibold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
