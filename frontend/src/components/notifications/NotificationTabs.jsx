import { motion } from 'framer-motion';

const NotificationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'jobs', label: 'Job Alerts' },
    { id: 'apps', label: 'Applications' },
    { id: 'system', label: 'System' }
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
              relative px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap
              ${isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            {isActive && (
              <motion.div 
                layoutId="activeTabNotify"
                className="absolute inset-0 bg-brand-600/10 border border-brand-500/20 rounded-xl -z-10"
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default NotificationTabs;
