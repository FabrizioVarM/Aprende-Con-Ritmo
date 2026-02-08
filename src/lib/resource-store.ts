"use client"

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Resource, INITIAL_RESOURCES } from './resources';

const DEFAULT_DESCRIPTION = "Materiales curados para acelerar tu aprendizaje. ¡Descarga el material para tus prácticas, o interactúa directamente reproduciendo y escuchando en tiempo real! Edita la velocidad, repite indefinidamente y más. Completa el examen del material con tu profesor, y gana más puntos de progreso.";

export function useResourceStore() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [libraryDescription, setLibraryDescription] = useState<string>(DEFAULT_DESCRIPTION);
  const db = useFirestore();

  useEffect(() => {
    // Cargar recursos
    const unsubscribeRes = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const list: Resource[] = [];
      snapshot.forEach(doc => list.push(doc.data() as Resource));
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
      // Ignorar errores de lectura en settings para alumnos no autenticados o similares
    });

    return () => {
      unsubscribeRes();
      unsubscribeDesc();
    };
  }, [db]);

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
    const docRef = doc(db, 'resources', String(newRes.id));
    setDoc(docRef, newRes).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: newRes
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

  return { resources, libraryDescription, updateResource, addResource, updateLibraryDescription };
}