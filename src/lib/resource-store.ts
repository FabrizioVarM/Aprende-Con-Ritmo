
"use client"

import { useState, useEffect, useCallback } from 'react';
import { Resource, INITIAL_RESOURCES } from './resources';

export function useResourceStore() {
  const [resources, setResources] = useState<Resource[]>([]);

  const loadData = useCallback(() => {
    const saved = localStorage.getItem('ac_library_resources');
    if (saved) {
      try {
        setResources(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading resources", e);
        setResources(INITIAL_RESOURCES);
      }
    } else {
      setResources(INITIAL_RESOURCES);
      localStorage.setItem('ac_library_resources', JSON.stringify(INITIAL_RESOURCES));
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

  return { resources, updateResource, addResource };
}
