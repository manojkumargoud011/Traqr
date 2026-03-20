import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Brain, X, Save, Sparkles, Loader } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { generateInterviewQuestions } from '../utils/aiHelper';

const ROUNDS = ['HR Screen', 'Technical', 'System Design', 'Behavioral', 'Take-Home', 'Final', 'Other'];

// ─── Fallback Questions ────────────────────────────────────────────────────────

const getFallbackQuestions = (job) => ({
  technical: [
    {
      question: `What technologies have you used relevant to the ${job.role} role?`,
      tip: 'Be specific about your experience and give examples from past projects.'
    },
    {
      question: 'How do you approach debugging a complex issue in production?',
      tip: 'Walk through your systematic approach step by step.'
    },
    {
      question: 'Describe a challenging technical problem you solved recently.',
      tip: 'Use STAR method: Situation, Task, Action, Result.'
    },
    {
      question: 'How do you ensure code quality in your projects?',
      tip: 'Mention code reviews, testing, documentation and best practices.'
    },
  ],
  behavioral: [
    {
      question: `Tell me about yourself and why you want to work at ${job.company}`,
      tip: 'Keep it under 2 minutes. Focus on relevant experience and genuine interest.'
    },
    {
      question: 'Describe a time you had a conflict with a teammate. How did you resolve it?',
      tip: 'Focus on the resolution and what you learned, not the conflict itself.'
    },
    {
      question: 'Tell me about a time you failed and what you learned from it.',
      tip: 'Show self awareness and growth mindset. Be honest but end positively.'
    },
    {
      question: 'Where do you see yourself in 3-5 years?',
      tip: 'Show ambition but align it with the company growth opportunities.'
    },
  ],
  systemDesign: [
    {
      question: `How would you design a scalable system for ${job.company}'s core product?`,
      tip: 'Start with requirements, then discuss architecture, databases, and scaling.'
    },
    {
      question: 'How would you design a URL shortener like bit.ly?',
      tip: 'Discuss database design, caching, load balancing and analytics.'
    },
  ],
  companySpecific: [
    {
      question: `Why do you want to work at ${job.company} specifically?`,
      tip: 'Research the company beforehand. Mention specific products or values.'
    },
    {
      question: `What do you know about ${job.company}'s products and mission?`,
      tip: 'Visit their website and LinkedIn before the interview.'
    },
    {
      question: `How do your skills align with what ${job.company} is looking for?`,
      tip: 'Match your experience directly to the job description requirements.'
    },
  ],
  preparationTips: [
    `Research ${job.company} thoroughly — products, mission, recent news`,
    'Prepare 3-4 examples using STAR method for behavioral questions',
    'Practice coding problems if this is a technical role',
    'Prepare 3-5 thoughtful questions to ask the interviewer',
    'Review the job description and match your experience to each requirement',
    'Test your audio and video if the interview is online',
  ],
});

// ─── AI Loader ────────────────────────────────────────────────────────────────

function AILoader({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <Loader className="w-8 h-8 animate-spin text-amber-500" />
      <p className="text-sm text-ink-400">{text}</p>
    </div>
  );
}

// ─── Add Note Form ─────────────────────────────────────────────────────────────

function AddNoteForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    question: '',
    answer: '',
    round: 'Technical'
  });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="card p-5 space-y-3 animate-fade-in border-amber-200 dark:border-amber-800/50">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Interview Question</label>
          <input
            className="input"
            placeholder="e.g. Explain React reconciliation"
            value={form.question}
            onChange={set('question')}
          />
        </div>
        <div>
          <label className="label">Round</label>
          <select
            className="input cursor-pointer"
            value={form.round}
            onChange={set('round')}
          >
            {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Your Answer / Notes</label>
        <textarea
          className="input resize-none"
          placeholder="Write your prepared answer or key points..."
          rows={4}
          value={form.answer}
          onChange={set('answer')}
        />
      </div>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>
          <X className="w-4 h-4" /> Cancel
        </button>
        <button
          className="btn-primary"
          onClick={() => form.question.trim() && onSave(form)}
        >
          <Save className="w-4 h-4" /> Save Note
        </button>
      </div>
    </div>
  );
}

// ─── Interview Note Card ───────────────────────────────────────────────────────

function InterviewNoteCard({ note, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const roundColors = {
    Technical: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    Behavioral: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    'System Design': 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    'HR Screen': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    Final: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
  };

  return (
    <div className="card animate-fade-in">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(p => !p)}
      >
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ${
          roundColors[note.round] || 'bg-ink-100 dark:bg-ink-800 text-ink-500'
        }`}>
          {note.round}
        </span>
        <p className="flex-1 text-sm font-medium text-ink-900 dark:text-white">
          {note.question}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDelete(note.id); }}
            className="btn-icon hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-ink-400" />
            : <ChevronDown className="w-4 h-4 text-ink-400" />
          }
        </div>
      </div>
      {expanded && note.answer && (
        <div className="px-4 pb-4 border-t border-ink-50 dark:border-ink-800 pt-3">
          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed whitespace-pre-wrap">
            {note.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── AI Generated Questions ────────────────────────────────────────────────────

function AIGeneratedQuestions({ questions, onAddNote }) {
  const [expanded, setExpanded] = useState(true);

  const categories = [
    { key: 'technical', label: '💻 Technical', color: 'purple' },
    { key: 'behavioral', label: '🤝 Behavioral', color: 'blue' },
    { key: 'systemDesign', label: '🏗️ System Design', color: 'amber' },
    { key: 'companySpecific', label: '🏢 Company Specific', color: 'emerald' },
  ];

  const hasQuestions = categories.some(
    cat => questions[cat.key]?.length > 0
  );

  if (!hasQuestions) return null;

  return (
    <div className="card p-5 space-y-4 border-amber-200 dark:border-amber-800/50 animate-fade-in">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-ink-900 dark:text-white text-sm">
              Interview Questions
            </p>
            <p className="text-xs text-ink-400">
              Click any question to add to your notes
            </p>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-ink-400" />
          : <ChevronDown className="w-4 h-4 text-ink-400" />
        }
      </div>

      {expanded && (
        <div className="space-y-4">

          {/* Prep Tips */}
          {questions.preparationTips?.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                💡 Preparation Tips
              </p>
              <ul className="space-y-1">
                {questions.preparationTips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2"
                  >
                    <span className="shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Question Categories */}
          {categories.map(cat => (
            questions[cat.key]?.length > 0 && (
              <div key={cat.key}>
                <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                  {cat.label}
                </p>
                <div className="space-y-2">
                  {questions[cat.key].map((q, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium text-ink-700 dark:text-ink-300 flex-1">
                          {q.question}
                        </p>
                        <button
                          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-800 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          onClick={() => onAddNote({
                            question: q.question,
                            answer: q.tip || '',
                            round: cat.key === 'behavioral'
                              ? 'Behavioral'
                              : cat.key === 'systemDesign'
                              ? 'System Design'
                              : 'Technical'
                          })}
                        >
                          + Add to Notes
                        </button>
                      </div>
                      {q.tip && (
                        <p className="text-xs text-ink-400 mt-1.5 italic">
                          💡 {q.tip}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function InterviewPrep() {
  const { jobs, addInterviewNote, deleteInterviewNote } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [aiQuestions, setAiQuestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const notes = selectedJob?.interviewNotes || [];

  const handleAddNote = (noteData) => {
    addInterviewNote(selectedJobId, noteData);
    setShowForm(false);
  };

  const handleDeleteNote = (noteId) => {
    if (confirm('Delete this interview note?')) {
      deleteInterviewNote(selectedJobId, noteId);
    }
  };

  const generateAIQuestions = async () => {
    if (!selectedJob) return;
    setAiLoading(true);
    setAiQuestions(null);
    setAiError('');

    try {
      const result = await generateInterviewQuestions(selectedJob);
      console.log('AI Questions result:', result);

      // Check if result has any questions
      const hasContent =
        result?.technical?.length > 0 ||
        result?.behavioral?.length > 0 ||
        result?.systemDesign?.length > 0 ||
        result?.companySpecific?.length > 0;

      if (hasContent) {
        // ✅ Gemini worked — use AI questions
        setAiQuestions(result);
      } else {
        // ⚠️ Gemini returned empty — use fallback
        console.log('Gemini returned empty, using fallback questions');
        setAiQuestions(getFallbackQuestions(selectedJob));
        setAiError('AI unavailable — showing standard questions instead.');
      }

    } catch (err) {
      console.error('generateAIQuestions error:', err);
      // ❌ Gemini failed — use fallback
      setAiQuestions(getFallbackQuestions(selectedJob));
      setAiError('AI unavailable — showing standard questions instead.');
    }

    setAiLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">
            Interview Prep
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            AI generates custom questions based on your actual job
          </p>
        </div>
        {selectedJobId && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Add Note
          </button>
        )}
      </div>

      {/* Job Selector */}
      <div className="card p-4">
        <label className="label">Select Job to Prepare For</label>
        <select
          className="input cursor-pointer"
          value={selectedJobId}
          onChange={e => {
            setSelectedJobId(e.target.value);
            setAiQuestions(null);
            setAiError('');
          }}
        >
          <option value="">Choose a job...</option>
          {jobs.map(j => (
            <option key={j.id} value={j.id}>
              {j.company} — {j.role} ({j.status})
            </option>
          ))}
        </select>
      </div>

      {selectedJob && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {['Technical', 'Behavioral', 'System Design'].map(round => (
              <div key={round} className="card p-3.5 text-center">
                <p className="text-2xl font-bold font-display text-ink-900 dark:text-white">
                  {notes.filter(n => n.round === round).length}
                </p>
                <p className="text-xs text-ink-400 mt-0.5">{round}</p>
              </div>
            ))}
          </div>

          {/* Generate Button Card */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink-900 dark:text-white text-sm">
                  AI Question Generator
                </p>
                <p className="text-xs text-ink-400">
                  Generates questions specific to {selectedJob.company} — {selectedJob.role}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                ✨ Gemini AI
              </span>
            </div>

            {/* No JD warning */}
            {!selectedJob.jobDescription && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  💡 Tip: Add a job description for more specific questions.
                  Go to Job Details → Edit → paste the JD.
                </p>
              </div>
            )}

            {/* AI fallback notice */}
            {aiError && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  ℹ️ {aiError}
                </p>
              </div>
            )}

            <button
              onClick={generateAIQuestions}
              disabled={aiLoading}
              className="btn-primary w-full justify-center"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading
                ? 'Generating Questions...'
                : `Generate Questions for ${selectedJob.company}`
              }
            </button>
          </div>

          {/* Loading */}
          {aiLoading && (
            <div className="card p-6">
              <AILoader
                text={`Generating interview questions for ${selectedJob.company}...`}
              />
            </div>
          )}

          {/* AI Questions */}
          {aiQuestions && !aiLoading && (
            <AIGeneratedQuestions
              questions={aiQuestions}
              onAddNote={handleAddNote}
            />
          )}

          {/* Add Note Form */}
          {showForm && (
            <AddNoteForm
              onSave={handleAddNote}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Notes List */}
          {notes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                📝 Your Notes ({notes.length})
              </p>
              {notes.map(note => (
                <InterviewNoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {notes.length === 0 && !aiQuestions && !aiLoading && (
            <div className="card p-10 text-center">
              <Brain className="w-10 h-10 text-ink-300 dark:text-ink-600 mx-auto mb-3" />
              <p className="font-semibold text-ink-500">No notes yet</p>
              <p className="text-sm text-ink-400 mt-1">
                Generate questions or add your own notes
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  className="btn-primary"
                  onClick={generateAIQuestions}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Questions
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Manual Note
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* No job selected */}
      {!selectedJob && (
        <div className="card p-12 text-center">
          <Brain className="w-12 h-12 text-ink-300 dark:text-ink-600 mx-auto mb-4" />
          <p className="font-semibold text-ink-700 dark:text-ink-300">
            Select a job to start preparing
          </p>
          <p className="text-sm text-ink-400 mt-1">
            AI will generate specific questions for that company and role
          </p>
        </div>
      )}

    </div>
  );
}
