import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Building2, Calendar, FileText,
  Bell, Paperclip, CheckCircle2, Sparkles, Save, X, Clock
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { StatusBadge } from '../components/JobCard';
import Timeline from '../components/Timeline';
import JobForm from '../components/Jobform';
import { formatDate, formatRelative, STATUS_OPTIONS } from '../utils/helpers';
import { rewriteNotes, scoreApplicationStrength, generateTips } from '../utils/aihelper';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJob, updateJob, deleteJob } = useJobs();
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const job = getJob(id);

  const strength = useMemo(() => job ? scoreApplicationStrength(job) : null, [job]);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-ink-400 text-lg">Job not found</p>
        <Link to="/jobs" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Remove ${job.company} application?`)) {
      deleteJob(id);
      navigate('/jobs');
    }
  };

  const handleStatusChange = (newStatus) => {
    updateJob(id, { status: newStatus });
  };

  const handleAIRewrite = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const improved = rewriteNotes(job.notes);
    updateJob(id, { notes: improved });
    setAiLoading(false);
  };

  const handleFollowUp = () => {
    updateJob(id, { followedUp: !job.followedUp });
  };

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditing(false)} className="btn-ghost">
            <X className="w-4 h-4" /> Cancel Edit
          </button>
        </div>
        <JobForm initialData={job} jobId={id} isEdit />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/jobs" className="btn-ghost inline-flex text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      {/* Header card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
              style={{ backgroundColor: `hsl(${job.company.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 45%, 45%)` }}
            >
              {job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">{job.company}</h1>
              <p className="text-ink-500 dark:text-ink-400">{job.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIsEditing(true)} className="btn-secondary text-xs">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={handleDelete} className="p-2 rounded-xl text-ink-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status selector */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                job.status === s
                  ? 'bg-ink-900 dark:bg-amber-400 text-white dark:text-ink-950 scale-105'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="pt-2">
          <p className="label mb-3">Progress</p>
          <Timeline status={job.status} />
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetaCard icon={Calendar} label="Applied" value={formatDate(job.date)} />
        <MetaCard icon={Clock} label="Added" value={formatRelative(job.createdAt)} />
        <MetaCard
          icon={Bell}
          label="Reminder"
          value={job.reminderDate ? formatDate(job.reminderDate) : 'None set'}
          highlight={!!job.reminderDate}
        />
        <MetaCard
          icon={Paperclip}
          label="Resume"
          value={job.resume || 'Not attached'}
          highlight={!!job.resume}
        />
      </div>

      {/* Application Strength */}
      {strength && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900 dark:text-white text-sm">Application Strength</h2>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              strength.grade === 'Strong' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
              strength.grade === 'Moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
              'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
            }`}>
              {strength.grade} · {strength.score}%
            </span>
          </div>
          <div className="h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                strength.score >= 75 ? 'bg-emerald-500' : strength.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
          {strength.feedback.length > 0 && (
            <ul className="space-y-1.5">
              {strength.feedback.map((f, i) => (
                <li key={i} className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center text-ink-400 text-xs shrink-0">!</span>
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 dark:text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-ink-400" /> Notes
          </h2>
          <button
            onClick={handleAIRewrite}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            {aiLoading ? 'Improving...' : 'AI Improve'}
          </button>
        </div>
        {job.notes ? (
          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{job.notes}</p>
        ) : (
          <p className="text-sm text-ink-400 dark:text-ink-500 italic">No notes added yet.</p>
        )}
      </div>

      {/* Follow-up action */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-ink-900 dark:text-white text-sm">Followed Up?</h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">Mark if you've sent a follow-up email</p>
        </div>
        <button
          onClick={handleFollowUp}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            job.followedUp
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {job.followedUp ? 'Followed Up ✓' : 'Mark as Followed Up'}
        </button>
      </div>
    </div>
  );
}

function MetaCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`card p-3.5 space-y-2 ${highlight ? 'border-amber-200 dark:border-amber-800/50' : ''}`}>
      <div className="flex items-center gap-1.5 text-ink-400 dark:text-ink-500">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-sm font-medium ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-ink-700 dark:text-ink-200'}`}>
        {value}
      </p>
    </div>
  );
}