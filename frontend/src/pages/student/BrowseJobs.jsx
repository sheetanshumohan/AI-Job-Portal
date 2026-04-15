import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobFilterSidebar from '../../components/jobs/JobFilterSidebar';
import JobSearchToolbar from '../../components/jobs/JobSearchToolbar';
import JobCard from '../../components/jobs/JobCard';
import { JobGridSkeleton } from '../../components/jobs/JobSkeleton';
import EmptyJobs from '../../components/jobs/EmptyJobs';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const BrowseJobs = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('match');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/student/saved-jobs');
      if (response.data.success) {
        setSavedJobIds(response.data.data.map(job => job._id || job.id));
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
    }
  };

  const fetchJobs = async () => {
    setIsLoading(true);
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

      const response = await api.get('/jobs', { params });
      if (response.data.success) {
        setJobs(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalResults(response.data.pagination.total);
      }
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (jobId) => {
    if (!user) {
      toast.error('Please log in to save jobs');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can save jobs');
      return;
    }

    try {
      const response = await api.post(`/student/toggle-save-job/${jobId}`);
      if (response.data.success) {
        if (response.data.isSaved) {
          setSavedJobIds(prev => [...prev, jobId]);
          toast.success('Job saved successfully');
        } else {
          setSavedJobIds(prev => prev.filter(id => id !== jobId));
          toast.success('Job removed from saved');
        }
      }
    } catch (error) {
      toast.error('Failed to update saved jobs');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, sort, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchJobs();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);


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
          <JobSearchToolbar 
            search={search} 
            setSearch={setSearch} 
            sort={sort} 
            setSort={setSort}
            totalResults={totalResults}
            toggleMobileFilters={() => setIsMobileFiltersOpen(true)}
          />

          {isLoading ? (
            <JobGridSkeleton />
          ) : jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard 
                    key={job._id || job.id} 
                    job={job} 
                    isSaved={savedJobIds.includes(job._id || job.id)}
                    onSave={() => handleToggleSave(job._id || job.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
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
            </>
          ) : (
            <EmptyJobs onReset={() => { setSearch(''); setFilters({}); }} />
          )}

        </div>

      </div>
    </DashboardLayout>
  );
};

export default BrowseJobs;
