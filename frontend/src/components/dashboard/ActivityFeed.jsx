import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Eye, MessageSquare, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await api.get('/student/activity');
        if (response.data.success) {
          setActivities(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'status': return <CheckCircle2 className="text-emerald-400" size={16} />;
      case 'view': return <Eye className="text-blue-400" size={16} />;
      case 'message': return <MessageSquare className="text-purple-400" size={16} />;
      case 'pending': return <Clock className="text-amber-400" size={16} />;
      default: return <Clock className="text-slate-400" size={16} />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'status': return 'bg-emerald-500/10';
      case 'view': return 'bg-blue-500/10';
      case 'message': return 'bg-purple-500/10';
      case 'pending': return 'bg-amber-500/10';
      default: return 'bg-slate-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4 group cursor-pointer">
          <div className={`w-10 h-10 rounded-xl ${getColor(activity.type)} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            {getIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                {activity.title}
              </h4>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                {activity.time}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {activity.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
