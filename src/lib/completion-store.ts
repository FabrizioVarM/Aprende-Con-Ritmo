"use client"

import { useState, useEffect, useCallback } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface ResourceCompletion {
  resourceId: number;
  studentId: string;
  isCompleted: boolean;
  validatedBy: string;
  date: string;
}

export function useCompletionStore() {
  const [completions, setCompletions] = useState<ResourceCompletion[]>([]);
  const db = useFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'completions'), (snapshot) => {
      const list: ResourceCompletion[] = [];
      snapshot.forEach(doc => list.push(doc.data() as ResourceCompletion));
      setCompletions(list);
    }, async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'completions',
        operation: 'list'
      }));
    });
    return () => unsubscribe();
  }, [db]);

  const toggleCompletion = useCallback((resourceId: number, studentId: string, teacherId: string) => {
    const id = `${studentId}_${resourceId}`;
    const existing = completions.find(c => c.resourceId === resourceId && c.studentId === studentId);
    
    const data: ResourceCompletion = {
      resourceId,
      studentId,
      isCompleted: existing ? !existing.isCompleted : true,
      validatedBy: teacherId,
      date: new Date().toISOString()
    };

    const docRef = doc(db, 'completions', id);
    setDoc(docRef, data)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      });
  }, [db, completions]);

  const getCompletionStatus = useCallback((resourceId: number, studentId: string) => {
    return completions.find(c => c.resourceId === resourceId && c.studentId === studentId)?.isCompleted || false;
  }, [completions]);

  return { completions, toggleCompletion, getCompletionStatus };
}
