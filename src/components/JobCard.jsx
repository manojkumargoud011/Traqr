import { Link } from 'react-router-dom';
import { Calendar, FileText, Bell, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { formatDate, formatRelative, STATUS_CONFIG } from '../utils/helpers';
import { useJobs } from '../context/JobContext';

// ─── Company Avatar ────────────────────────────────────────────────────────────

const CompanyAvatar = ({ company }) => {
  const initials = company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = company.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
      style={{ backgroundColor: `hsl(${hue}, 45%, 45%)` }}
    >
      {initials}
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────

export const StatusBadge = ({ status }) => {
  const colors = {
    Applied:     'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    Shortlisted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    Interview:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    Offer:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    Rejected:    'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
  };

  const dots = {
    Applied:     'bg-blue-500',
    Shortlisted: 'bg-amber-500',
    Interview:   'bg-yellow-500',
    Offer:       'bg-emerald-500',
    Rejected:    'bg-rose-500',
  };

  const emojis = {
    Applied:     '📤',
    Shortlisted: '⭐',
    Interview:   '🎤',
    Offer:       '🎉',
    Rejected:    '❌',
  };

  return (
    <span className={`status-badge ${colors[status] || colors.Applied}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.Applied}`} />
      {emojis[status]} {status}
    </span>
  );
};

// ─── Job Card ─────────────────────────────────────────────────────────────────

export default function JobCard({ job }) {
  const { deleteJob } = useJobs();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Remove ${job.company} application?`)) {
      deleteJob(job.id);
    }
  };

  const hasReminder = job.reminderDate;

  return (
    <Link
      to={`/job/${job.id}`}
      className="card group p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in block"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <CompanyAvatar company={job.company} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink-900 dark:text-white text-sm leading-tight truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {job.company}
          </h3>
          <p className="text-ink-500 dark:text-ink-400 text-xs mt-0.5 truncate">{job.role}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-ink-400 dark:text-ink-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(job.date)}
        </span>
        {job.notes && (
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Notes
          </span>
        )}
        {hasReminder && (
          <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
            <Bell className="w-3.5 h-3.5" />
            Reminder
          </span>
        )}
      </div>

      {/* Notes preview */}
      {job.notes && (
        <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-2 leading-relaxed border-t border-ink-50 dark:border-ink-800 pt-3">
          {job.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-ink-50 dark:border-ink-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-xs text-ink-400 dark:text-ink-500">
          {formatRelative(job.createdAt)}
        </span>
        <div className="flex items-center gap-1">
          <span className="btn-ghost text-xs py-1 px-2">
            <ExternalLink className="w-3.5 h-3.5" />
            View
          </span>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-ink-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
}