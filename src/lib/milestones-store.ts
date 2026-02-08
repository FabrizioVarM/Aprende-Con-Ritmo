
"use client"

import { useState, useEffect, useCallback } from 'react';

export interface UserMilestone {
  id: string;
  studentId: string;
  milestoneTitle: string;
  achieved: boolean;
  date?: string;
}

export function useMilestonesStore() {
  const [milestones, setMilestones] = useState<UserMilestone[]>([]);

  const loadData = useCallback(() => {
    const saved = localStorage.getItem('ac_user_milestones');
    if (saved) {
      try {
        setMilestones(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading milestones", e);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('ac_sync_milestones', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('ac_sync_milestones', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [loadData]);

  const saveToStorage = useCallback((data: UserMilestone[]) => {
    localStorage.setItem('ac_user_milestones', JSON.stringify(data));
    setMilestones(data);
    window.dispatchEvent(new CustomEvent('ac_sync_milestones'));
  }, []);

  const addMilestone = useCallback((studentId: string, title: string, date?: string, achieved: boolean = false) => {
    const newMilestone: UserMilestone = {
      id: Math.random().toString(36).substring(7),
      studentId,
      milestoneTitle: title,
      achieved,
      date: date || (achieved ? new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : undefined)
    };
    saveToStorage([...milestones, newMilestone]);
  }, [milestones, saveToStorage]);

  const updateMilestone = useCallback((id: string, updates: Partial<Omit<UserMilestone, 'id' | 'studentId'>>) => {
    const updated = milestones.map(m => m.id === id ? { ...m, ...updates } : m);
    saveToStorage(updated);
  }, [milestones, saveToStorage]);

  const deleteMilestone = useCallback((id: string) => {
    const updated = milestones.filter(m => m.id !== id);
    saveToStorage(updated);
  }, [milestones, saveToStorage]);

  const toggleMilestoneAchieved = useCallback((id: string) => {
    const m = milestones.find(item => item.id === id);
    if (!m) return;
    const newAchieved = !m.achieved;
    const updates: any = { achieved: newAchieved };
    if (newAchieved && !m.date) {
      updates.date = new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    }
    const updated = milestones.map(item => item.id === id ? { ...item, ...updates } : item);
    saveToStorage(updated);
  }, [milestones, saveToStorage]);

  const getStudentMilestones = useCallback((studentId: string) => {
    return milestones.filter(m => m.studentId === studentId);
  }, [milestones]);

  const getAchievedCount = useCallback((studentId: string) => {
    return milestones.filter(m => m.studentId === studentId && m.achieved).length;
  }, [milestones]);

  return { 
    milestones, 
    addMilestone, 
    updateMilestone, 
    deleteMilestone, 
    toggleMilestoneAchieved, 
    getStudentMilestones, 
    getAchievedCount 
  };
}
