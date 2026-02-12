
"use client"

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Resource, INITIAL_RESOURCES } from './resources';
import { useAuth } from './auth-store';

const DEFAULT_DESCRIPTION = "Materiales curados para acelerar tu aprendizaje. ¡Descarga el material para tus prácticas, o interactúa directamente reproduciendo y escuchando en tiempo real! Edita la velocidad, repite indefinidamente y más. Completa el examen del material con tu profesor, y gana más puntos de progreso.";

export function useResourceStore() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [libraryDescription, setLibraryDescription] = useState<string>(DEFAULT_DESCRIPTION);
  const db = useFirestore();
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (!firebaseUser) {
      setResources([]);
      return;
    }

    // Cargar recursos
    const unsubscribeRes = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const list: Resource[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: Number(doc.id) } as Resource));
      setResources(list);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'resources',
        operation: 'list'
      }));
    });

    // Cargar descripción
    const unsubscribeDesc = onSnapshot(doc(db, 'settings', 'library'), (docSnap) => {
      if (docSnap.exists()) {
        setLibraryDescription(docSnap.data().description);
      }
    }, (error) => {
      // Ignorar errores de lectura en settings
    });

    return () => {
      unsubscribeRes();
      unsubscribeDesc();
    };
  }, [db, firebaseUser]);

  const updateResource = useCallback((id: number, updatedData: Partial<Resource>) => {
    const docRef = doc(db, 'resources', String(id));
    updateDoc(docRef, updatedData).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updatedData
      }));
    });
  }, [db]);

  const addResource = useCallback((newRes: Resource) => {
    // Asegurar que por defecto sean ocultos si no viene el campo
    const finalRes = {
      ...newRes,
      isVisibleGlobally: newRes.isVisibleGlobally ?? false,
      assignedStudentIds: newRes.assignedStudentIds ?? []
    };
    
    const docRef = doc(db, 'resources', String(finalRes.id));
    setDoc(docRef, finalRes).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: finalRes
      }));
    });
  }, [db]);

  const updateLibraryDescription = useCallback((newDesc: string) => {
    const docRef = doc(db, 'settings', 'library');
    setDoc(docRef, { description: newDesc }, { merge: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { description: newDesc }
      }));
    });
  }, [db]);

  const toggleStudentVisibility = useCallback((resourceId: number, studentId: string) => {
    const res = resources.find(r => r.id === resourceId);
    if (!res) return;

    const currentAssigned = res.assignedStudentIds || [];
    const isAssigned = currentAssigned.includes(studentId);
    const newAssigned = isAssigned 
      ? currentAssigned.filter(id => id !== studentId)
      : [...currentAssigned, studentId];

    updateResource(resourceId, { assignedStudentIds: newAssigned });
  }, [resources, updateResource]);

  const toggleGlobalVisibility = useCallback((resourceId: number) => {
    const res = resources.find(r => r.id === resourceId);
    if (!res) return;

    updateResource(resourceId, { isVisibleGlobally: !res.isVisibleGlobally });
  }, [resources, updateResource]);

  return { 
    resources, 
    libraryDescription, 
    updateResource, 
    addResource, 
    updateLibraryDescription,
    toggleStudentVisibility,
    toggleGlobalVisibility
  };
}
