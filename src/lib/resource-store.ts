
"use client"

import { useState, useEffect, useCallback } from 'react';
import { Resource, INITIAL_RESOURCES } from './resources';

const DEFAULT_DESCRIPTION = "Materiales curados para acelerar tu aprendizaje. ¡Descarga el material para tus prácticas, o interactúa directamente reproduciendo y escuchando en tiempo real! Edita la velocidad, repite indefinidamente y más. Completa el examen del material con tu profesor, y gana más puntos de progreso.";

export function useResourceStore() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [libraryDescription, setLibraryDescription] = useState<string>(DEFAULT_DESCRIPTION);

  const loadData = useCallback(() => {
    // Load resources
    const savedResources = localStorage.getItem('ac_library_resources');
    if (savedResources) {
      try {
        setResources(JSON.parse(savedResources));
      } catch (e) {
        console.error("Error loading resources", e);
        setResources(INITIAL_RESOURCES);
      }
    } else {
      setResources(INITIAL_RESOURCES);
      localStorage.setItem('ac_library_resources', JSON.stringify(INITIAL_RESOURCES));
    }

    // Load description
    const savedDesc = localStorage.getItem('ac_library_description');
    if (savedDesc) {
      setLibraryDescription(savedDesc);
    } else {
      setLibraryDescription(DEFAULT_DESCRIPTION);
      localStorage.setItem('ac_library_description', DEFAULT_DESCRIPTION);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('ac_sync_resources', handleSync);
    return () => window.removeEventListener('ac_sync_resources', handleSync);
  }, [loadData]);

  const updateResource = useCallback((id: number, updatedData: Partial<Resource>) => {
    const updated = resources.map(res => res.id === id ? { ...res, ...updatedData } : res);
    localStorage.setItem('ac_library_resources', JSON.stringify(updated));
    setResources(updated);
    window.dispatchEvent(new CustomEvent('ac_sync_resources'));
  }, [resources]);

  const addResource = useCallback((newRes: Resource) => {
    const updated = [...resources, newRes];
    localStorage.setItem('ac_library_resources', JSON.stringify(updated));
    setResources(updated);
    window.dispatchEvent(new CustomEvent('ac_sync_resources'));
  }, [resources]);

  const updateLibraryDescription = useCallback((newDesc: string) => {
    localStorage.setItem('ac_library_description', newDesc);
    setLibraryDescription(newDesc);
    window.dispatchEvent(new CustomEvent('ac_sync_resources'));
  }, []);

  return { resources, libraryDescription, updateResource, addResource, updateLibraryDescription };
}
