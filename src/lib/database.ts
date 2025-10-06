import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { User, Note, Tag, Subject } from '@/types';

// Users Collection
export const usersCollection = collection(db, 'users');

export const createUser = async (userData: Omit<User, 'id'>): Promise<string> => {
  const docRef = await addDoc(usersCollection, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: userSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
  }
  return null;
};

// Notes Collection
export const notesCollection = collection(db, 'notes');

export const createNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'>): Promise<string> => {
  const docRef = await addDoc(notesCollection, {
    ...noteData,
    viewCount: 0,
    likeCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateNote = async (noteId: string, noteData: Partial<Note>): Promise<void> => {
  const noteRef = doc(db, 'notes', noteId);
  await updateDoc(noteRef, {
    ...noteData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteNote = async (noteId: string): Promise<void> => {
  const noteRef = doc(db, 'notes', noteId);
  await deleteDoc(noteRef);
};

export const getNote = async (noteId: string): Promise<Note | null> => {
  const noteRef = doc(db, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);
  
  if (noteSnap.exists()) {
    const data = noteSnap.data();
    return {
      id: noteSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Note;
  }
  return null;
};

export const getNotes = async (filters?: {
  authorId?: string;
  isPublic?: boolean;
  tags?: string[];
  subject?: string;
  limit?: number;
  orderBy?: 'recent' | 'popular';
}): Promise<Note[]> => {
  let q = query(notesCollection);
  
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
  
  if (filters?.orderBy === 'popular') {
    q = query(q, orderBy('likeCount', 'desc'), orderBy('viewCount', 'desc'));
  } else {
    q = query(q, orderBy('createdAt', 'desc'));
  }
  
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Note;
  });
};

export const searchNotes = async (searchQuery: string, filters?: {
  authorId?: string;
  isPublic?: boolean;
  tags?: string[];
  subject?: string;
}): Promise<Note[]> => {
  // Note: Firestore doesn't support full-text search natively
  // This is a basic implementation - for production, consider Algolia or similar
  const allNotes = await getNotes({ ...filters, limit: 1000 });
  
  const query = searchQuery.toLowerCase();
  return allNotes.filter(note => 
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query) ||
    note.authorName.toLowerCase().includes(query) ||
    note.tags.some(tag => tag.toLowerCase().includes(query))
  );
};

// File Upload
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// Tags Collection
export const tagsCollection = collection(db, 'tags');

export const getTags = async (): Promise<Tag[]> => {
  const querySnapshot = await getDocs(tagsCollection);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Tag[];
};

export const updateTagCount = async (tagName: string, increment: number): Promise<void> => {
  const tagRef = doc(db, 'tags', tagName);
  const tagSnap = await getDoc(tagRef);
  
  if (tagSnap.exists()) {
    const currentCount = tagSnap.data().count || 0;
    await updateDoc(tagRef, { count: currentCount + increment });
  } else {
    await addDoc(tagsCollection, {
      name: tagName,
      color: getTagColor(tagName),
      count: increment
    });
  }
};

// Subjects Collection
export const subjectsCollection = collection(db, 'subjects');

export const getSubjects = async (): Promise<Subject[]> => {
  const querySnapshot = await getDocs(subjectsCollection);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Subject[];
};

export const updateSubjectCount = async (subjectName: string, increment: number): Promise<void> => {
  const subjectRef = doc(db, 'subjects', subjectName);
  const subjectSnap = await getDoc(subjectRef);
  
  if (subjectSnap.exists()) {
    const currentCount = subjectSnap.data().count || 0;
    await updateDoc(subjectRef, { count: currentCount + increment });
  } else {
    await addDoc(subjectsCollection, {
      name: subjectName,
      color: getSubjectColor(subjectName),
      count: increment
    });
  }
};

// Helper functions for colors
const getTagColor = (tagName: string): string => {
  const colors = ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'indigo', 'yellow'];
  const hash = tagName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getSubjectColor = (subjectName: string): string => {
  const colors = ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'indigo', 'yellow'];
  const hash = subjectName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
