import { Check, X } from 'lucide-react';
import { TIMELINE_STEPS, STATUS_CONFIG } from '../utils/helpers';

export default function Timeline({ status }) {
  const isRejected = status === 'Rejected';
  const currentStep = isRejected ? -1 : (STATUS_CONFIG[status]?.step ?? 0);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Track line */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-ink-100 dark:bg-ink-700 mx-8 z-0" />

        {TIMELINE_STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = !isRejected && currentStep >= stepNum;
          const isCurrent = !isRejected && currentStep === stepNum;

          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${isCompleted
                    ? 'bg-ink-900 dark:bg-amber-400 border-ink-900 dark:border-amber-400'
                    : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700'}
                  ${isCurrent ? 'ring-4 ring-amber-100 dark:ring-amber-400/20' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-white dark:text-ink-950" />
                ) : (
                  <span className="text-xs font-semibold text-ink-400 dark:text-ink-500">{stepNum}</span>
                )}
              </div>
              <span className={`text-xs font-medium ${isCurrent ? 'text-ink-900 dark:text-amber-400' : 'text-ink-400 dark:text-ink-500'}`}>
                {step}
              </span>
            </div>
          );
        })}

        {/* Rejected state overlay */}
        {isRejected && (
          <div className="absolute inset-0 flex items-start justify-center pt-0.5 z-20">
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-full px-4 py-1">
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Application Rejected</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}