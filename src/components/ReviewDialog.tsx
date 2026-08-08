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
  technical: 'bg-indigo-500/15 text-indigo-300',
  social:    'bg-sky-500/15 text-sky-300',
  sports:    'bg-orange-500/15 text-orange-300',
  other:     'bg-neutral-500/15 text-neutral-300',
};

function GeoDisplay({ lat, lng }: { lat: number; lng: number }) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&marker=${lat},${lng}`;

  return (
    <div className="rounded-lg overflow-hidden border border-neutral-700">
      <iframe
        src={mapUrl}
        title="Submission location map"
        className="w-full h-36 border-0"
        loading="lazy"
      />
      <div className="px-3 py-2 bg-neutral-800/50 flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-neutral-500" />
        <span className="text-xs text-neutral-500 font-mono">
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-base font-semibold text-white">Review Submission</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">{activity.studentName}</p>
                </div>
                <button onClick={handleClose} disabled={submitting} className="text-neutral-500 hover:text-neutral-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Activity info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{activity.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${CATEGORY_COLORS[activity.category]}`}>
                          {CATEGORY_LABELS[activity.category]}
                        </span>
                        <span className="text-xs text-neutral-500">
                          Submitted {new Date(activity.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-neutral-400 leading-relaxed">{activity.description}</p>
                  )}

                  {/* Certificate link */}
                  {activity.certificateUrl && (
                    <a
                      href={activity.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View certificate
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Geo display */}
                <div>
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Submission location</p>
                  {activity.geoLat != null && activity.geoLng != null ? (
                    <GeoDisplay lat={activity.geoLat} lng={activity.geoLng} />
                  ) : (
                    <div className="h-14 rounded-lg bg-neutral-800 flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-600" />
                      <span className="text-sm text-neutral-600">Location not available</span>
                    </div>
                  )}
                </div>

                {/* Decision */}
                <div>
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Decision</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDecision('approved')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        decision === 'approved'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'border-neutral-700 text-neutral-400 hover:border-emerald-600 hover:text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => setDecision('rejected')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        decision === 'rejected'
                          ? 'bg-red-500/15 border-red-500 text-red-300'
                          : 'border-neutral-700 text-neutral-400 hover:border-red-600 hover:text-red-400'
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
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
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
                        className="w-24 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <span className="text-xs text-neutral-500">
                        Suggested: <span className="text-neutral-300 font-medium">{suggestedPoints} pts</span> for {CATEGORY_LABELS[activity.category]}
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
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Comment <span className="text-neutral-600 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={decision === 'approved' ? 'Well done! Keep it up.' : 'Please resubmit with a valid certificate.'}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-400">{error}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!decision || submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
