import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Plus, Moon, Sun, Briefcase, Bell, Kanban, Sparkles, FileText, Users, Brain, Download, LogOut } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { getDueReminders } from '../utils/helpers';
import { exportToCSV } from '../utils/aihelper';
import { useMemo } from 'react';

export default function Navbar() {
  const { darkMode, toggleDarkMode, jobs, dismissedReminders, logout, user } = useJobs();

  const dueCount = useMemo(() => {
    return getDueReminders(jobs).filter(j => !dismissedReminders.includes(j.id)).length;
  }, [jobs, dismissedReminders]);

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col h-screen sticky top-0 bg-white dark:bg-ink-900 border-r border-ink-100 dark:border-ink-800 px-3 py-5 gap-1 overflow-y-auto scrollbar-thin">

      {/* Logo */}
      <div className="mb-5 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ink-900 dark:bg-amber-400 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white dark:text-ink-950" />
          </div>
          <span className="font-display text-xl font-bold text-ink-900 dark:text-white">Traqr</span>
        </div>
        <p className="text-xs text-ink-400 mt-1 ml-10">Job Application Tracker</p>
      </div>

      {/* Main */}
      <p className="px-2 text-xs font-bold text-ink-400 uppercase tracking-widest mb-1">Main</p>

      <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard className="w-4 h-4" /> Dashboard
      </NavLink>

      <NavLink to="/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Plus className="w-4 h-4" /> Add Job
      </NavLink>

      <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Briefcase className="w-4 h-4" />
        All Jobs
        {jobs.length > 0 && (
          <span className="ml-auto text-xs font-mono bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded-md text-ink-500 dark:text-ink-400">
            {jobs.length}
          </span>
        )}
      </NavLink>

      <NavLink to="/kanban" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Kanban className="w-4 h-4" /> Kanban Board
      </NavLink>

      {dueCount > 0 && (
        <NavLink to="/reminders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Bell className="w-4 h-4" />
          Reminders
          <span className="ml-auto text-xs font-semibold bg-rose-500 text-white px-1.5 py-0.5 rounded-md animate-pulse">
            {dueCount}
          </span>
        </NavLink>
      )}

      {/* AI Tools */}
      <p className="px-2 text-xs font-bold text-ink-400 uppercase tracking-widest mb-1 mt-4">AI Tools</p>

      <NavLink to="/ai-tools" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Sparkles className="w-4 h-4" /> JD Analyzer
      </NavLink>

      <NavLink to="/resume" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <FileText className="w-4 h-4" /> Resume Analyzer
      </NavLink>

      <NavLink to="/interview" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Brain className="w-4 h-4" /> Interview Prep
      </NavLink>

      {/* Network */}
      <p className="px-2 text-xs font-bold text-ink-400 uppercase tracking-widest mb-1 mt-4">Network</p>

      <NavLink to="/networking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Users className="w-4 h-4" /> Networking
      </NavLink>

      {/* Bottom */}
      <div className="pt-3 mt-auto border-t border-ink-100 dark:border-ink-800 space-y-1">

        {/* Logged in user email */}
        {user && (
          <p className="text-xs text-ink-400 px-2 truncate mb-2">
            📧 {user.email}
          </p>
        )}

        {/* Export CSV */}
        <button
          onClick={() => exportToCSV(jobs)}
          className="nav-link w-full"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>

        {/* Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="nav-link w-full"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Sign Out */}
        <button
          onClick={logout}
          className="nav-link w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>

      </div>

    </aside>
  );
}

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────────

export function MobileNav() {
  const { toggleDarkMode, darkMode, jobs, dismissedReminders } = useJobs();

  const dueCount = useMemo(() => {
    return getDueReminders(jobs).filter(j => !dismissedReminders.includes(j.id)).length;
  }, [jobs, dismissedReminders]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-ink-900 border-t border-ink-100 dark:border-ink-800 px-2 py-2">
      <div className="flex justify-around items-center">

        <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium ${isActive ? 'text-ink-900 dark:text-amber-400' : 'text-ink-400'}`}>
          <LayoutDashboard className="w-5 h-5" />
          Home
        </NavLink>

        <NavLink to="/jobs" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium ${isActive ? 'text-ink-900 dark:text-amber-400' : 'text-ink-400'}`}>
          <Briefcase className="w-5 h-5" />
          Jobs
        </NavLink>

        <NavLink to="/add" className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-2xl bg-ink-900 dark:bg-amber-400 flex items-center justify-center -mt-4 shadow-lg">
            <Plus className="w-5 h-5 text-white dark:text-ink-950" />
          </div>
        </NavLink>

        <NavLink to="/kanban" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium ${isActive ? 'text-ink-900 dark:text-amber-400' : 'text-ink-400'}`}>
          <Kanban className="w-5 h-5" />
          Board
        </NavLink>

        <NavLink to="/ai-tools" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium ${isActive ? 'text-ink-900 dark:text-amber-400' : 'text-ink-400'}`}>
          <Sparkles className="w-5 h-5" />
          AI
        </NavLink>

      </div>
    </nav>
  );
}