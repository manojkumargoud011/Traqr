import { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const JobContext = createContext(null);

export const JobProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [darkMode, setDarkMode] = useLocalStorage('traqr_dark', false);
  const [dismissedReminders, setDismissedReminders] = useLocalStorage('traqr_dismissed', []);

  // ── Listen for auth state ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Load jobs from Firestore ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setJobs([]); return; }
    const q = query(
      collection(db, 'jobs'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setJobs(data);
    });
    return () => unsub();
  }, [user]);

  // ── Load contacts from Firestore ───────────────────────────────────────────
  useEffect(() => {
    if (!user) { setContacts([]); return; }
    const q = query(
      collection(db, 'contacts'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setContacts(data);
    });
    return () => unsub();
  }, [user]);

  // ── Jobs CRUD ──────────────────────────────────────────────────────────────

  const addJob = useCallback(async (data) => {
    if (!user) return;
    await addDoc(collection(db, 'jobs'), {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      followedUp: false,
      interviewNotes: [],
      coverLetter: '',
      matchScore: null,
    });
  }, [user]);

  const updateJob = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'jobs', id), updates);
  }, []);

  const deleteJob = useCallback(async (id) => {
    await deleteDoc(doc(db, 'jobs', id));
  }, []);

  const getJob = useCallback((id) => {
    return jobs.find(j => j.id === id);
  }, [jobs]);

  // ── Interview Notes ────────────────────────────────────────────────────────

  const addInterviewNote = useCallback(async (jobId, note) => {
    const job = jobs.find(j => j.id === jobId);
    const newNote = {
      id: uuidv4(),
      ...note,
      date: new Date().toISOString().slice(0, 10)
    };
    const updatedNotes = [...(job?.interviewNotes || []), newNote];
    await updateDoc(doc(db, 'jobs', jobId), { interviewNotes: updatedNotes });
  }, [jobs]);

  const deleteInterviewNote = useCallback(async (jobId, noteId) => {
    const job = jobs.find(j => j.id === jobId);
    const updatedNotes = (job?.interviewNotes || []).filter(n => n.id !== noteId);
    await updateDoc(doc(db, 'jobs', jobId), { interviewNotes: updatedNotes });
  }, [jobs]);

  // ── Contacts CRUD ──────────────────────────────────────────────────────────

  const addContact = useCallback(async (data) => {
    if (!user) return;
    await addDoc(collection(db, 'contacts'), {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    });
  }, [user]);

  const updateContact = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'contacts', id), updates);
  }, []);

  const deleteContact = useCallback(async (id) => {
    await deleteDoc(doc(db, 'contacts', id));
  }, []);

  // ── Reminders ─────────────────────────────────────────────────────────────

  const dismissReminder = useCallback((id) => {
    setDismissedReminders(prev => [...prev, id]);
  }, [setDismissedReminders]);

  // ── Dark Mode ──────────────────────────────────────────────────────────────

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, [setDarkMode]);

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    signOut(auth);
  }, []);

  const value = useMemo(() => ({
    user,
    authLoading,
    jobs,
    contacts,
    darkMode,
    dismissedReminders,
    addJob,
    updateJob,
    deleteJob,
    getJob,
    addInterviewNote,
    deleteInterviewNote,
    addContact,
    updateContact,
    deleteContact,
    dismissReminder,
    toggleDarkMode,
    logout,
  }), [
    user, authLoading, jobs, contacts,
    darkMode, dismissedReminders,
    addJob, updateJob, deleteJob, getJob,
    addInterviewNote, deleteInterviewNote,
    addContact, updateContact, deleteContact,
    dismissReminder, toggleDarkMode, logout
  ]);

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error('useJobs must be used within JobProvider');
  return ctx;
};