'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { User } from '@/types';
import { createUser, getUser, updateUser } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Check if user exists in Firestore
          let userData = await getUser(firebaseUser.uid);
          
          if (!userData) {
            // Create new user if doesn't exist
            const newUser: Omit<User, 'id'> = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await createUser(newUser);
            userData = {
              id: firebaseUser.uid,
              ...newUser,
            };
          } else {
            // Update user data if Firebase user data has changed
            if (
              userData.displayName !== firebaseUser.displayName ||
              userData.photoURL !== firebaseUser.photoURL ||
              userData.email !== firebaseUser.email
            ) {
              await updateUser(firebaseUser.uid, {
                displayName: firebaseUser.displayName || userData.displayName,
                photoURL: firebaseUser.photoURL || userData.photoURL,
                email: firebaseUser.email || userData.email,
              });
              
              userData = await getUser(firebaseUser.uid);
            }
          }
          
          setUser(userData);
        } catch (error) {
          console.error('Error handling auth state:', error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
