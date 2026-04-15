import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  UserCheck, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  Loader2
} from 'lucide-react';

import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../lib/axios';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-bold text-white">
          {payload[0].value} <span className="text-xs font-medium text-slate-400">Applications</span>
        </p>
      </div>
    );
  }
  return null;
};

const RecruiterAnalytics = () => {
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/recruiter/analytics');
        setAnalyticsData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Analyzing recruitment patterns...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
            <BarChart3 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Unavailable</h2>
          <p className="text-slate-500 max-w-md mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
          >
            Retry Fetch
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const {
    applicationsTrendData,
    hiringFunnelData,
    jobStatusData,
    candidateQualityData,
    topJobsData,
    kpis
  } = analyticsData;

  const totalJobs = jobStatusData.reduce((acc, curr) => acc + curr.value, 0);

  const kpiCards = [
    { label: 'Total Applicants', value: kpis.totalApplicants, trend: '+12.5%', isUp: true, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Active Postings', value: kpis.activePostings, trend: '+2', isUp: true, icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Avg. Match Score', value: kpis.avgMatchScore, trend: '-2.4%', isUp: false, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Hiring Velocity', value: kpis.hiringVelocity, trend: '-2d', isUp: true, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  const handleExportData = () => {
    if (!analyticsData) return;

    const { kpis, hiringFunnelData, applicationsTrendData } = analyticsData;
    
    // Create CSV content
    let csvContent = "Recruitment Analytics Report\n";
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    // KPIs Section
    csvContent += "SECTION: Key Performance Indicators\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Applicants,${kpis.totalApplicants}\n`;
    csvContent += `Active Postings,${kpis.activePostings}\n`;
    csvContent += `Avg. Match Score,${kpis.avgMatchScore}\n`;
    csvContent += `Hiring Velocity,${kpis.hiringVelocity}\n\n`;

    // Funnel Section
    csvContent += "SECTION: Hiring Funnel\n";
    csvContent += "Stage,Count\n";
    hiringFunnelData.forEach(stage => {
      csvContent += `${stage.stage},${stage.count}\n`;
    });
    csvContent += "\n";

    // Application Velocity Section
    csvContent += "SECTION: Weekly Application Velocity\n";
    csvContent += "Day,Applications,Growth (%)\n";
    applicationsTrendData.forEach(day => {
      csvContent += `${day.day},${day.applications},${day.growth}%\n`;
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Recruitment_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-10 pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 sm:px-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand-600/10 rounded-2xl border border-brand-500/20">
                <BarChart3 className="text-brand-400" size={24} />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Talent Insights</h1>
            </div>
            <p className="text-slate-500 font-medium">Visualization and deep-dive analytics of your recruitment funnel</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-slate-900 border border-slate-700/50 rounded-2xl px-6 py-3.5 text-sm font-bold text-white outline-none focus:border-brand-500 transition-all appearance-none pr-12 cursor-pointer shadow-xl"
                >
                   <option>Last 7 Days</option>
                </select>
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
             </div>
             
             <button 
               onClick={handleExportData}
               className="flex items-center gap-2.5 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-brand-600/20 group"
             >
                <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                Export Data
             </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4 sm:px-0">
           {kpiCards.map((kpi, idx) => (
             <motion.div 
               key={kpi.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="glass-card p-6 border border-slate-700/50 flex flex-col justify-between group hover:border-brand-500/30 transition-all duration-300"
             >
                <div className="flex items-start justify-between">
                   <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                      <kpi.icon size={22} />
                   </div>
                   <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${kpi.isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                      {kpi.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {kpi.trend}
                   </div>
                </div>
                <div className="mt-6">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                   <p className="text-3xl font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">{kpi.value}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Charts Section 1: Main Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-4 sm:px-0">
           
           {/* Application Trend Chart */}
           <div className="xl:col-span-2 glass-card p-8 border border-slate-700/50 min-h-[450px] flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-xl font-bold text-white">Application Velocity</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Volume of candidates over the last week</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Applicants</span>
                    </div>
                 </div>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={applicationsTrendData}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorApps)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Hiring Funnel Card */}
           <div className="glass-card p-8 border border-slate-700/50 flex flex-col min-h-[450px]">
              <h3 className="text-xl font-bold text-white mb-2">Hiring Funnel</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-10">Candidate drop-off across stages</p>
              
              <div className="flex-1 space-y-6">
                 {hiringFunnelData.map((stage, idx) => (
                   <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stage.stage}</span>
                         <span className="text-sm font-bold text-white">{stage.count}</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${hiringFunnelData[0].count > 0 ? (stage.count / hiringFunnelData[0].count) * 100 : 0}%` }}
                           transition={{ duration: 1.5, delay: idx * 0.1 }}
                           style={{ backgroundColor: stage.color }}
                           className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                         />
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Conversion</p>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">
                      {hiringFunnelData[0].count > 0 ? ((hiringFunnelData[3].count / hiringFunnelData[0].count) * 100).toFixed(1) : '0'}%
                    </p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Screened</p>
                    <p className="text-lg font-bold text-indigo-400 mt-0.5">
                      {hiringFunnelData[0].count > 0 ? ((hiringFunnelData[1].count / hiringFunnelData[0].count) * 100).toFixed(1) : '0'}%
                    </p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Time/Hire</p>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">{kpis.hiringVelocity}</p>
                 </div>
              </div>
           </div>

        </div>

        {/* Charts Section 2: Distribution & Rankings */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-4 sm:px-0">
           
           {/* Job Distribution Pie */}
           <div className="glass-card p-8 border border-slate-700/50 min-h-[400px] flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Postings Health</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-6">Distribution of job statuses</p>
              
              <div className="flex-1 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={jobStatusData}
                         innerRadius={70}
                         outerRadius={100}
                         paddingAngle={8}
                         dataKey="value"
                         animationDuration={2000}
                       >
                         {jobStatusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                         itemStyle={{ color: '#f8fafc', fontWeight: 700 }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">{totalJobs}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Total Jobs</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                 {jobStatusData.map(item => (
                   <div key={item.name} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{item.name}</span>
                      <span className="text-xs font-bold text-white ml-auto">{item.value}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Top Performing Jobs */}
           <div className="xl:col-span-2 glass-card p-8 border border-slate-700/50 min-h-[400px]">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-xl font-bold text-white">High Performing Postings</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Most active job listings by candidate volume</p>
                 </div>
                 <button className="text-[10px] font-bold text-brand-400 uppercase tracking-widest hover:underline">View All</button>
              </div>
              
              <div className="space-y-5">
                 {topJobsData.map((job, idx) => (
                   <div key={job.title} className="flex items-center gap-6 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 group hover:border-brand-500/30 transition-all">
                      <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 font-bold text-xs ring-1 ring-brand-500/20">
                         0{idx + 1}
                      </div>
                      <div className="flex-1">
                         <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{job.title}</h4>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Technology Recruitment</p>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-bold text-white">{job.applicants} <span className="text-[10px] text-slate-500">Apps</span></p>
                         <div className="flex items-center gap-1 justify-end text-[9px] font-bold text-emerald-400 uppercase mt-1">
                            <TrendingUp size={10} /> +{job.growth}%
                         </div>
                      </div>
                   </div>
                 ))}
                 {topJobsData.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-10 text-slate-500 italic text-sm">
                      No recruitment activity recorded yet
                   </div>
                 )}
              </div>
           </div>

        </div>

        {/* Charts Section 3: Talent Quality Breakdown */}
        <div className="glass-card p-10 border border-slate-700/50 mb-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-md">
                 <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <UserCheck className="text-emerald-400" /> Talent Quality Index
                 </h3>
                 <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    Analysis of candidate selection rates. A higher shortlisted ratio indicates better AI-match performance and JD alignment.
                 </p>
                 
                 <div className="space-y-6">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                          <TrendingUp size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Accuracy</p>
                          <p className="text-xl font-bold text-white">{kpis.avgMatchScore} <span className="text-xs text-emerald-400 font-bold tracking-normal">+5% WoW</span></p>
                       </div>
                    </div>
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400 shadow-lg shadow-brand-500/10">
                          <Filter size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Screening Ratio</p>
                          <p className="text-xl font-bold text-white">1:{Math.round(parseInt(kpis.totalApplicants.replace(/,/g, '')) / (candidateQualityData[0].value || 1))} <span className="text-xs text-slate-400 font-bold ml-2">Candidates/Hire</span></p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 w-full h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={candidateQualityData} layout="vertical" barSize={40}>
                       <XAxis type="number" hide />
                       <YAxis 
                         dataKey="name" 
                         type="category" 
                         axisLine={false} 
                         tickLine={false}
                         tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                         width={100}
                       />
                       <Tooltip 
                         cursor={{ fill: 'transparent' }}
                         contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                       />
                       <Bar 
                         dataKey="value" 
                         radius={[0, 20, 20, 0]}
                         animationDuration={2500}
                       >
                          {candidateQualityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default RecruiterAnalytics;
