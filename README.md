# AICTE Activity Management System (AAMS)

A production-grade SaaS web application for engineering/degree students to submit proof of extracurricular activities toward their mandatory **AICTE Activity Points** requirement (100 points total), with faculty review and admin oversight.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion + anime.js |
| Backend | Firebase v9 (Auth, Firestore, Storage) |
| Routing | React Router v6 |
| Icons | Lucide React |
| PDF | jsPDF + html2canvas |
| Deployment | Vercel |

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd AAMS
npm install
```

### 2. Configure Firebase

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> .env.local is gitignored and must never be committed. The app will throw a clear error at startup if any variable is missing.

### 3. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project
3. Enable **Authentication** > Email/Password
4. Create a **Firestore** database (start in production mode)
5. Enable **Storage**
6. Copy credentials from Project Settings > Your apps > Web

### 4. Deploy Firestore Security Rules

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use <your-project-id>
npx -y firebase-tools@latest deploy --only firestore:rules
```

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:5173

---

## User Roles

| Role | Access | How to create |
|------|--------|---------------|
| student | Submit activities, view own progress | Public signup at /signup |
| faculty | Review and approve/reject all pending activities | See below |
| admin | View institution-wide aggregated data | See below |

### Creating Faculty / Admin accounts

There is no public signup for faculty or admin. This is by design.

**Step-by-step:**
1. Go to /signup and create an account with the faculty/admin email
2. Open Firebase Console > Firestore > users collection
3. Find the document with that user's UID
4. Click the role field, change value from student to faculty or admin
5. Save — the user will be redirected to the correct dashboard on next login

---

## Firestore Schema

### users/{uid}
- uid: string
- name: string
- email: string
- role: student | faculty | admin
- rollNumber: string (optional)
- department: string (optional)
- createdAt: timestamp

### activities/{activityId}
- studentId: string (UID of submitting student)
- studentName: string
- title: string
- category: technical | social | sports | other
- description: string
- certificateUrl: string (Firebase Storage URL)
- geoLat: number | null
- geoLng: number | null
- submittedAt: timestamp
- status: pending | approved | rejected
- points: number (0 until approved)
- reviewedBy: string (optional)
- reviewComment: string (optional)
- reviewedAt: timestamp (optional)

---

## Security Notes

- Privilege escalation prevention: Firestore rules enforce that students can only create activities with status=pending and points=0.
- Student isolation: Students can only read their own activity documents.
- Review writes: Only faculty and admin can update status, points, reviewedBy, reviewComment, reviewedAt.
- File uploads: Client-side validation enforces PDF/JPG/PNG only and 5 MB max.
- Geolocation: Non-blocking — submission always succeeds if location is denied or unavailable.

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo at vercel.com/new
3. Add all VITE_FIREBASE_* environment variables in Vercel project settings
4. Deploy — vercel.json handles SPA routing

---

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx
├── components/
│   ├── layout/AppShell.tsx
│   ├── ProtectedRoute.tsx
│   └── ReviewDialog.tsx
├── lib/
│   ├── firebase.ts
│   └── firestore.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── student/StudentDashboard.tsx
│   ├── student/SubmitActivityModal.tsx
│   ├── faculty/FacultyDashboard.tsx
│   └── admin/AdminDashboard.tsx
├── router/index.tsx
└── types/index.ts
```
