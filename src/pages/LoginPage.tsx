import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#222831] px-4 py-12 font-sans text-[#EEEEEE] sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,211,105,0.08),transparent_32rem)]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-[28rem]"
      >
        <div className="rounded-2xl border border-white/5 bg-[rgba(57,62,70,0.5)] p-7 backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-5xl font-extrabold tracking-[-0.04em] text-[#FFD369]">AAMS</h1>
            <p className="mt-3 text-base text-[#ADB5BD]">Sign in to continue your session.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2 rounded-lg border border-[#E07070]/20 bg-[#E07070]/10 px-3 py-2.5"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E07070]" />
              <span className="text-sm text-[#E07070]">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative rounded-lg border border-white/20 bg-[#393E46]/45 transition focus-within:border-[#FFD369] focus-within:ring-2 focus-within:ring-[#FFD369]/30">
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full rounded-lg bg-transparent px-4 pb-2 pt-6 text-base text-[#EEEEEE] outline-none placeholder:text-transparent"
              />
              <label htmlFor="email" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 uppercase tracking-[0.12em] text-xs text-[#ADB5BD] transition-all peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#FFD369] peer-valid:top-2 peer-valid:translate-y-0 peer-valid:text-[10px]">Email address</label>
            </div>

            <div className="group relative rounded-lg border border-white/20 bg-[#393E46]/45 transition focus-within:border-[#FFD369] focus-within:ring-2 focus-within:ring-[#FFD369]/30">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full rounded-lg bg-transparent px-4 pb-2 pt-6 pr-12 text-base text-[#EEEEEE] outline-none placeholder:text-transparent"
                placeholder=" "
              />
              <label htmlFor="password" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 uppercase tracking-[0.12em] text-xs text-[#ADB5BD] transition-all peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#FFD369] peer-valid:top-2 peer-valid:translate-y-0 peer-valid:text-[10px]">Password</label>
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#ADB5BD] transition hover:text-[#FFD369]">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="mb-5 mt-2 flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#ADB5BD]">
                <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-[#393E46] text-[#FFD369] focus:ring-[#FFD369] focus:ring-offset-[#222831]" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#FFD369] transition hover:text-[#FFDD89]">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFD369] px-4 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-[#222831] transition hover:shadow-[0_0_22px_rgba(255,211,105,0.15)] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FFD369] focus:ring-offset-2 focus:ring-offset-[#222831]"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#222831]/30 border-t-[#222831]" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#ADB5BD]">
            New student?{' '}
            <Link to="/signup" className="font-bold text-[#FFD369] transition hover:text-[#FFDD89]">
              Create account
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-[#ADB5BD]/70">
          Faculty & admin accounts are provisioned by the institution.
        </p>
      </motion.div>
    </div>
  );
}
