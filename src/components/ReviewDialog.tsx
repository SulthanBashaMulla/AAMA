import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { reviewActivity } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { Activity, ActivityCategory } from '../types';
import { CATEGORY_LABELS, CATEGORY_POINTS } from '../types';

interface Props {
  activity: Activity | null;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  technical: 'bg-blue-50 text-blue-800',
  social:    'bg-sky-50 text-sky-700',
  sports:    'bg-orange-50 text-orange-700',
  other:     'bg-slate-100 text-slate-600',
};

function GeoDisplay({ lat, lng }: { lat: number; lng: number }) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&marker=${lat},${lng}`;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <iframe
        src={mapUrl}
        title="Submission location map"
        className="w-full h-36 border-0"
        loading="lazy"
      />
      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2">
        <MapPin className="h-3 w-3 text-slate-400" />
        <span className="font-mono text-xs text-slate-500">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>
    </div>
  );
}

export default function ReviewDialog({ activity, onClose }: Props) {
  const { userProfile } = useAuth();
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [comment, setComment] = useState('');
  const [customPoints, setCustomPoints] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (submitting) return;
    setDecision(null);
    setComment('');
    setCustomPoints('');
    setError('');
    onClose();
  };

  const suggestedPoints = activity ? CATEGORY_POINTS[activity.category] : 0;
  const pointsToAward = decision === 'approved' ? (customPoints === '' ? suggestedPoints : Number(customPoints)) : 0;

  const handleSubmit = async () => {
    if (!activity || !decision || !userProfile) return;
    if (decision === 'approved' && (pointsToAward <= 0 || pointsToAward > 100)) {
      setError('Points must be between 1 and 100.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await reviewActivity(
        activity.id,
        decision,
        userProfile.name,
        comment.trim(),
        pointsToAward
      );
      handleClose();
    } catch {
      setError('Review failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {activity && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Review Submission</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{activity.studentName}</p>
                </div>
                <button onClick={handleClose} disabled={submitting} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                {/* Activity info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">{activity.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[activity.category]}`}>
                          {CATEGORY_LABELS[activity.category]}
                        </span>
                        <span className="text-xs text-slate-500">
                          Submitted {new Date(activity.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {activity.description && (
                    <p className="text-sm leading-relaxed text-slate-600">{activity.description}</p>
                  )}

                  {/* Certificate link */}
                  {activity.certificateUrl && (
                    <a
                      href={activity.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-800 transition-colors hover:text-blue-700"
                    >
                      <FileText className="w-4 h-4" />
                      View certificate
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Geo display */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Submission location</p>
                  {activity.geoLat != null && activity.geoLng != null ? (
                    <GeoDisplay lat={activity.geoLat} lng={activity.geoLng} />
                  ) : (
                    <div className="flex h-14 items-center justify-center gap-2 rounded-lg bg-slate-100">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Location not available</span>
                    </div>
                  )}
                </div>

                {/* Decision */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Decision</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDecision('approved')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        decision === 'approved'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-slate-300 text-slate-500 hover:border-green-500 hover:text-green-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => setDecision('rejected')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        decision === 'rejected'
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-700'
                      }`}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>

                {/* Points (if approving) */}
                {decision === 'approved' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1.5"
                  >
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Points to award
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        placeholder={String(suggestedPoints)}
                        value={customPoints}
                        onChange={(e) => setCustomPoints(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
                      />
                      <span className="text-xs text-slate-500">
                        Suggested: <span className="font-medium text-slate-700">{suggestedPoints} pts</span> for {CATEGORY_LABELS[activity.category]}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Comment */}
                {decision && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1.5"
                  >
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Comment <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={decision === 'approved' ? 'Well done! Keep it up.' : 'Please resubmit with a valid certificate.'}
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
                    />
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!decision || submitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    'Submit Review'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
