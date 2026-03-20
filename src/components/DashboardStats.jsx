import { TrendingUp, Send, Award, XCircle, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, suffix = '', color, trend }) => (
  <div className="card p-5 flex flex-col gap-3 animate-slide-up hover:shadow-md transition-shadow duration-300">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-3xl font-bold font-display text-ink-900 dark:text-white tracking-tight">
        {value}<span className="text-lg font-sans text-ink-400">{suffix}</span>
      </p>
      <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{label}</p>
    </div>
  </div>
);

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Send}
        label="Total Applications"
        value={stats.total}
        color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
      />
      <StatCard
        icon={TrendingUp}
        label="Interview Rate"
        value={stats.interviewRate}
        suffix="%"
        color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        trend={stats.interviewRate > 0 ? stats.interviewRate : undefined}
      />
      <StatCard
        icon={Award}
        label="Offer Rate"
        value={stats.offerRate}
        suffix="%"
        color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
      />
      <StatCard
        icon={XCircle}
        label="Rejection Rate"
        value={stats.rejectionRate}
        suffix="%"
        color="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
      />
    </div>
  );
}