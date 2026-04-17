'use client';
// CrowdFlow — Firebase Auth State Hook
// Subscribes to auth and enriches with Firestore profile in one listener

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, app } from '@/lib/firebase';
import type { UserProfile } from '@/lib/firestore';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigMissing: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigMissing = !app || !auth || !db;

  useEffect(() => {
    // If Firebase didn't initialize, stop here and show loading as finished
    if (isConfigMissing) {
      setLoading(false);
      return;
    }

    let profileUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      // Clean up previous profile listener
      if (profileUnsub) { profileUnsub(); profileUnsub = null; }

      if (firebaseUser) {
        // Real-time profile subscription
        profileUnsub = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            setProfile({ uid: firebaseUser.uid, ...snap.data() } as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, [isConfigMissing]);

  return {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isConfigMissing,
  };
}
