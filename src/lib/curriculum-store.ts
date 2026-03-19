
"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from './auth-store';

export interface CurriculumStep {
  title: string;
  objective: string;
  concepts: string;
  activities: string;
  interactiveMaterial?: string;
  criteria: string;
  durationClasses: number;
  resourceId?: number;
}

export interface CurriculumPlan {
  id: string;
  instrument: string;
  description: string;
  steps: CurriculumStep[];
}

export function useCurriculumStore() {
  const [curriculums, setCurriculums] = useState<CurriculumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();
  const { user } = useAuth();

  useEffect(() => {
    if (!db || !user) return;

    // Solo profesores y admins acceden a estos datos
    if (user.role === 'student') {
      setCurriculums([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'curriculums'), (snapshot) => {
      const list: CurriculumPlan[] = [];
      snapshot.forEach(doc => {
        list.push({ ...doc.data() as CurriculumPlan, id: doc.id });
      });
      setCurriculums(list);
      setLoading(false);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'curriculums',
        operation: 'list'
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, user]);

  const saveCurriculum = useCallback(async (plan: Omit<CurriculumPlan, 'id'>, id?: string) => {
    const finalId = id || plan.instrument.toLowerCase();
    const docRef = doc(db, 'curriculums', finalId);
    const data = { ...plan, id: finalId };

    return setDoc(docRef, data, { merge: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data
      }));
    });
  }, [db]);

  const deleteCurriculum = useCallback(async (id: string) => {
    const docRef = doc(db, 'curriculums', id);
    return deleteDoc(docRef).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
  }, [db]);

  return { curriculums, loading, saveCurriculum, deleteCurriculum };
}
