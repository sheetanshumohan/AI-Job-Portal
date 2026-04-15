import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

const JobSearchToolbar = ({ search, setSearch, sort, setSort, totalResults, toggleMobileFilters }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Search by job title, company, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700/50 rounded-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all shadow-xl"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMobileFilters}
            className="lg:hidden p-4 bg-slate-900 border border-slate-700/50 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            <SlidersHorizontal size={20} />
          </button>
          
          <div className="relative flex-1 md:flex-none">
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none w-full md:w-48 pl-4 pr-10 py-4 bg-slate-900 border border-slate-700/50 rounded-2xl text-slate-300 text-sm font-bold focus:outline-none focus:border-brand-500 cursor-pointer shadow-xl transition-all"
            >
              <option value="match">Best Match</option>
              <option value="latest">Latest First</option>
              <option value="salary">Highest Salary</option>
              <option value="experience">Experience Level</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-500">
          Showing <span className="text-white font-bold">{totalResults}</span> job opportunities
        </p>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>
    </div>
  );
};

export default JobSearchToolbar;
