import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Upload,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { submitActivity } from '../../lib/firestore';
import type { ActivityCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = '.pdf, .jpg, .jpeg, .png';

// ── Correction #4: Non-blocking geolocation ──────────────────────────────────
// Returns null for both coords if denied/unavailable — submission always continues.
function getGeolocation(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }), // Any error → null
      { timeout: 8000, maximumAge: 30000 }
    );
  });
}

const CATEGORIES: ActivityCategory[] = ['technical', 'social', 'sports', 'other'];

export default function SubmitActivityModal({ open, onClose, studentId, studentName }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('technical');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setCategory('technical');
    setDescription('');
    setFile(null);
    setFileError('');
    setUploadProgress(0);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleClose = () => {
    if (status === 'uploading' || status === 'submitting') return;
    resetForm();
    onClose();
  };

  // ── Correction #8: Client-side file validation ────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError('');
    if (!selected) { setFile(null); return; }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError('Only PDF, JPG, and PNG files are accepted.');
      setFile(null);
      e.target.value = '';
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError(`File is too large (${(selected.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`);
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setFileError('Please attach a certificate.'); return; }
    if (fileError) return;

    setStatus('uploading');
    setErrorMsg('');

    try {
      // 1. Upload to Firebase Storage
      const ext = file.name.split('.').pop();
      const path = `certificates/${studentId}/${Date.now()}.${ext}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
        );
      });

      setStatus('submitting');

      // 2. Get geolocation (non-blocking — never throws)
      const { lat, lng } = await getGeolocation();

      // 3. Write Firestore document
      await submitActivity({
        studentId,
        studentName,
        title: title.trim(),
        category,
        description: description.trim(),
        certificateUrl: downloadUrl,
        geoLat: lat,
        geoLng: lng,
      });

      setStatus('success');
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1800);
    } catch (err) {
      setStatus('error');
      setErrorMsg('Submission failed. Please check your connection and try again.');
    }
  };

  const busy = status === 'uploading' || status === 'submitting';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                <h2 className="text-base font-semibold text-white">Submit Activity</h2>
                <button
                  onClick={handleClose}
                  disabled={busy}
                  className="text-neutral-500 hover:text-neutral-300 disabled:opacity-30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success state */}
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-12 flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Activity Submitted!</h3>
                  <p className="text-sm text-neutral-400 text-center">
                    Your activity is pending review. You'll see it in your dashboard shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Activity title</label>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={busy}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50"
                      placeholder="e.g. Hackathon participation — Smart India Hackathon 2025"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Category</label>
                    <div className="grid grid-cols-4 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          disabled={busy}
                          onClick={() => setCategory(cat)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            category === cat
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'border-neutral-700 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                          } disabled:opacity-50`}
                        >
                          {CATEGORY_LABELS[cat]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={busy}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none disabled:opacity-50"
                      placeholder="Describe what you did, your role, and any achievements…"
                    />
                  </div>

                  {/* File upload */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                      Certificate <span className="text-neutral-600 font-normal">(PDF, JPG, PNG · max 5 MB)</span>
                    </label>
                    <div
                      onClick={() => !busy && fileInputRef.current?.click()}
                      className={`relative rounded-lg border-2 border-dashed px-4 py-5 text-center cursor-pointer transition-colors ${
                        fileError
                          ? 'border-red-500/50 bg-red-500/5'
                          : file
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800/50'
                      } ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_EXTENSIONS}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={busy}
                      />
                      {file ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm text-emerald-300 truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-neutral-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <Upload className="w-5 h-5 text-neutral-500" />
                          <span className="text-sm text-neutral-400">Click to upload certificate</span>
                          <span className="text-xs text-neutral-600">or drag and drop</span>
                        </div>
                      )}
                    </div>
                    {fileError && (
                      <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fileError}
                      </p>
                    )}
                  </div>

                  {/* Upload progress */}
                  {status === 'uploading' && (
                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>Uploading certificate…</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Geo note */}
                  <div className="flex items-start gap-2 rounded-lg bg-neutral-800 px-3 py-2.5">
                    <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-neutral-500">
                      Your browser location will be recorded with this submission (if available). Location access is optional — submission will succeed either way.
                    </p>
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-400">{errorMsg}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={busy}
                      className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busy || !!fileError}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {busy ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {status === 'uploading' ? 'Uploading…' : 'Submitting…'}
                        </>
                      ) : (
                        'Submit Activity'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
