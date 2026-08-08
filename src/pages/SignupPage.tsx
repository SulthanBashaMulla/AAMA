import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { UserPlus, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">AAMS</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
          <p className="text-sm text-neutral-400 mb-6">Register as a student to track your activity points</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-amber-300">{successMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Arjun Sharma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Roll number</label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="21CS001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Department</label>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">Select…</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Account role</label>
                <select
                  required
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as UserProfile['role']);
                    setInviteCode('');
                  }}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {role !== 'student' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Invite Code</label>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter your invite code"
                  />
                  {validatingInvite && (
                    <p className="mt-1 text-xs text-neutral-500">Invite code will be verified during account creation.</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email address</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="you@college.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Confirm password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Re-enter password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? (validatingInvite ? 'Verifying invite…' : 'Creating account…') : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
