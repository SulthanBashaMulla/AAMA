import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  LayoutDashboard,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile } from '../../types';

const NAV_LINKS: Record<UserProfile['role'], Array<{ to: string; label: string; icon: React.ReactNode }>> = {
  student: [
    { to: '/student', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
  faculty: [
    { to: '/faculty', label: 'Review Activities', icon: <ClipboardList className="w-4 h-4" /> },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: <Users className="w-4 h-4" /> },
  ],
};

const ROLE_BADGE: Record<UserProfile['role'], string> = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Admin',
};

const ROLE_BADGE_COLOR: Record<UserProfile['role'], string> = {
  student: 'bg-indigo-500/15 text-indigo-300',
  faculty: 'bg-amber-500/15 text-amber-300',
  admin: 'bg-emerald-500/15 text-emerald-300',
};

export default function AppShell() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = userProfile?.role ?? 'student';
  const links = NAV_LINKS[role];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* ── Sidebar (desktop) ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-neutral-900 border-r border-neutral-800 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white tracking-tight">AAMS</span>
            <p className="text-[10px] text-neutral-500 leading-none mt-0.5">Activity Management</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-3 py-4 border-t border-neutral-800">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors group">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-200 truncate">{userProfile?.name}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ROLE_BADGE_COLOR[role]}`}>
                {ROLE_BADGE[role]}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-400"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile nav ─────────────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">AAMS</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -240 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -240 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 flex"
          >
            <div className="w-64 bg-neutral-900 border-r border-neutral-800 pt-16 flex flex-col">
              <nav className="flex-1 px-3 py-4 space-y-0.5">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-300'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                      }`
                    }
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="px-4 py-4 border-t border-neutral-800">
                <p className="text-sm text-neutral-300 font-medium mb-1">{userProfile?.name}</p>
                <p className="text-xs text-neutral-500 mb-3">{userProfile?.email}</p>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col md:min-h-screen overflow-hidden">
        {/* Top bar (desktop) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
          <div />
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-neutral-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                {initials}
              </div>
              <span className="text-sm font-medium text-neutral-200">{userProfile?.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-3 py-3 border-b border-neutral-700">
                    <p className="text-sm font-medium text-neutral-200">{userProfile?.name}</p>
                    <p className="text-xs text-neutral-500">{userProfile?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto mt-14 md:mt-0">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
