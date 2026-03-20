import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, List, Inbox } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import JobCard from '../components/JobCard';
import SearchBar from '../components/Searchbar';
import Filters from '../components/Filters';
import { StatusBadge } from '../components/JobCard';
import { sortJobs, formatDate } from '../utils/helpers';

// ─── Table Row ─────────────────────────────────────────────────────────────────

function JobRow({ job }) {
  return (
    <Link
      to={`/job/${job.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors border-b border-ink-50 dark:border-ink-800 last:border-0 group"
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: `hsl(${job.company.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 45%, 45%)` }}
      >
        {job.company.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{job.company}</p>
        <p className="text-xs text-ink-400 truncate">{job.role}</p>
      </div>
      <StatusBadge status={job.status} />
      <span className="text-xs text-ink-400 hidden sm:block shrink-0">{formatDate(job.date)}</span>
    </Link>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }) {
  return (
    <div className="card p-12 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
        <Inbox className="w-7 h-7 text-ink-400" />
      </div>
      <div>
        <p className="font-semibold text-ink-900 dark:text-white">
          {hasFilters ? 'No matching jobs' : 'No applications yet'}
        </p>
        <p className="text-sm text-ink-400 mt-1">
          {hasFilters ? 'Try adjusting your filters or search query' : 'Start tracking your job search journey'}
        </p>
      </div>
      {!hasFilters && (
        <Link to="/add" className="btn-primary">
          <Plus className="w-4 h-4" /> Add your first job
        </Link>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AllJobs() {
  const { jobs } = useJobs();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', sortBy: 'date-desc' });
  const [view, setView] = useState('grid'); // 'grid' | 'table'

  const filtered = useMemo(() => {
    let result = jobs;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter(j => j.status === filters.status);
    }

    // Sort
    return sortJobs(result, filters.sortBy);
  }, [jobs, search, filters]);

  const hasFilters = search.trim() || filters.status;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">All Jobs</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            {filtered.length} of {jobs.length} application{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white dark:bg-ink-700 shadow-sm' : 'text-ink-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-white dark:bg-ink-700 shadow-sm' : 'text-ink-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Link to="/add" className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Job
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} />
        <Filters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState hasFilters={!!hasFilters} />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-ink-50 dark:bg-ink-800/50 border-b border-ink-100 dark:border-ink-700">
            <div className="w-8 shrink-0" />
            <p className="flex-1 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">Company / Role</p>
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">Status</p>
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider hidden sm:block">Date</p>
          </div>
          {filtered.map(job => <JobRow key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}