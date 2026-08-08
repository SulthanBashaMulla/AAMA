export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  rollNumber?: string;
  department?: string;
  college?: string;
  createdAt: string;
}

export type ActivityCategory = 'technical' | 'social' | 'sports' | 'other';
export type ActivityStatus = 'pending' | 'approved' | 'rejected';

export interface Activity {
  id: string;
  studentId: string;
  studentName?: string; // Joined from users for display
  title: string;
  category: ActivityCategory;
  description: string;
  certificateUrl: string;
  geoLat: number | null;
  geoLng: number | null;
  submittedAt: string;
  status: ActivityStatus;
  points: number;
  reviewedBy?: string;
  reviewComment?: string;
  reviewedAt?: string;
}

export const CATEGORY_POINTS: Record<ActivityCategory, number> = {
  technical: 30,
  social: 20,
  sports: 20,
  other: 10,
};

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  technical: 'Technical',
  social: 'Social',
  sports: 'Sports',
  other: 'Other',
};
