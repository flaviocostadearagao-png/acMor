'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isOffline: boolean;
  toggleOffline: () => void;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  isOffline: false,
  toggleOffline: () => {},
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [manualOffline, setManualOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      if (!manualOffline) setIsOffline(false);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOffline(manualOffline || !window.navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [manualOffline]);

  const toggleOffline = () => {
    setManualOffline(prev => {
      const newValue = !prev;
      setIsOffline(newValue || !window.navigator.onLine);
      return newValue;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser && !isOffline) {
        const userRef = doc(db, 'users', authUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: authUser.displayName || 'Ciclista',
              email: authUser.email,
              photoURL: authUser.photoURL,
              stats: { totalDistance: 0, totalRides: 0, points: 0 },
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Error creating/getting user doc:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOffline]);

  return (
    <FirebaseContext.Provider value={{ user, loading, isOffline, toggleOffline }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
