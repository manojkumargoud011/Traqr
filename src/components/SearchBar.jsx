import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search company or role...' }) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 dark:text-ink-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}