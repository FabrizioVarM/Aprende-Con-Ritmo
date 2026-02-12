
"use client"

import { useState, useEffect, useCallback } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from './auth-store';

export interface UserMilestone {
  id: string;
  studentId: string;
  milestoneTitle: string;
  achieved: boolean;
  date?: string;
}

export function useMilestonesStore() {
  const [milestones, setMilestones] = useState<UserMilestone[]>([]);
  const db = useFirestore();
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (!firebaseUser) {
      setMilestones([]);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'milestones'), (snapshot) => {
      const list: UserMilestone[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id } as UserMilestone));
      setMilestones(list);
    }, async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'milestones',
        operation: 'list'
      }));
    });
    return () => unsubscribe();
  }, [db, firebaseUser]);

  const addMilestone = useCallback((studentId: string, title: string, date?: string, achieved: boolean = false) => {
    const id = Math.random().toString(36).substring(7);
    const data: UserMilestone = {
      id, studentId, milestoneTitle: title, achieved,
      date: date || (achieved ? new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : undefined)
    };
    const docRef = doc(db, 'milestones', id);
    setDoc(docRef, data)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: data
        }));
      });
  }, [db]);

  const updateMilestone = useCallback((id: string, updates: Partial<Omit<UserMilestone, 'id' | 'studentId'>>) => {
    const docRef = doc(db, 'milestones', id);
    updateDoc(docRef, updates)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
  }, [db]);

  const deleteMilestone = useCallback((id: string) => {
    const docRef = doc(db, 'milestones', id);
    deleteDoc(docRef)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        })).emit('permission-error', error);
      });
  }, [db]);

  const toggleMilestoneAchieved = useCallback((id: string) => {
    const m = milestones.find(item => item.id === id);
    if (!m) return;
    const newAchieved = !m.achieved;
    const updates: any = { achieved: newAchieved };
    if (newAchieved && !m.date) {
      updates.date = new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    }
    const docRef = doc(db, 'milestones', id);
    updateDoc(docRef, updates)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
  }, [db, milestones]);

  const getStudentMilestones = useCallback((studentId: string) => {
    return milestones.filter(m => m.studentId === studentId);
  }, [milestones]);

  const getAchievedCount = useCallback((studentId: string) => {
    return milestones.filter(m => m.studentId === studentId && m.achieved).length;
  }, [milestones]);

  return { milestones, addMilestone, updateMilestone, deleteMilestone, toggleMilestoneAchieved, getStudentMilestones, getAchievedCount };
}
