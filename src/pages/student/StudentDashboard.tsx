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
          stroke="rgba(255,255,255,0.06)"
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
        <span ref={countRef} className="text-3xl font-bold text-white">0</span>
        <p className="text-xs text-neutral-400 mt-0.5">/ {TOTAL_POINTS}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Activity['status'] }) {
  const config = {
    approved: { label: 'Approved', icon: <CheckCircle2 className="w-3 h-3" />, cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
    pending:  { label: 'Pending',  icon: <Clock className="w-3 h-3" />,         cls: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
    rejected: { label: 'Rejected', icon: <XCircle className="w-3 h-3" />,       cls: 'bg-red-500/15 text-red-300 border-red-500/20' },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.cls}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  technical: 'bg-indigo-500/15 text-indigo-300',
  social:    'bg-sky-500/15 text-sky-300',
  sports:    'bg-orange-500/15 text-orange-300',
  other:     'bg-neutral-500/15 text-neutral-300',
};

// Skeleton loader
function ActivitySkeleton() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-neutral-800 rounded w-2/3" />
          <div className="h-3 bg-neutral-800 rounded w-1/3" />
        </div>
        <div className="h-5 w-16 bg-neutral-800 rounded-full" />
      </div>
      <div className="mt-3 h-3 bg-neutral-800 rounded w-full" />
      <div className="mt-1 h-3 bg-neutral-800 rounded w-4/5" />
    </div>
  );
}

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsub = subscribeToStudentActivities(userProfile.uid, (data) => {
      setActivities(data);
      setLoading(false);
    });
    return unsub;
  }, [userProfile?.uid]);

  const approvedPoints = activities
    .filter((a) => a.status === 'approved')
    .reduce((sum, a) => sum + a.points, 0);

  const stats = [
    { label: 'Total Submitted', value: activities.length, icon: <FileText className="w-5 h-5" />, color: 'text-indigo-400' },
    { label: 'Approved', value: activities.filter((a) => a.status === 'approved').length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400' },
    { label: 'Pending Review', value: activities.filter((a) => a.status === 'pending').length, icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
    { label: 'Points Earned', value: approvedPoints, icon: <Award className="w-5 h-5" />, color: 'text-indigo-400' },
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
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome, {userProfile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {userProfile?.department} · {userProfile?.rollNumber}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSubmit(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
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
        className="bg-gradient-to-br from-indigo-600/10 to-neutral-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
      >
        <ProgressRing points={approvedPoints} />
        <div>
          <p className="text-sm text-indigo-300 font-medium uppercase tracking-wider mb-1">AICTE Points Progress</p>
          <p className="text-3xl font-bold text-white">{approvedPoints} <span className="text-neutral-400 text-xl font-normal">/ 100 points</span></p>
          <div className="mt-2 w-full bg-neutral-800 rounded-full h-1.5 max-w-xs">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(approvedPoints, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
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
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 cursor-default"
            >
              <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activities list */}
      <div>
        <h2 className="text-base font-semibold text-neutral-200 mb-4">My Activities</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <ActivitySkeleton key={i} />)}
          </div>
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-2xl border border-dashed border-neutral-800"
          >
            <FileText className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-neutral-400">No activities submitted yet</h3>
            <p className="text-xs text-neutral-600 mt-1 mb-4">
              Submit your first activity to start earning AICTE points
            </p>
            <button
              onClick={() => setShowSubmit(true)}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
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
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white truncate">{activity.title}</h3>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${CATEGORY_COLORS[activity.category]}`}>
                          {CATEGORY_LABELS[activity.category]}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Submitted {new Date(activity.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={activity.status} />
                  </div>

                  {activity.description && (
                    <p className="text-xs text-neutral-400 mt-3 line-clamp-2">{activity.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
                    <div className="flex items-center gap-3">
                      {activity.certificateUrl && (
                        <a
                          href={activity.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Certificate
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.status === 'approved' && (
                        <>
                          <span className="text-xs font-semibold text-emerald-400">+{activity.points} pts</span>
                          <button
                            onClick={() => downloadCertificate(activity, userProfile?.name ?? 'Student')}
                            title="Download PDF certificate"
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </>
                      )}
                      {activity.reviewComment && (
                        <span className="text-xs text-neutral-500 italic">"{activity.reviewComment}"</span>
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
