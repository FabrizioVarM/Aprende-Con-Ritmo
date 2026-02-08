"use client"

import { useState, useEffect, useCallback } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export interface StudentSkill {
  id?: string;
  studentId: string;
  instrument: string;
  skillName: string;
  level: number;
}

export function useSkillsStore() {
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const db = useFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'skills'), (snapshot) => {
      const list: StudentSkill[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id } as StudentSkill));
      setSkills(list);
    });
    return () => unsubscribe();
  }, [db]);

  const updateSkill = useCallback((studentId: string, instrument: string, skillName: string, level: number) => {
    const id = `${studentId}_${instrument}_${skillName.replace(/\s+/g, '')}`;
    setDoc(doc(db, 'skills', id), { studentId, instrument, skillName, level }, { merge: true });
  }, [db]);

  const getSkillLevel = useCallback((studentId: string, instrument: string, skillName: string, defaultLevel: number = 0) => {
    const found = skills.find(s => s.studentId === studentId && s.instrument === instrument && s.skillName === skillName);
    return found ? found.level : defaultLevel;
  }, [skills]);

  return { skills, updateSkill, getSkillLevel };
}
