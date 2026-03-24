import { format, formatDistanceToNow, parseISO, isAfter, isBefore, startOfWeek, startOfMonth, eachDayOfInterval, subDays } from 'date-fns';

// ─── Status Configuration ────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  Applied: {
    label: 'Applied',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    dot: 'bg-blue-500',
    step: 1,
  },
  Shortlisted: {
    label: 'Shortlisted',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    dot: 'bg-amber-500',
    step: 2,
  },
  Interview: {
    label: 'Interview',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    dot: 'bg-purple-500',
    step: 3,
  },
  Offer: {
    label: 'Offer 🎉',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    step: 4,
  },
  Rejected: {
    label: 'Rejected',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    dot: 'bg-rose-500',
    step: 0,
  },
};

export const STATUS_OPTIONS = Object.keys(STATUS_CONFIG);
export const TIMELINE_STEPS = ['Applied', 'Shortlisted', 'Interview', 'Offer'];

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatRelative = (dateStr) => {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
};

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

// ─── Statistics Calculations ──────────────────────────────────────────────────

export const computeStats = (jobs) => {
  const total = jobs.length;
  if (total === 0) return { total: 0, interviewRate: 0, offerRate: 0, rejectionRate: 0, shortlistedRate: 0 };

  const interviews = jobs.filter(j => ['Interview', 'Offer'].includes(j.status)).length;
  const offers = jobs.filter(j => j.status === 'Offer').length;
  const rejected = jobs.filter(j => j.status === 'Rejected').length;
  const shortlisted = jobs.filter(j => j.status === 'Shortlisted').length;

  return {
    total,
    interviewRate: Math.round((interviews / total) * 100),
    offerRate: Math.round((offers / total) * 100),
    rejectionRate: Math.round((rejected / total) * 100),
    shortlistedRate: Math.round((shortlisted / total) * 100),
    byStatus: STATUS_OPTIONS.reduce((acc, s) => {
      acc[s] = jobs.filter(j => j.status === s).length;
      return acc;
    }, {}),
  };
};

// ─── Chart Data Builders ──────────────────────────────────────────────────────

export const buildWeeklyData = (jobs) => {
  const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  return days.map(day => {
    const label = format(day, 'EEE');
    const dateStr = format(day, 'yyyy-MM-dd');
    return {
      name: label,
      count: jobs.filter(j => j.date === dateStr).length,
    };
  });
};

export const buildMonthlyData = (jobs) => {
  // Last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = format(d, 'MMM');
    const month = format(d, 'yyyy-MM');
    months.push({
      name: label,
      count: jobs.filter(j => j.date && j.date.startsWith(month)).length,
    });
  }
  return months;
};

export const buildStatusPieData = (stats) => {
  if (!stats.byStatus) return [];
  return STATUS_OPTIONS
    .filter(s => stats.byStatus[s] > 0)
    .map(s => ({
      name: s,
      value: stats.byStatus[s],
    }));
};

// ─── Sorting & Filtering ──────────────────────────────────────────────────────

export const sortJobs = (jobs, sortBy) => {
  const sorted = [...jobs];
  switch (sortBy) {
    case 'date-desc': return sorted.sort((a, b) => b.date?.localeCompare(a.date || '') || 0);
    case 'date-asc': return sorted.sort((a, b) => a.date?.localeCompare(b.date || '') || 0);
    case 'company': return sorted.sort((a, b) => a.company.localeCompare(b.company));
    case 'status': return sorted.sort((a, b) => a.status.localeCompare(b.status));
    default: return sorted;
  }
};

// ─── Reminders ────────────────────────────────────────────────────────────────

export const getDueReminders = (jobs) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return jobs.filter(j => {
    if (!j.reminderDate) return false;
    const rem = parseISO(j.reminderDate);
    rem.setHours(0, 0, 0, 0);
    return rem <= today;
  });
};
// ─── Daily Streak ─────────────────────────────────────────────────────────────

export const calculateStreak = (jobs) => {
  if (!jobs.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    const hasApplication = jobs.some(j => j.date === dateStr);

    if (hasApplication) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};