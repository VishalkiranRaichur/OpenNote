'use client';

import { useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseClientProvider';
import { User } from '@/types';
import { toast } from 'sonner';

export const useUser = () => {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Check if user exists in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          let userData: User;
          
          if (userSnap.exists()) {
            // Update existing user data
            const data = userSnap.data();
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || data.email || '',
              displayName: firebaseUser.displayName || data.displayName || '',
              photoURL: firebaseUser.photoURL || data.photoURL || undefined,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: new Date(),
            };
            
            // Update user data if Firebase user data has changed
            if (
              userData.displayName !== firebaseUser.displayName ||
              userData.photoURL !== firebaseUser.photoURL ||
              userData.email !== firebaseUser.email
            ) {
              await setDoc(userRef, {
                displayName: firebaseUser.displayName || userData.displayName,
                photoURL: firebaseUser.photoURL || userData.photoURL,
                email: firebaseUser.email || userData.email,
                updatedAt: serverTimestamp(),
              }, { merge: true });
              
              userData = {
                ...userData,
                displayName: firebaseUser.displayName || userData.displayName,
                photoURL: firebaseUser.photoURL || userData.photoURL,
                email: firebaseUser.email || userData.email,
                updatedAt: new Date(),
              };
            }
          } else {
            // Create new user
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await setDoc(userRef, {
              ...userData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          
          setUser(userData);
        } catch (error) {
          console.error('Error handling auth state:', error);
          toast.error('Failed to load user data');
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, db]);

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup - this is normal behavior, don't show as error
        console.log('User cancelled Google sign-in');
        toast.info('Sign-in cancelled');
        return; // Don't throw error for user cancellation
      } else {
        console.error('Error signing in with Google:', error);
        toast.error('Failed to sign in. Please try again.');
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    logout,
  };
};
