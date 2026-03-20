import { Bell, X, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { getDueReminders, formatDate } from '../utils/helpers';
import { useMemo } from 'react';

export default function Reminder() {
  const { jobs, dismissReminder, dismissedReminders } = useJobs();

  const dueReminders = useMemo(() => {
    return getDueReminders(jobs).filter(j => !dismissedReminders.includes(j.id));
  }, [jobs, dismissedReminders]);

  if (dueReminders.length === 0) return null;

  return (
    <div className="space-y-3">
      {dueReminders.map(job => (
        <div
          key={job.id}
          className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl animate-slide-up"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
              Follow-up reminder: {job.company}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {job.role} · Due {formatDate(job.reminderDate)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/job/${job.id}`}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 flex items-center gap-1 transition-colors"
            >
              View <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => dismissReminder(job.id)}
              className="p-1 rounded-lg text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-800/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}