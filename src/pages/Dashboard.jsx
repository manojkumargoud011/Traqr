import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, ArrowRight, Lightbulb, Loader } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import DashboardStats from '../components/DashboardStats';
import { BarChartView, StatusPieChart } from '../components/Charts';
import JobCard from '../components/JobCard';
import Reminder from '../components/Reminder';
import {
  computeStats,
  buildWeeklyData,
  buildMonthlyData,
  buildStatusPieData,
} from '../utils/helpers';
import {
  generateTips,
  generateSmartInsights,
  suggestRoles,
} from '../utils/aihelper';

export default function Dashboard() {
  const { jobs } = useJobs();

  const stats = useMemo(() => computeStats(jobs), [jobs]);
  const weeklyData = useMemo(() => buildWeeklyData(jobs), [jobs]);
  const monthlyData = useMemo(() => buildMonthlyData(jobs), [jobs]);
  const pieData = useMemo(() => buildStatusPieData(stats), [stats]);
  const suggestedRoles = useMemo(() => suggestRoles(jobs), [jobs]);
  const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);

  // ── AI Tips State ──────────────────────────────────────────────────────────
  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);

  // ── Smart Insights State ───────────────────────────────────────────────────
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // ── Load AI Tips ───────────────────────────────────────────────────────────
  useEffect(() => {
    const loadTips = async () => {
      setTipsLoading(true);
      try {
        const result = await generateTips(jobs);
        setTips(result);
      } catch (err) {
        console.error(err);
      }
      setTipsLoading(false);
    };
    loadTips();
  }, [jobs.length]);

  // ── Load Smart Insights ────────────────────────────────────────────────────
  useEffect(() => {
    const loadInsights = async () => {
      if (jobs.length < 2) return;
      setInsightsLoading(true);
      try {
        const result = await generateSmartInsights(jobs);
        setInsights(result);
      } catch (err) {
        console.error(err);
      }
      setInsightsLoading(false);
    };
    loadInsights();
  }, [jobs.length]);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            {jobs.length === 0
              ? 'Start tracking your job search journey'
              : `Tracking ${jobs.length} application${jobs.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Link to="/add" className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Job
        </Link>
      </div>

      {/* Reminders */}
      <Reminder />

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BarChartView
            data={monthlyData}
            title="Applications Over 6 Months"
            dataKey="count"
          />
        </div>
        <StatusPieChart data={pieData} />
      </div>

      {/* Charts Row 2 + AI Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BarChartView
            data={weeklyData}
            title="This Week's Activity"
            dataKey="count"
            barColor="#a855f7"
          />
        </div>

        {/* AI Tips */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-ink-900 dark:text-white text-sm">
              AI Insights
            </h3>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
              Gemini
            </span>
          </div>

          {tipsLoading ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <Loader className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs text-ink-400">Gemini is thinking...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className={`flex gap-3 p-3 rounded-xl ${
                    tip.urgent
                      ? 'bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30'
                      : 'bg-ink-50 dark:bg-ink-800/50'
                  }`}
                >
                  <span className="text-base shrink-0">{tip.icon}</span>
                  <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Smart Insights */}
      {(insights.length > 0 || insightsLoading) && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-ink-900 dark:text-white text-sm">
              Smart Insights
            </h3>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
              Gemini
            </span>
          </div>

          {insightsLoading ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <Loader className="w-6 h-6 animate-spin text-purple-500" />
              <p className="text-xs text-ink-400">
                Gemini is analyzing your job search patterns...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50"
                >
                  <span className="text-base shrink-0">{insight.icon}</span>
                  <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Jobs + Suggested Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900 dark:text-white">
              Recent Applications
            </h2>
            <Link
              to="/jobs"
              className="text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-ink-400 text-sm mb-3">
                No applications yet
              </p>
              <Link to="/add" className="btn-primary text-xs">
                <Plus className="w-3.5 h-3.5" />
                Add your first job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        {/* Suggested Roles */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-ink-900 dark:text-white text-sm">
              Suggested Roles
            </h3>
          </div>
          <p className="text-xs text-ink-400 dark:text-ink-500">
            Based on your application history
          </p>
          <div className="space-y-2">
            {suggestedRoles.map((role, i) => (
              <Link
                key={i}
                to={`/add?role=${encodeURIComponent(role)}`}
                className="flex items-center justify-between p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 group transition-colors"
              >
                <span className="text-xs font-medium text-ink-700 dark:text-ink-300">
                  {role}
                </span>
                <Plus className="w-3.5 h-3.5 text-ink-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
