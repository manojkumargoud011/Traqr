import { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { Briefcase, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found. Please sign up.');
      else if (err.code === 'auth/wrong-password') setError('Wrong password. Try again.');
      else if (err.code === 'auth/email-already-in-use') setError('Email already registered. Sign in instead.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else if (err.code === 'auth/invalid-email') setError('Please enter a valid email address.');
      else setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Google sign-in failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950 p-4">
      <div className="card p-8 w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-ink-900 dark:bg-amber-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6 text-white dark:text-ink-950" />
          </div>
          <h1 className="text-3xl font-display font-bold text-ink-900 dark:text-white">
            Traqr
          </h1>
          <p className="text-ink-400 text-sm">
            {isSignup ? 'Create your free account' : 'Welcome back'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              <input
                type="email"
                className="input pl-10"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              <input
                type="password"
                className="input pl-10"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-ink-100 dark:bg-ink-800" />
          <span className="text-xs text-ink-400">or</span>
          <div className="flex-1 h-px bg-ink-100 dark:bg-ink-800" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="btn-secondary w-full justify-center gap-3"
        >
          <span className="text-lg font-bold">G</span>
          Continue with Google
        </button>

        {/* Toggle */}
        <p className="text-center text-sm text-ink-400">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            onClick={() => { setIsSignup(p => !p); setError(''); }}
            className="ml-1.5 text-amber-600 dark:text-amber-400 font-semibold hover:underline"
          >
            {isSignup ? 'Sign In' : 'Sign Up Free'}
          </button>
        </p>

      </div>
    </div>
  );
}