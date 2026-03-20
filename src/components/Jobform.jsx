import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, Calendar, FileText,
  Bell, Sparkles, Save, ArrowLeft, Paperclip, Loader
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { STATUS_OPTIONS, todayISO } from '../utils/helpers';
import { rewriteNotes, scoreApplicationStrength } from '../utils/aihelper';

const EMPTY_FORM = {
  company: '',
  role: '',
  status: 'Applied',
  date: todayISO(),
  notes: '',
  reminderDate: '',
  resume: '',
  jobDescription: '',
  salary: '',
  deadline: '',
};

export default function JobForm({ initialData, jobId, isEdit = false }) {
  const navigate = useNavigate();
  const { addJob, updateJob } = useJobs();
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showJD, setShowJD] = useState(false);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.company.trim()) errs.company = 'Company name is required';
    if (!form.role.trim()) errs.role = 'Role is required';
    if (!form.date) errs.date = 'Application date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isEdit) {
      updateJob(jobId, form);
    } else {
      addJob(form);
    }
    setSaved(true);
    setTimeout(() => navigate('/jobs'), 800);
  };

  const handleAIRewrite = async () => {
    setAiLoading(true);
    try {
      const improved = await rewriteNotes(form.notes);
      setForm(prev => ({ ...prev, notes: improved }));
    } catch (err) {
      console.error(err);
    }
    setAiLoading(false);
  };

  const strength = useMemo(() => scoreApplicationStrength(form), [form]);

  const strengthBarColor = strength.grade === 'Strong'
    ? 'bg-emerald-500'
    : strength.grade === 'Moderate'
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const strengthBadgeColor = strength.grade === 'Strong'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
    : strength.grade === 'Moderate'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Strength Meter */}
      <div className="card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
            Application Strength
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${strengthBadgeColor}`}>
            {strength.grade} · {strength.score}%
          </span>
        </div>
        <div className="h-1.5 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${strengthBarColor}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        {strength.feedback.length > 0 && (
          <ul className="space-y-1 pt-1">
            {strength.feedback.map((f, i) => (
              <li
                key={i}
                className="text-xs text-ink-400 dark:text-ink-500 flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-ink-300 dark:bg-ink-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Core Fields */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-ink-900 dark:text-white text-sm">
          Job Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <Building2 className="inline w-3.5 h-3.5 mr-1" />
              Company *
            </label>
            <input
              className={`input ${errors.company ? 'ring-2 ring-rose-400 border-transparent' : ''}`}
              placeholder="e.g. Google, Infosys, Swiggy"
              value={form.company}
              onChange={set('company')}
            />
            {errors.company && (
              <p className="text-xs text-rose-500 mt-1">{errors.company}</p>
            )}
          </div>

          <div>
            <label className="label">
              <Briefcase className="inline w-3.5 h-3.5 mr-1" />
              Role *
            </label>
            <input
              className={`input ${errors.role ? 'ring-2 ring-rose-400 border-transparent' : ''}`}
              placeholder="e.g. Frontend Engineer"
              value={form.role}
              onChange={set('role')}
            />
            {errors.role && (
              <p className="text-xs text-rose-500 mt-1">{errors.role}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select
              className="input cursor-pointer"
              value={form.status}
              onChange={set('status')}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <Calendar className="inline w-3.5 h-3.5 mr-1" />
              Applied Date *
            </label>
            <input
              type="date"
              className={`input ${errors.date ? 'ring-2 ring-rose-400 border-transparent' : ''}`}
              value={form.date}
              onChange={set('date')}
            />
            {errors.date && (
              <p className="text-xs text-rose-500 mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">💰 Salary / Package</label>
            <input
              className="input"
              placeholder="e.g. 8-12 LPA or $80,000"
              value={form.salary || ''}
              onChange={set('salary')}
            />
          </div>

          <div>
            <label className="label">📅 Application Deadline</label>
            <input
              type="date"
              className="input"
              value={form.deadline || ''}
              onChange={set('deadline')}
            />
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="label mb-0">
              📋 Job Description
            </label>
            <p className="text-xs text-ink-400 mt-0.5">
              Paste JD to unlock AI match score and better cover letters
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowJD(p => !p)}
            className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
          >
            {showJD ? 'Hide' : 'Show'}
          </button>
        </div>

        {showJD && (
          <textarea
            className="input min-h-[120px] resize-none text-xs font-mono leading-relaxed animate-fade-in"
            placeholder="Paste the full job description here...&#10;We are looking for a React Developer with 3+ years..."
            value={form.jobDescription || ''}
            onChange={set('jobDescription')}
          />
        )}

        {!showJD && form.jobDescription && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            ✅ Job description added — AI features unlocked
          </p>
        )}

        {!showJD && !form.jobDescription && (
          <p className="text-xs text-ink-400">
            Click "Show" to paste job description
          </p>
        )}
      </div>

      {/* Notes + AI Rewriter */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="label mb-0">
            <FileText className="inline w-3.5 h-3.5 mr-1" />
            Notes
          </label>
          <button
            type="button"
            onClick={handleAIRewrite}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
          >
            {aiLoading
              ? <Loader className="w-3.5 h-3.5 animate-spin" />
              : <Sparkles className="w-3.5 h-3.5" />
            }
            {aiLoading ? 'Gemini Rewriting...' : 'AI Improve'}
          </button>
        </div>
        <textarea
          className="input min-h-[100px] resize-none leading-relaxed"
          placeholder="Add notes about this role, company culture, salary, interview process..."
          value={form.notes}
          onChange={set('notes')}
        />
      </div>

      {/* Additional Details */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-ink-900 dark:text-white text-sm">
          Additional Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <Bell className="inline w-3.5 h-3.5 mr-1" />
              Follow-up Reminder
            </label>
            <input
              type="date"
              className="input"
              value={form.reminderDate || ''}
              onChange={set('reminderDate')}
            />
          </div>

          <div>
            <label className="label">
              <Paperclip className="inline w-3.5 h-3.5 mr-1" />
              Resume Version
            </label>
            <input
              className="input"
              placeholder="e.g. resume_v2.pdf"
              value={form.resume || ''}
              onChange={set('resume')}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saved}
          className="btn-primary"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved! ✓' : isEdit ? 'Update Job' : 'Add Job'}
        </button>
      </div>

    </form>
  );
}