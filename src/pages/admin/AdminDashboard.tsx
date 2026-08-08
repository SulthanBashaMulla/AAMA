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
  technical: 'bg-indigo-500/15 text-indigo-300',
  social:    'bg-sky-500/15 text-sky-300',
  sports:    'bg-orange-500/15 text-orange-300',
  other:     'bg-neutral-500/15 text-neutral-300',
};

function Skeleton() {
  return (
    <div className="divide-y divide-neutral-800 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-6 py-4 grid grid-cols-5 gap-4 items-center">
          <div className="h-4 bg-neutral-800 rounded w-32" />
          <div className="h-4 bg-neutral-800 rounded w-20" />
          <div className="h-6 bg-neutral-800 rounded-full w-14" />
          <div className="flex gap-1">
            <div className="h-5 bg-neutral-800 rounded w-14" />
            <div className="h-5 bg-neutral-800 rounded w-14" />
          </div>
          <div className="h-2 bg-neutral-800 rounded w-full" />
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-semibold text-white">Admin Overview</h1>
        <p className="text-sm text-neutral-400 mt-1">Institution-wide AICTE activity points summary</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Students', value: loading ? '–' : totalStudents, icon: <Users className="w-5 h-5" />, color: 'text-indigo-400' },
          { label: 'Requirement Complete', value: loading ? '–' : completedStudents, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400' },
          { label: 'Avg. Points', value: loading ? '–' : avgPoints, icon: <TrendingUp className="w-5 h-5" />, color: 'text-sky-400' },
          { label: 'Pending Reviews', value: loading ? '–' : pendingCount, icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={rowVariants}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Students table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-200">Student Records</h2>
          <span className="text-xs text-neutral-500">{totalStudents} students</span>
        </div>

        {/* Table header */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_2fr_2fr] gap-4 px-6 py-3 border-b border-neutral-800 bg-neutral-900/80">
          {['Student', 'Department', 'Points', 'Status', 'Category Breakdown'].map((h) => (
            <span key={h} className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm font-medium text-red-300">Couldn't load dashboard data — please refresh</p>
            <p className="text-xs text-neutral-600">{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <GraduationCap className="w-12 h-12 text-neutral-700" />
            <h3 className="text-base font-medium text-neutral-400">No students registered yet</h3>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-neutral-800"
          >
            {rows.map((row) => {
              const pct = Math.min(row.totalPoints / 100, 1);
              const complete = row.totalPoints >= 100;
              return (
                <motion.div
                  key={row.profile.uid}
                  variants={rowVariants}
                  className="grid lg:grid-cols-[2fr_1fr_1fr_2fr_2fr] gap-4 items-center px-6 py-4 hover:bg-neutral-800/30 transition-colors"
                >
                  {/* Name & roll */}
                  <div>
                    <p className="text-sm font-medium text-white">{row.profile.name}</p>
                    <p className="text-xs text-neutral-500">{row.profile.rollNumber}</p>
                  </div>

                  {/* Department */}
                  <div>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {row.profile.department ?? '—'}
                    </p>
                  </div>

                  {/* Points */}
                  <div>
                    <p className={`text-sm font-bold ${complete ? 'text-emerald-400' : 'text-white'}`}>
                      {row.totalPoints}
                      <span className="text-neutral-600 font-normal">/100</span>
                    </p>
                    <p className="text-[10px] text-neutral-600">
                      {row.approved} approved · {row.pending} pending
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-medium ${
                        complete ? 'text-emerald-400' : row.totalPoints >= 50 ? 'text-indigo-400' : 'text-neutral-500'
                      }`}>
                        {complete ? '✓ Complete' : `${Math.round(pct * 100)}%`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        className={`h-full rounded-full ${complete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      />
                    </div>
                  </div>

                  {/* Category breakdown */}
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(CATEGORY_LABELS) as ActivityCategory[]).map((cat) =>
                      row.byCategory[cat] ? (
                        <span key={cat} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${CATEGORY_COLORS[cat]}`}>
                          {CATEGORY_LABELS[cat]}: {row.byCategory[cat]}
                        </span>
                      ) : null
                    )}
                    {Object.keys(row.byCategory).length === 0 && (
                      <span className="text-xs text-neutral-700">No approved activities</span>
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
