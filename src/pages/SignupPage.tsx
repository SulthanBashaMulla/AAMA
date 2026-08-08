import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { UserPlus, AlertCircle, CheckCircle2, User, Hash, Building2, Mail, LockKeyhole, KeyRound, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { createUserProfile, upgradeUserRole } from '../lib/firestore';
import type { UserProfile } from '../types';

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('student');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingInvite, setValidatingInvite] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const configuredCode = role === 'faculty'
      ? import.meta.env.VITE_FACULTY_INVITE_CODE
      : role === 'admin'
        ? import.meta.env.VITE_ADMIN_INVITE_CODE
        : undefined;
    const inviteCodeMatches = role === 'student'
      || (Boolean(configuredCode) && inviteCode === configuredCode);

    setLoading(true);
    setValidatingInvite(role !== 'student');
    let createdUser = null;

    try {
      // Step 1: Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      createdUser = cred.user;

      // Step 2: Write Firestore profile document
      // ── Correction #6: If this fails, we delete the orphaned auth account ──
      try {
        await createUserProfile({
          uid: createdUser.uid,
          name: name.trim(),
          email: email.trim(),
          role: 'student',
          rollNumber: rollNumber.trim(),
          department: department.trim(),
        });
      } catch (profileError) {
        // Profile write failed — clean up orphaned auth account
        await createdUser.delete();
        setError('Account creation failed due to a network error. Please try again.');
        return;
      }

      let destination: '/student' | '/faculty' | '/admin' = '/student';
      let fallbackToStudent = false;
      if (role !== 'student') {
        if (inviteCodeMatches) {
          try {
            await upgradeUserRole(createdUser.uid, role, inviteCode);
            destination = `/${role}` as typeof destination;
          } catch (upgradeError) {
            console.error('Invite code role upgrade failed:', upgradeError);
            setSuccessMessage('Invite code could not be verified — account created as Student.');
            fallbackToStudent = true;
          }
        } else {
          setSuccessMessage('Invite code invalid — account created as Student.');
          fallbackToStudent = true;
        }
      }

      if (fallbackToStudent) {
        setTimeout(() => navigate('/student', { replace: true }), 1200);
      } else {
        navigate(destination, { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else if (msg.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setValidatingInvite(false);
      setLoading(false);
    }
  };

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-8">

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-800">AAMS</h1>
          <p className="mt-2 text-sm text-slate-500">Create your institutional account.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Create account</h2>
          <p className="mt-1 text-sm text-slate-500">Register to track your activity points.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <span className="text-sm text-amber-700">{successMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-5 grid grid-cols-3 gap-1 rounded-lg bg-blue-50 p-1">
              {(['student', 'faculty', 'admin'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { setRole(option); setInviteCode(''); }}
                  className={`rounded-md px-2 py-2 text-xs font-semibold capitalize transition ${role === option ? 'bg-blue-800 text-white shadow-sm' : 'text-slate-500 hover:text-blue-800'}`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Full name</label>
                <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 transition" placeholder="Arjun Sharma" /></div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Roll number</label>
                <div className="relative"><Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" required value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 transition" placeholder="21CS001" /></div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Department</label>
                <div className="relative"><Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm text-slate-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 transition"
                >
                  <option value="">Select…</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select></div>
              </div>

              {role !== 'student' && (
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Invite code</label>
                  <div className="relative"><ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 transition" placeholder="Enter your invite code" /></div>
                  {validatingInvite && (
                    <p className="mt-1 text-xs text-slate-500">Invite code will be verified during account creation.</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email address</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 transition" placeholder="you@college.edu" /></div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Password</label>
              <div className="relative"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 transition" placeholder="Min. 6 characters" /></div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Confirm password</label>
              <div className="relative"><KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 transition" placeholder="Re-enter password" /></div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? (validatingInvite ? 'Verifying invite…' : 'Creating account…') : 'Create account'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-800 transition hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
