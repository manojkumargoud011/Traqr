import { useState } from 'react';
import { Sparkles, FileText, Copy, Check, Zap, Loader } from 'lucide-react';
import { summarizeJD, calculateMatchScore, generateCoverLetter } from '../utils/aiHelper';
import { useJobs } from '../context/JobContext';

// ─── Loading Spinner ──────────────────────────────────────────────────────────

function AILoader({ text = 'Gemini AI is thinking...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <Loader className="w-8 h-8 animate-spin text-amber-500" />
      <p className="text-sm text-ink-400">{text}</p>
    </div>
  );
}

// ─── JD Summarizer ────────────────────────────────────────────────────────────

function JDSummarizer() {
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (jdText.trim().length < 20) return;
    setLoading(true);
    setResult(null);
    setMatch(null);
    try {
      const [summaryResult, matchResult] = await Promise.all([
        summarizeJD(jdText),
        calculateMatchScore(jdText),
      ]);
      setResult(summaryResult);
      setMatch(matchResult);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="font-semibold text-ink-900 dark:text-white">
            JD Analyzer + Match Score
          </h2>
          <p className="text-xs text-ink-400">
            Powered by Google Gemini AI
          </p>
        </div>
        <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
          ✨ Real AI
        </span>
      </div>

      {/* Input */}
      <textarea
        className="input min-h-[160px] resize-none font-mono text-xs leading-relaxed"
        placeholder="Paste the full job description here...&#10;&#10;We are looking for a Senior React Developer..."
        value={jdText}
        onChange={e => { setJdText(e.target.value); setResult(null); setMatch(null); }}
      />

      <button
        onClick={analyze}
        disabled={jdText.trim().length < 20 || loading}
        className="btn-primary w-full justify-center"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? 'Gemini AI Analyzing...' : 'Analyze with Gemini AI'}
      </button>

      {/* Loading */}
      {loading && <AILoader text="Gemini is reading the job description..." />}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4 animate-fade-in">

          {/* Match Score */}
          {match && match.score !== null && (
            <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-900 dark:text-white">
                  Your Match Score
                </span>
                <span className={`text-2xl font-bold font-mono ${
                  match.score >= 80 ? 'text-emerald-600' :
                  match.score >= 60 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {match.score}%
                </span>
              </div>

              {/* Score bar */}
              <div className="h-3 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    match.score >= 80 ? 'bg-emerald-500' :
                    match.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${match.score}%` }}
                />
              </div>

              <p className="text-xs font-semibold text-ink-500">
                {match.verdict} · {match.breakdown?.skillsMatch}
              </p>

              {/* Gemini advice */}
              {match.advice && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    💡 Gemini's Advice
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {match.advice}
                  </p>
                </div>
              )}

              {/* Matched skills */}
              {match.matched?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                    ✅ Skills you have
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.matched.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {match.missing?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1.5">
                    ❌ Skills to learn
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.missing.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* JD Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 text-center">
              <p className="text-xs text-ink-400 mb-1">Experience</p>
              <p className="text-xs font-semibold text-ink-900 dark:text-white">
                {result.experience}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 text-center">
              <p className="text-xs text-ink-400 mb-1">Salary</p>
              <p className="text-xs font-semibold text-ink-900 dark:text-white">
                {result.salary}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 text-center">
              <p className="text-xs text-ink-400 mb-1">Work Type</p>
              <p className="text-xs font-semibold text-ink-900 dark:text-white">
                {result.roleType}
              </p>
            </div>
          </div>

          {/* Skills */}
          {result.skills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.skills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div>
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">
              AI Summary
            </p>
            <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Culture */}
          {result.culture && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                🏢 Company Culture
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                {result.culture}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ─── Cover Letter Generator ────────────────────────────────────────────────────

function CoverLetterGenerator() {
  const { jobs } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [myName, setMyName] = useState('');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const generate = async () => {
    if (!selectedJob) return;
    setLoading(true);
    setLetter('');
    try {
      const result = await generateCoverLetter(selectedJob, myName || 'Your Name');
      setLetter(result);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="font-semibold text-ink-900 dark:text-white">
            Cover Letter Generator
          </h2>
          <p className="text-xs text-ink-400">
            Unique letter for every job using Gemini AI
          </p>
        </div>
        <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
          ✨ Real AI
        </span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Your Name</label>
          <input
            className="input"
            placeholder="e.g. Manoj Kumar"
            value={myName}
            onChange={e => setMyName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Select Job</label>
          <select
            className="input cursor-pointer"
            value={selectedJobId}
            onChange={e => setSelectedJobId(e.target.value)}
          >
            <option value="">Choose a job...</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tip */}
      {selectedJob && !selectedJob.jobDescription && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            💡 Tip: Add a job description to this job for a much better cover letter.
            Go to Job Details → Edit → paste the JD.
          </p>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!selectedJobId || loading}
        className="btn-primary w-full justify-center"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? 'Gemini AI Writing...' : 'Generate with Gemini AI'}
      </button>

      {/* Loading */}
      {loading && <AILoader text="Gemini is writing your cover letter..." />}

      {/* Result */}
      {letter && !loading && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
              Generated Cover Letter
            </p>
            <button onClick={copy} className="btn-secondary text-xs py-1.5 px-3">
              {copied
                ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                : <><Copy className="w-3.5 h-3.5" /> Copy</>
              }
            </button>
          </div>
          <textarea
            className="input min-h-[300px] text-sm leading-relaxed resize-none"
            value={letter}
            onChange={e => setLetter(e.target.value)}
          />
          <p className="text-xs text-ink-400">
            ✏️ You can edit the letter above before copying
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AITools() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">
          AI Tools
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
          Powered by Google Gemini AI — real intelligence, not simulated
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JDSummarizer />
        <CoverLetterGenerator />
      </div>
    </div>
  );
}
