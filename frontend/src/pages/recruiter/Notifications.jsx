import { useState, useEffect } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import NotificationTabs from '../../components/notifications/NotificationTabs';
import NotificationCard from '../../components/notifications/NotificationCard';
import NotificationsEmpty from '../../components/notifications/NotificationsEmpty';
import api from '../../lib/axios';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " secs ago";
};

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      // Map backend data to frontend expected structure
      const mapped = response.data.data.map(n => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        time: timeAgo(n.createdAt),
        read: n.read,
        action: n.action,
        actionUrl: n.actionUrl
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error('Fetch Notifications Error:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification removed');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'unread' && !n.read) ||
      (activeTab === n.type);
    
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                         n.message.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="relative">
                 <Bell className="text-brand-500" size={28} />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-950 text-[8px] font-bold flex items-center justify-center text-white">
                      {unreadCount}
                   </span>
                 )}
               </div>
               <h1 className="text-3xl font-bold text-white tracking-tight">Recruiter Alerts</h1>
            </div>
            <p className="text-slate-500 text-sm">Monitor candidate applications and screening progress</p>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={handleMarkAllRead}
               disabled={unreadCount === 0 || loading}
               className="flex items-center gap-2 px-5 py-2.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <CheckCheck size={16} /> Mark all as read
             </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 sm:px-0">
          <NotificationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="relative group min-w-[300px]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
               <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700/50 rounded-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-all shadow-xl"
            />
          </div>
        </div>

        {/* List Section */}
        <div className="grid grid-cols-1 gap-4 px-4 sm:px-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif) => (
                <NotificationCard 
                  key={notif.id}
                  notification={notif}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          ) : (
            <NotificationsEmpty />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
