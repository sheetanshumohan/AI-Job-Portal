import { Check } from 'lucide-react';

const ApplicationTimeline = ({ currentStage }) => {
  const stages = [
    { id: 'applied', label: 'Applied' },
    { id: 'review', label: 'Review' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' }
  ];

  const currentIdx = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="flex items-center justify-between w-full relative pt-8 pb-4">
      {/* Background Line */}
      <div className="absolute top-[41px] left-0 right-0 h-[2px] bg-slate-800 -z-10" />
      
      {stages.map((stage, idx) => {
        const isCompleted = idx < currentIdx || (idx === currentIdx && currentIdx === stages.length - 1);
        const isActive = idx === currentIdx && !isCompleted;
        const isPast = idx <= currentIdx;

        return (
          <div key={stage.id} className="flex flex-col items-center gap-3 relative flex-1">
            <div 
              className={`
                w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-500
                ${isCompleted 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : isActive 
                    ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30' 
                    : 'bg-slate-900 border-slate-700 text-slate-500'}
              `}
            >
              {isCompleted ? <Check size={10} strokeWidth={4} /> : (
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-700'}`} />
              )}
            </div>
            <span className={`
              text-[8px] font-bold uppercase tracking-widest absolute -top-4
              ${isPast ? 'text-slate-300' : 'text-slate-600'}
            `}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationTimeline;
