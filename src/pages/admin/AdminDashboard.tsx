import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { getAllStudents, subscribeToAllActivities } from '../../lib/firestore';
import type { UserProfile, Activity, ActivityCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';

interface StudentRow {
  profile: UserProfile;
  totalPoints: number;
  approved: number;
  pending: number;
  byCategory: Partial<Record<ActivityCategory, number>>;
}

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  technical: 'bg-blue-50 text-blue-800',
  social:    'bg-sky-50 text-sky-700',
  sports:    'bg-orange-50 text-orange-700',
  other:     'bg-slate-100 text-slate-600',
};

function Skeleton() {
  return (
    <div className="animate-pulse divide-y divide-slate-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="grid grid-cols-5 items-center gap-4 px-6 py-4">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-6 w-14 rounded-full bg-slate-200" />
          <div className="flex gap-1">
            <div className="h-5 w-14 rounded bg-slate-200" />
            <div className="h-5 w-14 rounded bg-slate-200" />
          </div>
          <div className="h-2 w-full rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let studentsLoaded = false;
    let activitiesLoaded = false;
    setLoading(true);
    setError(null);

    getAllStudents().then((s) => {
      setStudents(s);
      studentsLoaded = true;
      if (activitiesLoaded) setLoading(false);
    }).catch((loadError: Error) => {
      console.error('Failed to load students:', loadError);
      studentsLoaded = true;
      setLoading(false);
      setError(loadError.message);
    });

    const unsub = subscribeToAllActivities((a) => {
      setActivities(a);
      activitiesLoaded = true;
      if (studentsLoaded) setLoading(false);
    }, (listenerError) => {
      activitiesLoaded = true;
      setLoading(false);
      setError(listenerError.message);
    });

    return unsub;
  }, []);

  // Aggregate rows
  const rows: StudentRow[] = students.map((profile) => {
    const studentActivities = activities.filter((a) => a.studentId === profile.uid);
    const approved = studentActivities.filter((a) => a.status === 'approved');
    const totalPoints = approved.reduce((s, a) => s + a.points, 0);
    const byCategory: Partial<Record<ActivityCategory, number>> = {};
    for (const a of approved) {
      byCategory[a.category] = (byCategory[a.category] ?? 0) + a.points;
    }
    return {
      profile,
      totalPoints,
      approved: approved.length,
      pending: studentActivities.filter((a) => a.status === 'pending').length,
      byCategory,
    };
  });

  const totalStudents = students.length;
  const completedStudents = rows.filter((r) => r.totalPoints >= 100).length;
  const avgPoints = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.totalPoints, 0) / rows.length)
    : 0;
  const pendingCount = activities.filter((a) => a.status === 'pending').length;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 bg-slate-50 p-5 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Institution-wide AICTE activity points summary</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Students', value: loading ? '–' : totalStudents, icon: <Users className="w-5 h-5" />, color: 'text-blue-800' },
          { label: 'Requirement Complete', value: loading ? '–' : completedStudents, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400' },
          { label: 'Avg. Points', value: loading ? '–' : avgPoints, icon: <TrendingUp className="w-5 h-5" />, color: 'text-sky-400' },
          { label: 'Pending Reviews', value: loading ? '–' : pendingCount, icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={rowVariants}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Students table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Student Records</h2>
          <span className="text-xs text-slate-500">{totalStudents} students</span>
        </div>

        {/* Table header */}
        <div className="hidden border-b border-slate-200 bg-slate-50 px-6 py-3 lg:grid lg:grid-cols-[2fr_1fr_1fr_2fr_2fr] lg:gap-4">
          {['Student', 'Department', 'Points', 'Status', 'Category Breakdown'].map((h) => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</span>
          ))}
        </div>

        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm font-medium text-red-600">Couldn't load dashboard data — please refresh</p>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <GraduationCap className="h-12 w-12 text-slate-300" />
            <h3 className="text-base font-medium text-slate-600">No students registered yet</h3>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-100"
          >
            {rows.map((row) => {
              const pct = Math.min(row.totalPoints / 100, 1);
              const complete = row.totalPoints >= 100;
              return (
                <motion.div
                  key={row.profile.uid}
                  variants={rowVariants}
                  className="grid items-center gap-4 px-6 py-4 transition-colors hover:bg-blue-50/40 lg:grid-cols-[2fr_1fr_1fr_2fr_2fr]"
                >
                  {/* Name & roll */}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{row.profile.name}</p>
                    <p className="text-xs text-slate-500">{row.profile.rollNumber}</p>
                  </div>

                  {/* Department */}
                  <div>
                    <p className="line-clamp-2 text-xs text-slate-600">
                      {row.profile.department ?? '—'}
                    </p>
                  </div>

                  {/* Points */}
                  <div>
                    <p className={`text-sm font-bold ${complete ? 'text-emerald-400' : 'text-white'}`}>
                      {row.totalPoints}
                      <span className="font-normal text-slate-400">/100</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {row.approved} approved · {row.pending} pending
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-medium ${
                        complete ? 'text-green-700' : row.totalPoints >= 50 ? 'text-blue-800' : 'text-slate-500'
                      }`}>
                        {complete ? '✓ Complete' : `${Math.round(pct * 100)}%`}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        className={`h-full rounded-full ${complete ? 'bg-green-600' : 'bg-blue-800'}`}
                      />
                    </div>
                  </div>

                  {/* Category breakdown */}
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(CATEGORY_LABELS) as ActivityCategory[]).map((cat) =>
                      row.byCategory[cat] ? (
                        <span key={cat} className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[cat]}`}>
                          {CATEGORY_LABELS[cat]}: {row.byCategory[cat]}
                        </span>
                      ) : null
                    )}
                    {Object.keys(row.byCategory).length === 0 && (
                      <span className="text-xs text-slate-400">No approved activities</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
