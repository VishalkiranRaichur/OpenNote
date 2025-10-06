'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseContextType {
  app: FirebaseApp;
  auth: ReturnType<typeof getAuth>;
  db: ReturnType<typeof getFirestore>;
  storage: ReturnType<typeof getStorage>;
  isInitialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseClientProvider');
  }
  return context;
};

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<ReturnType<typeof getAuth> | null>(null);
  const [db, setDb] = useState<ReturnType<typeof getFirestore> | null>(null);
  const [storage, setStorage] = useState<ReturnType<typeof getStorage> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeFirebase = () => {
      try {
        // Initialize Firebase app
        let firebaseApp: FirebaseApp;
        if (getApps().length === 0) {
          firebaseApp = initializeApp(firebaseConfig);
        } else {
          firebaseApp = getApps()[0];
        }

        // Initialize services
        const authInstance = getAuth(firebaseApp);
        const dbInstance = getFirestore(firebaseApp);
        const storageInstance = getStorage(firebaseApp);

        // Connect to emulators in development
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
          try {
            if (!authInstance.app.options.authDomain?.includes('localhost')) {
              connectAuthEmulator(authInstance, 'http://localhost:9099');
            }
            if (!dbInstance.app.options.projectId?.includes('demo-')) {
              connectFirestoreEmulator(dbInstance, 'localhost', 8080);
            }
            if (!storageInstance.app.options.storageBucket?.includes('localhost')) {
              connectStorageEmulator(storageInstance, 'localhost', 9199);
            }
          } catch (error) {
            // Emulators already connected or not available
            console.log('Firebase emulators not available or already connected');
          }
        }

        setApp(firebaseApp);
        setAuth(authInstance);
        setDb(dbInstance);
        setStorage(storageInstance);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        setIsInitialized(false);
      }
    };

    initializeFirebase();
  }, []);

  if (!isInitialized || !app || !auth || !db || !storage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const value: FirebaseContextType = {
    app,
    auth,
    db,
    storage,
    isInitialized,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
