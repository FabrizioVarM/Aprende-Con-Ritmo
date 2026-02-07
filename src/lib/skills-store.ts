"use client"

import { useState, useEffect, useCallback } from 'react';

export interface StudentSkill {
  studentId: string;
  instrument: string;
  skillName: string;
  level: number; // 0-100
}

export function useSkillsStore() {
  const [skills, setSkills] = useState<StudentSkill[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ac_student_skills');
    if (saved) {
      try {
        setSkills(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading skills", e);
      }
    }
  }, []);

  const saveToStorage = useCallback((data: StudentSkill[]) => {
    localStorage.setItem('ac_student_skills', JSON.stringify(data));
    setSkills([...data]);
  }, []);

  const updateSkill = useCallback((studentId: string, instrument: string, skillName: string, level: number) => {
    const existingIndex = skills.findIndex(
      s => s.studentId === studentId && s.instrument === instrument && s.skillName === skillName
    );

    let updated: StudentSkill[];
    if (existingIndex > -1) {
      updated = [...skills];
      updated[existingIndex].level = level;
    } else {
      updated = [...skills, { studentId, instrument, skillName, level }];
    }
    saveToStorage(updated);
  }, [skills, saveToStorage]);

  const getSkillLevel = useCallback((studentId: string, instrument: string, skillName: string, defaultLevel: number = 0) => {
    const found = skills.find(s => s.studentId === studentId && s.instrument === instrument && s.skillName === skillName);
    return found ? found.level : defaultLevel;
  }, [skills]);

  return { skills, updateSkill, getSkillLevel };
}
