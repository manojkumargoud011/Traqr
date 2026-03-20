import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { STATUS_CONFIG } from '../utils/helpers';

const COLUMNS = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];

const COLUMN_STYLES = {
  Applied:    { header: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  Shortlisted:{ header: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  Interview:  { header: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  Offer:      { header: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  Rejected:   { header: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
};

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({ job, onDragStart }) {
  const hue = job.company.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const initials = job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Link
      to={`/job/${job.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('jobId', job.id);
        onDragStart(job.id);
      }}
      className="block card p-4 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in select-none"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: `hsl(${hue}, 45%, 45%)` }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">{job.company}</p>
          <p className="text-xs text-ink-400 truncate">{job.role}</p>
        </div>
      </div>

      {job.salary && (
        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2 truncate">
          💰 {job.salary}
        </div>
      )}

      {job.matchScore && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${job.matchScore >= 80 ? 'bg-emerald-500' : job.matchScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${job.matchScore}%` }}
            />
          </div>
          <span className="text-xs font-mono text-ink-500 dark:text-ink-400 shrink-0">{job.matchScore}%</span>
        </div>
      )}

      {job.reminderDate && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          🔔 <span>{job.reminderDate}</span>
        </p>
      )}

      <p className="text-xs text-ink-400 mt-2">{job.date}</p>
    </Link>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanColumn({ status, jobs, onDrop, isDragOver, onDragOver, onDragLeave }) {
  const style = COLUMN_STYLES[status];

  return (
    <div
      className={`flex flex-col min-w-[240px] w-60 shrink-0 rounded-2xl border transition-all duration-200 ${
        isDragOver ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10 scale-[1.01]' : 'border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); onDragOver(status); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(e, status); }}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl border-b ${style.header}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className="text-xs font-bold uppercase tracking-wider">{status}</span>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white/50 dark:bg-black/20">
          {jobs.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 p-3 flex-1 min-h-[200px]">
        {jobs.map(job => (
          <KanbanCard key={job.id} job={job} onDragStart={() => {}} />
        ))}

        {jobs.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8 border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl">
            <p className="text-xs text-ink-300 dark:text-ink-600">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Kanban Page ─────────────────────────────────────────────────────────

export default function KanbanBoard() {
  const { jobs, updateJob } = useJobs();
  const [dragOverCol, setDragOverCol] = useState(null);
  const dragJobId = useRef(null);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = jobs.filter(j => j.status === col);
    return acc;
  }, {});

  const handleDrop = (e, newStatus) => {
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId) updateJob(jobId, { status: newStatus });
    setDragOverCol(null);
    dragJobId.current = null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">Kanban Board</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Drag & drop cards to update status</p>
        </div>
        <Link to="/add" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Job
        </Link>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col}
            status={col}
            jobs={grouped[col]}
            isDragOver={dragOverCol === col}
            onDrop={handleDrop}
            onDragOver={setDragOverCol}
            onDragLeave={() => setDragOverCol(null)}
          />
        ))}
      </div>

      {/* Legend */}
      <p className="text-xs text-ink-400 text-center">
        💡 Tip: Drag cards between columns to instantly update application status
      </p>
    </div>
  );
}