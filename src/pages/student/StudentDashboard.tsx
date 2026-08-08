import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Plus,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  TrendingUp,
  Download,
} from 'lucide-react';
import { animate } from 'animejs';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToStudentActivities } from '../../lib/firestore';
import type { Activity, ActivityCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import SubmitActivityModal from './SubmitActivityModal';
import { downloadCertificate } from '../../lib/pdfCertificate';

const TOTAL_POINTS = 100;
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ points }: { points: number }) {
  const ringRef = useRef<SVGCircleElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const pct = Math.min(points / TOTAL_POINTS, 1);

  useEffect(() => {
    const offset = RING_CIRCUMFERENCE * (1 - pct);
    if (ringRef.current) {
      animate(ringRef.current, {
        strokeDashoffset: [RING_CIRCUMFERENCE, offset],
        duration: 1400,
        easing: 'easeInOutQuart',
      });
    }
    if (countRef.current) {
      const obj = { count: 0 };
      animate(obj, {
        count: points,
        duration: 1200,
        easing: 'easeOutExpo',
        onUpdate() {
          if (countRef.current) {
            countRef.current.textContent = String(Math.round(obj.count));
          }
        },
      });
    }
  }, [points, pct]);

  const color = pct >= 1 ? '#10b981' : pct >= 0.5 ? '#6366f1' : '#6366f1';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        {/* Track */}
        <circle
          cx="64" cy="64" r={RING_RADIUS}
          fill="none"
          stroke="rgba(148,163,184,0.25)"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          ref={ringRef}
          cx="64" cy="64" r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE}
        />
      </svg>
      <div className="absolute text-center">
        <span ref={countRef} className="text-3xl font-bold text-slate-900">0</span>
        <p className="mt-0.5 text-xs text-slate-500">/ {TOTAL_POINTS}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Activity['status'] }) {
  const config = {
    approved: { label: 'Approved', icon: <CheckCircle2 className="w-3 h-3" />, cls: 'bg-green-50 text-green-700 border-green-200' },
    pending:  { label: 'Pending',  icon: <Clock className="w-3 h-3" />,         cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    rejected: { label: 'Rejected', icon: <XCircle className="w-3 h-3" />,       cls: 'bg-red-50 text-red-700 border-red-200' },
  }[status];

  return (
    <motion.span key={status} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.cls}`}>
      {config.icon}
      {config.label}
    </motion.span>
  );
}

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  technical: 'bg-blue-50 text-blue-800',
  social:    'bg-sky-50 text-sky-700',
  sports:    'bg-orange-50 text-orange-700',
  other:     'bg-slate-100 text-slate-600',
};

// Skeleton loader
function ActivitySkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/3 rounded bg-slate-200" />
        </div>
        <div className="h-5 w-16 rounded-full bg-slate-200" />
      </div>
      <div className="mt-3 h-3 w-full rounded bg-slate-200" />
      <div className="mt-1 h-3 w-4/5 rounded bg-slate-200" />
    </div>
  );
}

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) return;
    setLoading(true);
    setError(null);
    const unsub = subscribeToStudentActivities(userProfile.uid, (data) => {
      setActivities(data);
      setLoading(false);
    }, (listenerError) => {
      setLoading(false);
      setError(listenerError.message);
    });
    return unsub;
  }, [userProfile?.uid]);

  const approvedPoints = activities
    .filter((a) => a.status === 'approved')
    .reduce((sum, a) => sum + a.points, 0);

  const stats = [
    { label: 'Total Submitted', value: activities.length, icon: <FileText className="w-5 h-5" />, color: 'text-blue-800' },
    { label: 'Approved', value: activities.filter((a) => a.status === 'approved').length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400' },
    { label: 'Pending Review', value: activities.filter((a) => a.status === 'pending').length, icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
    { label: 'Points Earned', value: approvedPoints, icon: <Award className="w-5 h-5" />, color: 'text-blue-800' },
  ];

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 bg-slate-50 p-5 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {userProfile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {userProfile?.department} · {userProfile?.rollNumber}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSubmit(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Submit Activity
        </motion.button>
      </motion.div>

      {/* Points Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex flex-col items-center gap-6 rounded-xl border border-blue-100 bg-white p-6 shadow-sm sm:flex-row"
      >
        <ProgressRing points={approvedPoints} />
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-800">AICTE Points Progress</p>
          <p className="text-3xl font-bold text-slate-900">{approvedPoints} <span className="text-xl font-normal text-slate-500">/ 100 points</span></p>
          <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(approvedPoints, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-1.5 rounded-full bg-blue-800"
            />
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <TrendingUp className="w-3 h-3" />
            {approvedPoints >= 100
              ? '🎉 Requirement complete!'
              : `${100 - approvedPoints} more points needed to complete the requirement`}
          </p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="cursor-default rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activities list */}
      <div>
        <h2 className="mb-4 text-base font-bold text-slate-900">My Activities</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <ActivitySkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-red-200 py-16 text-center">
            <p className="text-sm font-medium text-red-600">Couldn't load your activities — please refresh</p>
            <p className="mt-2 text-xs text-slate-500">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-slate-300 py-16 text-center"
          >
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h3 className="text-sm font-medium text-slate-600">No activities submitted yet</h3>
            <p className="mb-4 mt-1 text-xs text-slate-500">
              Submit your first activity to start earning AICTE points
            </p>
            <button
              onClick={() => setShowSubmit(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-800 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" /> Submit your first activity
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {activities.map((activity) => (
              <motion.div key={activity.id} variants={itemVariants}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="truncate text-sm font-semibold text-slate-900">{activity.title}</h3>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${CATEGORY_COLORS[activity.category]}`}>
                          {CATEGORY_LABELS[activity.category]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Submitted {new Date(activity.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={activity.status} />
                  </div>

                  {activity.description && (
                    <p className="mt-3 line-clamp-2 text-xs text-slate-600">{activity.description}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3">
                      {activity.certificateUrl && (
                        <a
                          href={activity.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-800 hover:text-blue-700"
                        >
                          <FileText className="w-3 h-3" /> Certificate
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.status === 'approved' && (
                        <>
                          <span className="text-xs font-semibold text-green-700">+{activity.points} pts</span>
                          <button
                            onClick={() => downloadCertificate(activity, userProfile?.name ?? 'Student')}
                            title="Download PDF certificate"
                            className="flex items-center gap-1 text-xs text-blue-800 transition-colors hover:text-blue-700"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </>
                      )}
                      {activity.reviewComment && (
                        <span className="text-xs italic text-slate-500">"{activity.reviewComment}"</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <SubmitActivityModal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        studentId={userProfile?.uid ?? ''}
        studentName={userProfile?.name ?? ''}
      />
    </div>
  );
}
