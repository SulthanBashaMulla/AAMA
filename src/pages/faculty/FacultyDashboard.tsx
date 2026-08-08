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
  technical: 'bg-blue-50 text-blue-800',
  social:    'bg-sky-50 text-sky-700',
  sports:    'bg-orange-50 text-orange-700',
  other:     'bg-slate-100 text-slate-600',
};

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-slate-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="ml-auto h-6 w-16 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function FacultyDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Activity | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = subscribeToPendingActivities((data) => {
      setActivities(data);
      setLoading(false);
    }, (listenerError) => {
      setLoading(false);
      setError(listenerError.message);
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
    <div className="mx-auto max-w-7xl space-y-6 bg-slate-50 p-5 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">Review Activities</h1>
        <p className="mt-1 text-sm text-slate-500">
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
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">
            {loading ? '–' : activities.length} pending review
          </span>
        </div>
        {!loading && activities.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">All caught up!</span>
          </div>
        )}
      </motion.div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Table header */}
        <div className="hidden border-b border-slate-200 bg-slate-50 px-6 py-3 md:grid md:grid-cols-[2fr_1fr_1fr_1.5fr_auto] md:gap-4">
          {['Student', 'Category', 'Submitted', 'Location', ''].map((h) => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</span>
          ))}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm font-medium text-red-600">Couldn't load pending activities — please refresh</p>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ClipboardCheck className="h-12 w-12 text-slate-300" />
            <h3 className="text-base font-medium text-slate-600">No pending reviews</h3>
            <p className="text-sm text-slate-500">All activities have been reviewed. Check back later.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-100"
          >
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                variants={rowVariants}
                onClick={() => setSelected(activity)}
                className="grid cursor-pointer items-center gap-4 px-6 py-4 transition-colors hover:bg-blue-50/40 group md:grid-cols-[2fr_1fr_1fr_1.5fr_auto]"
              >
                {/* Student name + title */}
                <div>
                  <p className="text-sm font-medium text-slate-900 transition-colors group-hover:text-blue-800">
                    {activity.studentName || 'Unknown Student'}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{activity.title}</p>
                </div>

                {/* Category */}
                <div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[activity.category]}`}>
                    {CATEGORY_LABELS[activity.category]}
                  </span>
                </div>

                {/* Date */}
                <div>
                    <p className="text-xs text-slate-600">
                    {new Date(activity.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Geo */}
                <div className="flex items-center gap-1.5">
                  {activity.geoLat != null && activity.geoLng != null ? (
                    <>
                      <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
                      <span className="font-mono text-xs text-slate-500">
                        {activity.geoLat.toFixed(4)}, {activity.geoLng.toFixed(4)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">Not available</span>
                  )}
                </div>

                {/* Action */}
                <div>
                  <button className="flex items-center gap-1 text-xs font-medium text-blue-800 group-hover:text-blue-700">
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
