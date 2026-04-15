import { Search, MapPin, Briefcase, DollarSign, Filter, X } from 'lucide-react';

const JobFilterSidebar = ({ filters, setFilters, isMobile, onClose }) => {
  const categories = ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'DevOps', 'Mobile', 'UI/UX'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
  const experienceLevels = ['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'];

  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  return (
    <aside className={`
      ${isMobile ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-6 overflow-y-auto' : 'w-72 flex-shrink-0 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-4'}
      space-y-8 custom-scrollbar
    `}>
      {isMobile && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Filter size={20} className="text-brand-400" /> Filters
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 group cursor-pointer">
              <input 
                type="checkbox" 
                checked={filters.categories?.includes(cat)}
                onChange={() => handleCheckboxChange('categories', cat)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 transition-all"
              />
              <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type Filter */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center gap-3 group cursor-pointer">
              <input 
                type="checkbox" 
                checked={filters.types?.includes(type)}
                onChange={() => handleCheckboxChange('types', type)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 transition-all"
              />
              <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Salary Range</h3>
        <div className="px-2 pt-2">
          <input 
            type="range" 
            min="0" 
            max="200" 
            step="10"
            value={filters.minSalary || 0}
            onChange={(e) => setFilters(prev => ({ ...prev, minSalary: e.target.value }))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
          <div className="flex items-center justify-between mt-2 text-xs font-medium text-slate-500 tracking-tighter">
            <span>$0k</span>
            <span className="text-brand-400 text-sm font-bold">${filters.minSalary || 0}k+</span>
            <span>$200k</span>
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Experience</h3>
        <div className="grid grid-cols-2 gap-2">
          {experienceLevels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleCheckboxChange('experience', lvl)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                filters.experience?.includes(lvl)
                  ? 'bg-brand-600/10 border-brand-500/50 text-brand-400'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => setFilters({})} 
        className="w-full py-3 text-xs font-bold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
      >
        Reset Filters
      </button>
    </aside>
  );
};

export default JobFilterSidebar;
