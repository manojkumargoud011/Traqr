import { useJobs } from '../context/JobContext';
import { LogOut, Mail, User, Briefcase, Award } from 'lucide-react';
import { computeStats } from '../utils/helpers';
import { useMemo } from 'react';

export default function Profile() {
  const { user, logout, jobs } = useJobs();
  const stats = useMemo(() => computeStats(jobs), [jobs]);

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">
        Profile
      </h1>

      {/* User Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-ink-900 dark:bg-amber-400 flex items-center justify-center">
            <span className="text-white dark:text-ink-950 text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold text-ink-900 dark:text-white text-lg">
              {user?.displayName || 'User'}
            </p>
            <p className="text-sm text-ink-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-5 space-y-3">
        <p className="font-semibold text-ink-900 dark:text-white text-sm">
          Your Stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Applied', value: stats.total, icon: '📤' },
            { label: 'Interviews', value: `${stats.interviewRate}%`, icon: '🎤' },
            { label: 'Offers', value: `${stats.offerRate}%`, icon: '🎉' },
            { label: 'Rejections', value: `${stats.rejectionRate}%`, icon: '❌' },
          ].map(s => (
            <div
              key={s.label}
              className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 text-center"
            >
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-xl font-bold font-display text-ink-900 dark:text-white">
                {s.value}
              </p>
              <p className="text-xs text-ink-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

    </div>
  );
}