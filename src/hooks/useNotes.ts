'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useFirebase } from '@/contexts/FirebaseClientProvider';
import { Note } from '@/types';
import { toast } from 'sonner';

export const useNotes = (filters?: {
  authorId?: string;
  isPublic?: boolean;
  tags?: string[];
  subject?: string;
  limit?: number;
  orderBy?: 'recent' | 'popular';
}) => {
  const { db, storage } = useFirebase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;

    let q = query(collection(db, 'notes'));
    
    // Apply filters
    if (filters?.authorId) {
      q = query(q, where('authorId', '==', filters.authorId));
    }
    
    if (filters?.isPublic !== undefined) {
      q = query(q, where('isPublic', '==', filters.isPublic));
    }
    
    if (filters?.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filters.tags));
    }
    
    // Apply ordering
    if (filters?.orderBy === 'popular') {
      q = query(q, orderBy('likeCount', 'desc'), orderBy('viewCount', 'desc'));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Note;
        });
        setNotes(notesData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching notes:', error);
        setError('Failed to fetch notes');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [db, filters]);

  const createNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'>) => {
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        ...noteData,
        viewCount: 0,
        likeCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast.success('Note created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      throw error;
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      toast.success('Note updated successfully!');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await deleteDoc(noteRef);
      
      toast.success('Note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      throw error;
    }
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  };

  const deleteFile = async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
      throw error;
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    uploadFile,
    deleteFile,
  };
};

export const useNote = (noteId: string) => {
  const { db } = useFirebase();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !noteId) return;

    const noteRef = doc(db, 'notes', noteId);
    
    const unsubscribe = onSnapshot(
      noteRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setNote({
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Note);
        } else {
          setNote(null);
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching note:', error);
        setError('Failed to fetch note');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [db, noteId]);

  return { note, loading, error };
};
