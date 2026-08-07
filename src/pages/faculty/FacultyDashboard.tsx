import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { subscribeToPendingActivities } from '../../lib/firestore';
import type { Activity, ActivityCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import ReviewDialog from '../../components/ReviewDialog';

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  technical: 'bg-indigo-500/15 text-indigo-300',
  social:    'bg-sky-500/15 text-sky-300',
  sports:    'bg-orange-500/15 text-orange-300',
  other:     'bg-neutral-500/15 text-neutral-300',
};

function TableSkeleton() {
  return (
    <div className="divide-y divide-neutral-800 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4">
          <div className="h-4 bg-neutral-800 rounded w-36" />
          <div className="h-4 bg-neutral-800 rounded w-20" />
          <div className="h-4 bg-neutral-800 rounded w-24" />
          <div className="h-4 bg-neutral-800 rounded w-28" />
          <div className="ml-auto h-6 bg-neutral-800 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export default function FacultyDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Activity | null>(null);

  useEffect(() => {
    const unsub = subscribeToPendingActivities((data) => {
      setActivities(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-semibold text-white">Review Activities</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Real-time pending submissions — updates automatically as students submit
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">
            {loading ? '–' : activities.length} pending review
          </span>
        </div>
        {!loading && activities.length === 0 && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">All caught up!</span>
          </div>
        )}
      </motion.div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
      >
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 px-6 py-3 border-b border-neutral-800 bg-neutral-900/80">
          {['Student', 'Category', 'Submitted', 'Location', ''].map((h) => (
            <span key={h} className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ClipboardCheck className="w-12 h-12 text-neutral-700" />
            <h3 className="text-base font-medium text-neutral-400">No pending reviews</h3>
            <p className="text-sm text-neutral-600">All activities have been reviewed. Check back later.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-neutral-800"
          >
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                variants={rowVariants}
                onClick={() => setSelected(activity)}
                className="grid md:grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 items-center px-6 py-4 cursor-pointer hover:bg-neutral-800/50 transition-colors group"
              >
                {/* Student name + title */}
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {activity.studentName || 'Unknown Student'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">{activity.title}</p>
                </div>

                {/* Category */}
                <div>
                  <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded ${CATEGORY_COLORS[activity.category]}`}>
                    {CATEGORY_LABELS[activity.category]}
                  </span>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-neutral-400">
                    {new Date(activity.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Geo */}
                <div className="flex items-center gap-1.5">
                  {activity.geoLat != null && activity.geoLng != null ? (
                    <>
                      <MapPin className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                      <span className="text-xs text-neutral-500 font-mono">
                        {activity.geoLat.toFixed(4)}, {activity.geoLng.toFixed(4)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-700">Not available</span>
                  )}
                </div>

                {/* Action */}
                <div>
                  <button className="text-xs font-medium text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                    Review <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Review dialog */}
      <ReviewDialog
        activity={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
