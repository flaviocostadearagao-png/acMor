'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
    
    // Initial sync
    setIsOffline(manualOffline || !window.navigator.onLine);

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      const realTimeOffline = typeof window !== 'undefined' ? (manualOffline || !window.navigator.onLine) : false;
      
      if (currentUser && !realTimeOffline) {
        // Ensure user record exists in Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              displayName: currentUser.displayName || 'Ciclista',
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              bio: 'Adoro pedalar!',
              stats: {
                totalDistance: 0,
                totalRides: 0,
                points: 0,
                monthlyDistance: 0,
                lastMonthUpdated: ''
              },
              records: {
                longestRide: 0
              },
              createdAt: serverTimestamp()
            });
          }
        } catch (error: any) {
          if (error?.message?.includes('offline')) {
            console.warn("Skipping user record initialization: client is offline.");
          } else {
            handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
          }
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [manualOffline]);

  return (
    <FirebaseContext.Provider value={{ user, loading, isOffline, toggleOffline }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
