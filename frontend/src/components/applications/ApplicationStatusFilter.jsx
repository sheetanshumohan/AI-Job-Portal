import { motion } from 'framer-motion';

const ApplicationStatusFilter = ({ activeTab, setActiveTab, counts }) => {
  const tabs = [
    { id: 'all', label: 'All Applications', count: counts?.all || 0 },
    { id: 'applied', label: 'Applied', count: counts?.applied || 0 },
    { id: 'interview', label: 'Interviewing', count: counts?.interview || 0 },
    { id: 'offer', label: 'Offer', count: counts?.offer || 0 },
    { id: 'rejected', label: 'Rejected', count: counts?.rejected || 0 }
  ];


  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900/50 border border-slate-700/50 rounded-2xl w-fit overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap
              ${isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            {isActive && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-brand-600/10 border border-brand-500/20 rounded-xl -z-10"
              />
            )}
            {tab.label}
            <span className={`
              px-1.5 py-0.5 rounded-lg text-[10px] border 
              ${isActive ? 'bg-brand-500/20 border-brand-500/20 text-brand-400' : 'bg-slate-800 border-slate-700 text-slate-500'}
            `}>
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ApplicationStatusFilter;
