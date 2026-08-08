import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestore';
import type { UserProfile } from '../types';

interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileRequestId = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const requestId = ++profileRequestId.current;
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await getUserProfile(user.uid);
          if (requestId === profileRequestId.current && auth.currentUser?.uid === user.uid) {
            setUserProfile(profile);
          }
        } catch {
          if (requestId === profileRequestId.current) setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setUserProfile(null);
      return null;
    }

    const requestId = ++profileRequestId.current;
    const profile = await getUserProfile(user.uid);
    if (requestId === profileRequestId.current && auth.currentUser?.uid === user.uid) {
      setCurrentUser(user);
      setUserProfile(profile);
    }
    return profile;
  }, []);

  const signOut = useCallback(async () => {
    profileRequestId.current += 1;
    setCurrentUser(null);
    setUserProfile(null);
    await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, refreshUserProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
