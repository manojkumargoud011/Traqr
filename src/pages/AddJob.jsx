import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import JobForm from '../components/Jobform';
import { todayISO } from '../utils/helpers';

export default function AddJob() {
  const [searchParams] = useSearchParams();
  const prefillRole = searchParams.get('role') || '';

  const initialData = {
    company: '',
    role: prefillRole,
    status: 'Applied',
    date: todayISO(),
    notes: '',
    reminderDate: '',
    resume: '',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-ink-900 dark:bg-amber-400 flex items-center justify-center">
          <Plus className="w-5 h-5 text-white dark:text-ink-950" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">Add Job</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">Track a new application</p>
        </div>
      </div>

      <JobForm initialData={initialData} />
    </div>
  );
}