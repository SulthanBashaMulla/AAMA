import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, AlertCircle, Mail, LockKeyhole } from 'lucide-react';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestore';

const ROLE_HOME = {
  student: '/student',
  faculty: '/faculty',
  admin: '/admin',
} as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(cred.user.uid);
      if (!profile) {
        setError('Account profile not found. Please contact support.');
        return;
      }
      const destination = from && from !== '/login' ? from : ROLE_HOME[profile.role];
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setError('Invalid email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 font-sans text-slate-900 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(30,64,175,0.08),transparent_30rem)]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-[28rem]"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-blue-800">AAMS</h1>
            <p className="mt-3 text-base text-slate-500">Sign in to continue your session.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative rounded-lg border border-slate-300 bg-white transition focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-800/20">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full rounded-lg bg-transparent py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Email address"
              />
            </div>

            <div className="group relative rounded-lg border border-slate-300 bg-white transition focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-800/20">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full rounded-lg bg-transparent py-3.5 pl-10 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Password"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-blue-800">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="mb-5 mt-2 flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-800" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-blue-800 transition hover:text-blue-700">Forgot password?</a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New student?{' '}
            <Link to="/signup" className="font-semibold text-blue-800 transition hover:text-blue-700">
              Create account
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Faculty & admin accounts are provisioned by the institution.
        </p>
      </motion.div>
    </div>
  );
}
