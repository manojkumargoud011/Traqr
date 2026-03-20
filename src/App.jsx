import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JobProvider, useJobs } from './context/JobContext';
import Navbar, { MobileNav } from './components/Navbar';
import Login from './pages/Login';

// Pages
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import JobDetails from './pages/JobDetails';
import AllJobs from './pages/AllJobs';
import RemindersPage from './pages/Reminders';
import KanbanBoard from './pages/KanbanBoard';
import AITools from './pages/AITools';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import InterviewPrep from './pages/InterviewPrep';
import NetworkingTracker from './pages/NetworkingTracker';

// ─── Layout ───────────────────────────────────────────────────────────────────

function AppLayout() {
  const { darkMode, user, authLoading, logout } = useJobs();

  useEffect(() => {
    darkMode
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Show loading spinner while checking login
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-ink-900 dark:bg-amber-400 mx-auto animate-pulse" />
          <p className="text-ink-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show login page
  if (!user) return <Login />;

  // Logged in → show full app
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 transition-colors duration-300">
      <div className="flex">
        <Navbar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/add"        element={<AddJob />} />
              <Route path="/jobs"       element={<AllJobs />} />
              <Route path="/job/:id"    element={<JobDetails />} />
              <Route path="/reminders"  element={<RemindersPage />} />
              <Route path="/kanban"     element={<KanbanBoard />} />
              <Route path="/ai-tools"   element={<AITools />} />
              <Route path="/resume"     element={<ResumeAnalyzer />} />
              <Route path="/interview"  element={<InterviewPrep />} />
              <Route path="/networking" element={<NetworkingTracker />} />
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <p className="text-5xl font-display font-bold text-ink-200 dark:text-ink-700">404</p>
                  <p className="text-ink-400">Page not found</p>
                  <a href="/" className="btn-secondary">← Go Home</a>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <JobProvider>
        <AppLayout />
      </JobProvider>
    </BrowserRouter>
  );
}