import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-slate-700/50 shadow-2xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-brand-400">
          {payload[0].value} {payload[0].dataKey === 'applicants' || payload[0].dataKey === 'count' ? 'Applicants' : 'Total'}
        </p>
      </div>
    );
  }
  return null;
};

const JobAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    applicantTrends: [],
    roleDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/recruiter/analytics');
        if (response.data.success) {
          const rawData = response.data.data;
          
          // Map backend trends to frontend format
          const mappedTrends = rawData.applicationsTrendData?.map(d => ({
            name: d.day,
            applicants: d.applications
          })) || [];

          // Map top jobs to role distribution format
          const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];
          const mappedRoles = rawData.topJobsData?.map((j, idx) => ({
            name: j.title,
            count: j.applicants,
            color: colors[idx % colors.length]
          })) || [];

          setAnalytics({
            applicantTrends: mappedTrends,
            roleDistribution: mappedRoles
          });
        }
      } catch (err) {
        console.error('Failed to fetch recruiter analytics:', err);
        setError('Failed to load real-time analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map(i => (
          <div key={i} className="glass-card p-6 border border-slate-700/50 h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border border-rose-500/20 bg-rose-500/5 flex flex-col items-center justify-center text-center">
           <AlertCircle className="text-rose-500 mb-4" size={40} />
           <p className="text-white font-bold">{error}</p>
           <p className="text-slate-400 text-sm mt-1">Please ensure your backend server is running and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Applicant Trends Area Chart */}
      <div className="glass-card p-6 border border-slate-700/50 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Applicant Trends</h3>
            <p className="text-xs text-slate-500 font-medium">Daily application volume for last 7 days</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 text-[10px] font-bold text-emerald-400 px-3 py-1.5 rounded-lg">
            LIVE DATA
          </div>
        </div>
        
        <div className="flex-1 w-full h-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.applicantTrends}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="applicants" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorApps)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role Distribution Bar Chart */}
      <div className="glass-card p-6 border border-slate-700/50 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Role Distribution</h3>
            <p className="text-xs text-slate-500 font-medium">Applicants breakdown by job posting</p>
          </div>
        </div>

        <div className="flex-1 w-full h-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.roleDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {analytics.roleDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;
