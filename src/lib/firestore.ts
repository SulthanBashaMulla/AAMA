import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Activity, ActivityCategory, ActivityStatus } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toISOString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function mapActivity(id: string, data: DocumentData): Activity {
  return {
    id,
    studentId: data.studentId ?? '',
    studentName: data.studentName ?? '',
    title: data.title ?? '',
    category: (data.category ?? 'other') as ActivityCategory,
    description: data.description ?? '',
    certificateUrl: data.certificateUrl ?? '',
    geoLat: data.geoLat ?? null,
    geoLng: data.geoLng ?? null,
    submittedAt: toISOString(data.submittedAt),
    status: (data.status ?? 'pending') as ActivityStatus,
    points: data.points ?? 0,
    reviewedBy: data.reviewedBy,
    reviewComment: data.reviewComment,
    reviewedAt: data.reviewedAt ? toISOString(data.reviewedAt) : undefined,
  };
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: snap.id,
    name: d.name ?? '',
    email: d.email ?? '',
    role: d.role ?? 'student',
    rollNumber: d.rollNumber,
    department: d.department,
    createdAt: toISOString(d.createdAt),
  };
}

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });
}

export async function getAllStudents(): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name ?? '',
      email: data.email ?? '',
      role: 'student',
      rollNumber: data.rollNumber,
      department: data.department,
      createdAt: toISOString(data.createdAt),
    };
  });
}

// ── Activities ───────────────────────────────────────────────────────────────

export async function submitActivity(
  activity: Omit<Activity, 'id' | 'status' | 'points' | 'reviewedBy' | 'reviewComment' | 'reviewedAt' | 'submittedAt'>
): Promise<void> {
  const ref = doc(collection(db, 'activities'));
  await setDoc(ref, {
    ...activity,
    status: 'pending',
    points: 0,
    submittedAt: serverTimestamp(),
  });
}

export function subscribeToStudentActivities(
  studentId: string,
  callback: (activities: Activity[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, 'activities'),
    where('studentId', '==', studentId),
    orderBy('submittedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapActivity(d.id, d.data())));
  }, (error) => {
    console.error('Failed to subscribe to student activities:', error);
    onError?.(error);
  });
}

export function subscribeToPendingActivities(
  callback: (activities: Activity[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, 'activities'),
    where('status', '==', 'pending'),
    orderBy('submittedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapActivity(d.id, d.data())));
  }, (error) => {
    console.error('Failed to subscribe to pending activities:', error);
    onError?.(error);
  });
}

export function subscribeToAllActivities(
  callback: (activities: Activity[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'activities'), orderBy('submittedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapActivity(d.id, d.data())));
  }, (error) => {
    console.error('Failed to subscribe to all activities:', error);
    onError?.(error);
  });
}

export async function reviewActivity(
  activityId: string,
  status: ActivityStatus,
  reviewedBy: string,
  reviewComment: string,
  points: number
): Promise<void> {
  await updateDoc(doc(db, 'activities', activityId), {
    status,
    reviewedBy,
    reviewComment,
    points: status === 'approved' ? points : 0,
    reviewedAt: serverTimestamp(),
  });
}
