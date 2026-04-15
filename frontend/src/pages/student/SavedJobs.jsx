import { useState, useEffect } from 'react';
import { BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SavedJobCard from '../../components/saved-jobs/SavedJobCard';
import SavedJobsEmpty from '../../components/saved-jobs/SavedJobsEmpty';
import JobFilterSidebar from '../../components/jobs/JobFilterSidebar';
import JobSearchToolbar from '../../components/jobs/JobSearchToolbar';
import { JobGridSkeleton } from '../../components/jobs/JobSkeleton';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('match');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        sort,
        search: search || undefined,
        type: filters.types?.length > 0 ? filters.types.join(',') : undefined,
        level: filters.experience?.length > 0 ? filters.experience.join(',') : undefined,
        minSalary: filters.minSalary > 0 ? filters.minSalary : undefined,
        limit: 10
      };

      const response = await api.get('/student/saved-jobs', { params });
      if (response.data.success) {
        setSavedJobs(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalResults(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
      toast.error('Failed to load your watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [page, sort, filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchSavedJobs();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRemove = async (id) => {
    try {
      const response = await api.post(`/student/toggle-save-job/${id}`);
      if (response.data.success) {
        setSavedJobs(prev => prev.filter(job => (job._id || job.id) !== id));
        setTotalResults(prev => prev - 1);
        toast.success('Job removed from saved');
      }
    } catch (error) {
      toast.error('Failed to remove job');
      console.error('Failed to remove job:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8 pb-12">
        {/* Mobile Filters Toggle */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <JobFilterSidebar 
              filters={filters} 
              setFilters={setFilters} 
              isMobile 
              onClose={() => setIsMobileFiltersOpen(false)} 
            />
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <JobFilterSidebar filters={filters} setFilters={setFilters} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <BookmarkCheck className="text-brand-500" size={28} />
                <h1 className="text-3xl font-bold text-white tracking-tight">Saved Jobs</h1>
              </div>
              <p className="text-slate-500 text-sm pl-0.5">Manage your watchlist and prepare your next big application</p>
            </div>
          </div>

          <JobSearchToolbar 
            search={search} 
            setSearch={setSearch} 
            sort={sort} 
            setSort={setSort}
            totalResults={totalResults}
            toggleMobileFilters={() => setIsMobileFiltersOpen(true)}
          />

          {loading ? (
            <JobGridSkeleton />
          ) : savedJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedJobs.map((job) => (
                  <SavedJobCard 
                    key={job._id || job.id} 
                    job={job} 
                    onRemove={handleRemove} 
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-500 hover:text-white transition-all disabled:opacity-50"
                    disabled={page === 1}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button 
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border ${
                          page === p 
                          ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/20' 
                          : 'bg-slate-900 border-slate-700/50 text-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-2 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-500 hover:text-white transition-all disabled:opacity-50"
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <SavedJobsEmpty />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SavedJobs;
