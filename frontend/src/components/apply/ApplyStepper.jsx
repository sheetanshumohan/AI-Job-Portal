import { Check } from 'lucide-react';

const ApplyStepper = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 -z-10" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 -z-10 transition-all duration-500 ease-in-out" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div key={step} className="flex flex-col items-center gap-3 relative">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' 
                    : isActive 
                      ? 'bg-slate-900 border-brand-500 text-brand-400 shadow-lg shadow-brand-500/10 scale-110' 
                      : 'bg-slate-900 border-slate-700 text-slate-500'}
                `}
              >
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{stepNumber}</span>}
              </div>
              <span className={`
                text-[10px] uppercase tracking-widest font-bold whitespace-nowrap hidden sm:block
                ${isActive ? 'text-brand-400' : 'text-slate-500'}
              `}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplyStepper;
