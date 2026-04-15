const JobSkeleton = () => {
  return (
    <div className="glass-card p-6 border border-slate-700/50 flex flex-col h-full animate-pulse">
      <div className="flex gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-800 rounded-md w-3/4" />
          <div className="h-3 bg-slate-800 rounded-md w-1/4" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 bg-slate-800 rounded-md w-full" />
        ))}
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 bg-slate-800 rounded-full w-16" />
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-700/30 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-slate-800 rounded-xl" />
          <div className="flex-1 h-10 bg-slate-800 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <div className="w-12 h-12 bg-slate-800 rounded-xl" />
          <div className="flex-1 h-12 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const JobGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <JobSkeleton key={i} />
    ))}
  </div>
);

export default JobSkeleton;
