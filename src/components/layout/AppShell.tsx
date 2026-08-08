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
  Home,
  Activity,
  UserRound,
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
  student: 'bg-blue-50 text-blue-800',
  faculty: 'bg-amber-50 text-amber-700',
  admin: 'bg-green-50 text-green-700',
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
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar (desktop) ──────────────────────────────────────────────── */}
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-800">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900">AAMS</span>
            <p className="mt-0.5 text-[10px] leading-none text-slate-500">Activity Management</p>
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
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-200 px-3 py-4">
          <div className="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-800 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{userProfile?.name}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ROLE_BADGE_COLOR[role]}`}>
                {ROLE_BADGE[role]}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="text-slate-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile nav ─────────────────────────────────────────────────────── */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-800">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900">AAMS</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-500 transition-colors hover:text-blue-800"
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
            <div className="flex w-64 flex-col border-r border-slate-200 bg-white pt-16">
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
                          ? 'bg-blue-50 text-blue-800'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="border-t border-slate-200 px-4 py-4">
                <p className="mb-1 text-sm font-medium text-slate-900">{userProfile?.name}</p>
                <p className="mb-3 text-xs text-slate-500">{userProfile?.email}</p>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-900/30" onClick={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden md:min-h-screen">
        {/* Top bar (desktop) */}
        <header className="hidden items-center justify-between border-b border-slate-200 bg-white px-8 py-4 md:flex">
          <div />
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-800 text-xs font-semibold text-white">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-900">{userProfile?.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="border-b border-slate-200 px-3 py-3">
                    <p className="text-sm font-medium text-slate-900">{userProfile?.name}</p>
                    <p className="text-xs text-slate-500">{userProfile?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <div className="mt-14 flex-1 overflow-y-auto pb-20 md:mt-0 md:pb-0">
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

        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white px-3 py-2 md:hidden">
          <NavLink to={links[0]?.to ?? '/'} end className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium ${isActive ? 'text-blue-800' : 'text-slate-500'}`}>
            <Home className="h-5 w-5" />
            Home
          </NavLink>
          <NavLink to={links[0]?.to ?? '/'} end className="flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-slate-500">
            <Activity className="h-5 w-5" />
            Activities
          </NavLink>
          <button type="button" disabled className="flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-slate-300" title="Profile page is not available yet">
            <UserRound className="h-5 w-5" />
            Profile
          </button>
        </nav>
      </main>
    </div>
  );
}
