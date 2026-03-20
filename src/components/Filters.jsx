import { Filter, X, ArrowUpDown } from 'lucide-react';
import { STATUS_OPTIONS } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'company', label: 'Company A–Z' },
  { value: 'status', label: 'Status' },
];

export default function Filters({ filters, onFiltersChange }) {
  const { status, sortBy } = filters;

  const setStatus = (val) => onFiltersChange({ ...filters, status: val === status ? '' : val });
  const setSortBy = (e) => onFiltersChange({ ...filters, sortBy: e.target.value });
  const clearAll = () => onFiltersChange({ status: '', sortBy: 'date-desc' });

  const hasActiveFilters = status || sortBy !== 'date-desc';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              status === s
                ? 'bg-ink-900 dark:bg-amber-400 text-white dark:text-ink-950'
                : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="relative ml-auto">
        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400 pointer-events-none" />
        <select
          value={sortBy}
          onChange={setSortBy}
          className="input pl-9 py-2 text-xs min-w-[140px] cursor-pointer appearance-none"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button onClick={clearAll} className="btn-ghost text-xs px-3 py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}