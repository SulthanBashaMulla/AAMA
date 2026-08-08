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
      // 1. Upload to Cloudinary
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: 'POST', body: formData }
      );
      if (!response.ok) throw new Error('Cloudinary upload failed');
      const uploadResult: { secure_url: string } = await response.json();
      setUploadProgress(100);

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
        certificateUrl: uploadResult.secure_url,
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
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
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
            <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div><h2 className="text-lg font-bold text-slate-900">Submit Activity</h2><p className="mt-0.5 text-xs text-slate-500">Log a new co-curricular achievement.</p></div>
                <button
                  onClick={handleClose}
                  disabled={busy}
                  className="text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-30"
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
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Activity Submitted!</h3>
                  <p className="text-center text-sm text-slate-500">
                    Your activity is pending review. You'll see it in your dashboard shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                  {/* Title */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Activity title</label>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={busy}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 disabled:opacity-50"
                      placeholder="e.g. Hackathon participation — Smart India Hackathon 2025"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Category</label>
                    <div className="grid grid-cols-4 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          disabled={busy}
                          onClick={() => setCategory(cat)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            category === cat
                              ? 'border-blue-800 bg-blue-50 text-blue-800'
                              : 'border-slate-300 text-slate-500 hover:border-blue-300 hover:text-blue-800'
                          } disabled:opacity-50`}
                        >
                          {CATEGORY_LABELS[cat]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={busy}
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 disabled:opacity-50"
                      placeholder="Describe what you did, your role, and any achievements…"
                    />
                  </div>

                  {/* File upload */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Certificate <span className="font-normal normal-case text-slate-400">(PDF, JPG, PNG · max 5 MB)</span>
                    </label>
                    <div
                      onClick={() => !busy && fileInputRef.current?.click()}
                      className={`relative rounded-lg border-2 border-dashed px-4 py-5 text-center cursor-pointer transition-colors ${
                        fileError
                          ? 'border-red-300 bg-red-50'
                          : file
                          ? 'border-green-300 bg-green-50'
                          : 'border-slate-300 bg-slate-50 hover:border-blue-300'
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
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="max-w-xs truncate text-sm text-green-700">{file.name}</span>
                          <span className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <Upload className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-600">Click to upload certificate</span>
                          <span className="text-xs text-slate-400">or drag and drop</span>
                        </div>
                      )}
                    </div>
                    {fileError && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" /> {fileError}
                      </p>
                    )}
                  </div>

                  {/* Upload progress */}
                  {status === 'uploading' && (
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Uploading certificate...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full rounded-full bg-blue-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Geo note */}
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-800" />
                    <p className="text-xs text-slate-600">
                      Your browser location will be recorded with this submission (if available). Location access is optional — submission will succeed either way.
                    </p>
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                      <span className="text-sm text-red-600">{errorMsg}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleClose}
                      disabled={busy}
                      className="px-4 py-2 text-sm text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                    <button
                      type="submit"
                      disabled={busy || !!fileError}
                      className="flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
