
"use client"

import { useState, useEffect, useCallback } from 'react';

export interface UserMilestone {
  studentId: string;
  milestoneTitle: string;
  achieved: boolean;
  date?: string;
}

export function useMilestonesStore() {
  const [milestones, setMilestones] = useState<UserMilestone[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ac_user_milestones');
    if (saved) {
      try {
        setMilestones(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading milestones", e);
      }
    }
  }, []);

  const saveToStorage = useCallback((data: UserMilestone[]) => {
    localStorage.setItem('ac_user_milestones', JSON.stringify(data));
    setMilestones([...data]);
  }, []);

  const toggleMilestone = useCallback((studentId: string, milestoneTitle: string) => {
    const existingIndex = milestones.findIndex(
      m => m.studentId === studentId && m.milestoneTitle === milestoneTitle
    );

    let updated: UserMilestone[];
    if (existingIndex > -1) {
      updated = [...milestones];
      updated[existingIndex].achieved = !updated[existingIndex].achieved;
      if (updated[existingIndex].achieved) {
        updated[existingIndex].date = new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }
    } else {
      updated = [...milestones, { 
        studentId, 
        milestoneTitle, 
        achieved: true, 
        date: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) 
      }];
    }
    saveToStorage(updated);
  }, [milestones, saveToStorage]);

  const isMilestoneAchieved = useCallback((studentId: string, milestoneTitle: string) => {
    const found = milestones.find(m => m.studentId === studentId && m.milestoneTitle === milestoneTitle);
    return found ? found.achieved : false;
  }, [milestones]);

  const getMilestoneDate = useCallback((studentId: string, milestoneTitle: string) => {
    return milestones.find(m => m.studentId === studentId && m.milestoneTitle === milestoneTitle)?.date;
  }, [milestones]);

  const getAchievedCount = useCallback((studentId: string) => {
    return milestones.filter(m => m.studentId === studentId && m.achieved).length;
  }, [milestones]);

  return { milestones, toggleMilestone, isMilestoneAchieved, getMilestoneDate, getAchievedCount };
}
