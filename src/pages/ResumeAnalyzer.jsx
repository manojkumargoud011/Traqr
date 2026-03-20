import { useState } from 'react';
import { FileText, Sparkles, CheckCircle, AlertCircle, Upload, Loader, ArrowRight } from 'lucide-react';
import { analyzeResume } from '../utils/aihelper';

function AILoader({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <Loader className="w-8 h-8 animate-spin text-amber-500" />
      <p className="text-sm text-ink-400">{text}</p>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (resumeText.trim().length < 50) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeResume(resumeText);
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const gradeColor = (grade) => {
    if (grade === 'Excellent') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20';
    if (grade === 'Good') return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
    if (grade === 'Fair') return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20';
    return 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/20';
  };

  const scoreBarColor = (score) =>
    score >= 80 ? 'bg-emerald-500' :
    score >= 65 ? 'bg-blue-500' :
    score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">
            Resume Analyzer
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Powered by Google Gemini AI
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
          ✨ Real AI
        </span>
      </div>

      {/* Input */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-ink-900 dark:text-white text-sm">
              Paste Your Resume Text
            </p>
            <p className="text-xs text-ink-400">
              Copy all text from your resume and paste below
            </p>
          </div>
        </div>

        <textarea
          className="input min-h-[200px] resize-none text-sm leading-relaxed font-mono"
          placeholder="Paste your full resume text here...&#10;&#10;JOHN DOE&#10;john@email.com | github.com/johndoe&#10;&#10;SUMMARY&#10;Frontend engineer with 4 years experience...&#10;&#10;EXPERIENCE&#10;Senior Developer at Company (2022–Present)&#10;• Built React applications..."
          value={resumeText}
          onChange={e => { setResumeText(e.target.value); setResult(null); }}
        />

        <button
          onClick={analyze}
          disabled={resumeText.trim().length < 50 || loading}
          className="btn-primary w-full justify-center"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? 'Gemini AI Analyzing...' : 'Analyze with Gemini AI'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card p-6">
          <AILoader text="Gemini is reading your resume carefully..." />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4 animate-fade-in">

          {/* ATS Score */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-ink-500" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">
                    ATS Score
                  </p>
                  <p className="text-xs text-ink-400">
                    How well your resume passes automated screening
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold font-display text-ink-900 dark:text-white">
                  {result.atsScore}
                  <span className="text-lg text-ink-400">/100</span>
                </p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${gradeColor(result.grade)}`}>
                  {result.grade}
                </span>
              </div>
            </div>

            <div className="h-3 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(result.atsScore)}`}
                style={{ width: `${result.atsScore}%` }}
              />
            </div>

            {/* Detailed feedback */}
            {result.detailedFeedback && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  💡 Gemini's Overall Feedback
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {result.detailedFeedback}
                </p>
              </div>
            )}

            {/* Strengths and Suggestions */}
            <div className="grid grid-cols-2 gap-4">
              {result.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                    ✅ Strengths
                  </p>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-600 dark:text-ink-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">
                    ⚠️ Improvements
                  </p>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-600 dark:text-ink-300">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Bullet Improvements */}
          {result.bulletImprovements?.length > 0 && (
            <div className="card p-5 space-y-3">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                ✍️ Bullet Point Improvements
              </p>
              <p className="text-xs text-ink-400">
                Gemini rewrote your weak bullet points
              </p>
              <div className="space-y-3">
                {result.bulletImprovements.map((b, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/10">
                      <span className="text-xs font-bold text-rose-500 shrink-0 mt-0.5">
                        ❌
                      </span>
                      <p className="text-xs text-rose-700 dark:text-rose-400">
                        {b.original}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-ink-300" />
                    </div>
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
                      <span className="text-xs font-bold text-emerald-500 shrink-0 mt-0.5">
                        ✅
                      </span>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        {b.improved}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords Found */}
          {result.keywords?.length > 0 && (
            <div className="card p-5 space-y-3">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                🔑 Technical Keywords Detected
                <span className="text-ink-400 font-normal text-xs ml-2">
                  ({result.keywords.length} found)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map(k => (
                  <span key={k} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords?.length > 0 && (
            <div className="card p-5 space-y-3">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                💡 Missing In-Demand Skills
              </p>
              <p className="text-xs text-ink-400">
                Add these to your resume to increase ATS score
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map(k => (
                  <span key={k} className="px-2.5 py-1 bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 rounded-lg text-xs font-medium">
                    + {k}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
