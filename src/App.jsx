// import { useEffect } from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { JobProvider, useJobs } from './context/JobContext';
// import Navbar, { MobileNav } from './components/Navbar';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import AddJob from './pages/AddJob';
// import JobDetails from './pages/JobDetails';
// import AllJobs from './pages/AllJobs';
// import RemindersPage from './pages/Reminders';
// import KanbanBoard from './pages/KanbanBoard';
// import AITools from './pages/AITools';
// import ResumeAnalyzer from './pages/ResumeAnalyzer';
// import InterviewPrep from './pages/InterviewPrep';
// import NetworkingTracker from './pages/NetworkingTracker';

// function AppLayout() {
//   const { darkMode, user, authLoading, toggleDarkMode } = useJobs();

//   useEffect(() => {
//     darkMode
//       ? document.documentElement.classList.add('dark')
//       : document.documentElement.classList.remove('dark');
//   }, [darkMode]);

//   if (authLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
//         <div className="text-center space-y-4">
//           <div className="w-12 h-12 rounded-2xl bg-ink-900 dark:bg-amber-400 mx-auto animate-pulse" />
//           <p className="text-ink-400 text-sm">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) return <Login />;

//   return (
//     <div className="min-h-screen bg-ink-50 dark:bg-ink-950 transition-colors duration-300">

//       {/* ── Top Navbar (Mobile + Desktop) ── */}
// <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-ink-800 shadow-sm">
//   <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">

//     {/* Left — Logo */}
//     <div className="flex items-center gap-2.5">
//       <div className="w-8 h-8 rounded-xl bg-ink-900 dark:bg-amber-400 flex items-center justify-center">
//         <span className="text-white dark:text-ink-950 text-sm">💼</span>
//       </div>
//       <span className="font-display text-xl font-bold text-ink-900 dark:text-white">
//         Traqr
//       </span>
//     </div>

//     {/* Right — Dark Mode Button (Mobile Version) */}
//     <button
//       onClick={toggleDarkMode}
//       className="flex items-center gap-2 px-3 py-2 rounded-xl bg-ink-100 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-amber-400 text-sm transition-all active:scale-95"
//     >
//       {darkMode ? '☀️' : '🌙'}
//     </button>

//   </div>
// </header>

//       {/* ── Main Layout ── */}
//       <div className="flex">

//         {/* Desktop Sidebar */}
//         <Navbar />

//         {/* Page Content */}
//         <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
//           <div className="max-w-5xl mx-auto">
//             <Routes>
//               <Route path="/"           element={<Dashboard />} />
//               <Route path="/add"        element={<AddJob />} />
//               <Route path="/jobs"       element={<AllJobs />} />
//               <Route path="/job/:id"    element={<JobDetails />} />
//               <Route path="/reminders"  element={<RemindersPage />} />
//               <Route path="/kanban"     element={<KanbanBoard />} />
//               <Route path="/ai-tools"   element={<AITools />} />
//               <Route path="/resume"     element={<ResumeAnalyzer />} />
//               <Route path="/interview"  element={<InterviewPrep />} />
//               <Route path="/networking" element={<NetworkingTracker />} />
//               <Route path="*" element={
//                 <div className="flex flex-col items-center justify-center py-32 gap-4">
//                   <p className="text-5xl font-display font-bold text-ink-200 dark:text-ink-700">404</p>
//                   <p className="text-ink-400">Page not found</p>
//                   <a href="/" className="btn-secondary">← Go Home</a>
//                 </div>
//               } />
//             </Routes>
//           </div>
//         </main>

//       </div>

//       {/* Mobile Bottom Nav */}
//       <MobileNav />

//     </div>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <JobProvider>
//         <AppLayout />
//       </JobProvider>
//     </BrowserRouter>
//   );
// }
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JobProvider, useJobs } from './context/JobContext';
import Navbar, { MobileNav } from './components/Navbar';
import Login from './pages/Login';
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

function AppLayout() {
  const { darkMode, user, authLoading, toggleDarkMode } = useJobs();

  // ✅ Detect mobile screen
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // ✅ Apply dark mode logic
  useEffect(() => {
    if (isMobile) {
      document.documentElement.classList.add('dark');
    } else {
      darkMode
        ? document.documentElement.classList.add('dark')
        : document.documentElement.classList.remove('dark');
    }
  }, [darkMode, isMobile]);

  // ⏳ Loading screen
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

  // 🔐 Not logged in
  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 transition-colors duration-300">

      {/* ── Top Navbar (Mobile + Desktop) ── */}
      <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-ink-800 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-ink-900 dark:bg-amber-400 flex items-center justify-center">
              <span className="text-white dark:text-ink-950 text-sm">💼</span>
            </div>
            <span className="font-display text-xl font-bold text-ink-900 dark:text-white">
              Traqr
            </span>
          </div>

          {/* Dark Mode Toggle (Disabled on Mobile) */}
          <button
            onClick={() => {
              if (!isMobile) toggleDarkMode();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-ink-100 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-amber-400 text-sm transition-all active:scale-95"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex">

        {/* Sidebar */}
        <Navbar />

        {/* Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddJob />} />
              <Route path="/jobs" element={<AllJobs />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/ai-tools" element={<AITools />} />
              <Route path="/resume" element={<ResumeAnalyzer />} />
              <Route path="/interview" element={<InterviewPrep />} />
              <Route path="/networking" element={<NetworkingTracker />} />
              
              {/* 404 Page */}
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <p className="text-5xl font-display font-bold text-ink-200 dark:text-ink-700">
                      404
                    </p>
                    <p className="text-ink-400">Page not found</p>
                    <a href="/" className="btn-secondary">← Go Home</a>
                  </div>
                }
              />
            </Routes>
          </div>
        </main>

      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <JobProvider>
        <AppLayout />
      </JobProvider>
    </BrowserRouter>
  );
}