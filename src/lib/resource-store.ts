"use client"

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Resource, INITIAL_RESOURCES } from './resources';

const DEFAULT_DESCRIPTION = "Materiales curados para acelerar tu aprendizaje. ¡Descarga el material para tus prácticas, o interactúa directamente reproduciendo y escuchando en tiempo real! Edita la velocidad, repite indefinidamente y más. Completa el examen del material con tu profesor, y gana más puntos de progreso.";

export function useResourceStore() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [libraryDescription, setLibraryDescription] = useState<string>(DEFAULT_DESCRIPTION);
  const db = useFirestore();

  useEffect(() => {
    // Cargar recursos
    const unsubscribeRes = onSnapshot(collection(db, 'resources'), (snapshot) => {
      if (snapshot.empty) {
        // Sembrar iniciales si está vacío
        INITIAL_RESOURCES.forEach(res => {
          setDoc(doc(db, 'resources', String(res.id)), res);
        });
      } else {
        const list: Resource[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Resource));
        setResources(list);
      }
    });

    // Cargar descripción
    const unsubscribeDesc = onSnapshot(doc(db, 'settings', 'library'), (docSnap) => {
      if (docSnap.exists()) {
        setLibraryDescription(docSnap.data().description);
      } else {
        setDoc(doc(db, 'settings', 'library'), { description: DEFAULT_DESCRIPTION });
      }
    });

    return () => {
      unsubscribeRes();
      unsubscribeDesc();
    };
  }, [db]);

  const updateResource = useCallback((id: number, updatedData: Partial<Resource>) => {
    const docRef = doc(db, 'resources', String(id));
    updateDoc(docRef, updatedData);
  }, [db]);

  const addResource = useCallback((newRes: Resource) => {
    const docRef = doc(db, 'resources', String(newRes.id));
    setDoc(docRef, newRes);
  }, [db]);

  const updateLibraryDescription = useCallback((newDesc: string) => {
    const docRef = doc(db, 'settings', 'library');
    setDoc(docRef, { description: newDesc }, { merge: true });
  }, [db]);

  return { resources, libraryDescription, updateResource, addResource, updateLibraryDescription };
}
