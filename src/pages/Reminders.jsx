import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { getDueReminders, formatDate, formatRelative, STATUS_CONFIG } from '../utils/helpers';
import { StatusBadge } from '../components/JobCard';

export default function RemindersPage() {
  const { jobs, dismissReminder, dismissedReminders } = useJobs();

  const dueReminders = useMemo(() => getDueReminders(jobs).filter(j => !dismissedReminders.includes(j.id)), [jobs, dismissedReminders]);
  const upcomingReminders = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    return jobs.filter(j => {
      if (!j.reminderDate || dismissedReminders.includes(j.id)) return false;
      const rem = new Date(j.reminderDate); rem.setHours(0,0,0,0);
      return rem > today;
    }).sort((a, b) => a.reminderDate.localeCompare(b.reminderDate));
  }, [jobs, dismissedReminders]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">Reminders</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Follow-ups and interview alerts</p>
      </div>

      {/* Due Now */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-ink-900 dark:text-white text-sm">Due Now</h2>
          {dueReminders.length > 0 && (
            <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg">{dueReminders.length}</span>
          )}
        </div>

        {dueReminders.length === 0 ? (
          <div className="card p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">All caught up!</p>
            <p className="text-xs text-ink-400 mt-1">No overdue reminders right now</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dueReminders.map(job => (
              <div key={job.id} className="card p-4 flex items-center gap-4 border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink-900 dark:text-white truncate">{job.company}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{job.role}</p>
                </div>
                <StatusBadge status={job.status} />
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/job/${job.id}`} className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 flex items-center gap-1 transition-colors">
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => dismissReminder(job.id)}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    title="Dismiss reminder"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section className="space-y-3">
        <h2 className="font-semibold text-ink-900 dark:text-white text-sm">Upcoming</h2>

        {upcomingReminders.length === 0 ? (
          <div className="card p-6 text-center space-y-3">
            <Calendar className="w-8 h-8 text-ink-300 dark:text-ink-600 mx-auto" />
            <p className="text-sm text-ink-500 dark:text-ink-400">No upcoming reminders</p>
            <Link to="/add" className="btn-secondary text-xs inline-flex">
              <Plus className="w-3.5 h-3.5" /> Add job with reminder
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingReminders.map(job => (
              <Link
                key={job.id}
                to={`/job/${job.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-sm transition-shadow group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">{job.company}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{job.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{formatDate(job.reminderDate)}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{formatRelative(job.reminderDate)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}