
"use client"

import { useState, useEffect, useCallback } from 'react';

export interface ResourceCompletion {
  resourceId: number;
  studentId: string;
  isCompleted: boolean;
  validatedBy: string; // ID del profesor/admin que validó
  date: string;
}

export function useCompletionStore() {
  const [completions, setCompletions] = useState<ResourceCompletion[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ac_resource_completions');
    if (saved) {
      try {
        setCompletions(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading completions", e);
      }
    }
  }, []);

  const saveToStorage = useCallback((data: ResourceCompletion[]) => {
    localStorage.setItem('ac_resource_completions', JSON.stringify(data));
    setCompletions([...data]);
  }, []);

  const toggleCompletion = useCallback((resourceId: number, studentId: string, teacherId: string) => {
    const existingIndex = completions.findIndex(
      c => c.resourceId === resourceId && c.studentId === studentId
    );

    let updated: ResourceCompletion[];
    if (existingIndex > -1) {
      updated = [...completions];
      updated[existingIndex].isCompleted = !updated[existingIndex].isCompleted;
      updated[existingIndex].date = new Date().toISOString();
      updated[existingIndex].validatedBy = teacherId;
    } else {
      updated = [
        ...completions,
        {
          resourceId,
          studentId,
          isCompleted: true,
          validatedBy: teacherId,
          date: new Date().toISOString()
        }
      ];
    }
    saveToStorage(updated);
  }, [completions, saveToStorage]);

  const getCompletionStatus = useCallback((resourceId: number, studentId: string) => {
    return completions.find(c => c.resourceId === resourceId && c.studentId === studentId)?.isCompleted || false;
  }, [completions]);

  return { completions, toggleCompletion, getCompletionStatus };
}
