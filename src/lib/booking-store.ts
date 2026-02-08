"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: string;
  studentId?: string;
  teacherName?: string;
  instrument?: string;
  type: 'virtual' | 'presencial';
  status?: 'pending' | 'completed';
  isGroup?: boolean;
  students?: { id: string, name: string }[];
  teachers?: { id: string, name: string }[];
}

export interface DayAvailability {
  id?: string;
  date: string;
  teacherId: string;
  slots: TimeSlot[];
}

export const INITIAL_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"
];

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useBookingStore() {
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);
  const db = useFirestore();

  useEffect(() => {
    // Escuchar todas las disponibilidades en tiempo real (limitado para prototipo)
    const q = collection(db, 'availabilities');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: DayAvailability[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id } as DayAvailability));
      setAvailabilities(list);
    });
    return () => unsubscribe();
  }, [db]);

  const getDayAvailability = useCallback((teacherId: string, date: Date): DayAvailability => {
    const dateStr = toLocalDateString(date);
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    if (existing) return existing;

    return {
      date: dateStr,
      teacherId,
      slots: INITIAL_SLOTS.map(s => ({ 
        id: Math.random().toString(36).substring(2, 9), 
        time: s, 
        isAvailable: false, 
        isBooked: false,
        type: 'presencial',
        status: 'pending'
      }))
    };
  }, [availabilities]);

  const updateAvailability = useCallback((teacherId: string, date: Date, slots: TimeSlot[]) => {
    const dateStr = toLocalDateString(date);
    const id = `${teacherId}_${dateStr}`;
    setDoc(doc(db, 'availabilities', id), { teacherId, date: dateStr, slots }, { merge: true });
  }, [db]);

  const bookSlot = useCallback((teacherId: string, date: Date, slotId: string, studentName: string, studentId: string, instrument: string, teacherName?: string) => {
    const dateStr = toLocalDateString(date);
    const id = `${teacherId}_${dateStr}`;
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    
    let updatedSlots: TimeSlot[] = [];
    if (existing) {
      updatedSlots = existing.slots.map(s => s.id === slotId ? { 
        ...s, isBooked: true, bookedBy: studentName, studentId, isAvailable: false, instrument, status: 'pending', teacherName 
      } : s);
    } else {
      updatedSlots = INITIAL_SLOTS.map(s => {
        const sid = Math.random().toString(36).substring(2, 9);
        const match = sid === slotId || s.startsWith(slotId); // Fallback logic
        return {
          id: sid, time: s, isAvailable: false,
          isBooked: sid === slotId,
          bookedBy: sid === slotId ? studentName : undefined,
          studentId: sid === slotId ? studentId : undefined,
          instrument: sid === slotId ? instrument : undefined,
          teacherName: sid === slotId ? teacherName : undefined,
          type: 'presencial', status: 'pending'
        };
      });
    }
    setDoc(doc(db, 'availabilities', id), { teacherId, date: dateStr, slots: updatedSlots }, { merge: true });
  }, [db, availabilities]);

  const createGroupClass = useCallback((teacherId: string, date: Date, time: string, studentList: {id: string, name: string}[], instrument: string, type: 'virtual' | 'presencial', teacherList: {id: string, name: string}[]) => {
    const dateStr = toLocalDateString(date);
    const id = `${teacherId}_${dateStr}`;
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    
    const newSlot: TimeSlot = {
      id: 'group-' + Math.random().toString(36).substring(2, 9),
      time, isAvailable: false, isBooked: true, isGroup: true,
      students: studentList, teachers: teacherList, instrument, type, status: 'pending'
    };

    const slots = existing ? [...existing.slots, newSlot] : [newSlot];
    setDoc(doc(db, 'availabilities', id), { teacherId, date: dateStr, slots }, { merge: true });
  }, [db, availabilities]);

  const cancelBooking = useCallback((teacherId: string, date: Date, slotId: string) => {
    const dateStr = toLocalDateString(date);
    const id = `${teacherId}_${dateStr}`;
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    if (!existing) return;

    const updatedSlots = existing.slots.map(s => 
      s.id === slotId ? { ...s, isBooked: false, bookedBy: undefined, studentId: undefined, isAvailable: true, instrument: undefined, status: 'pending', students: undefined, isGroup: false, teachers: undefined } : s
    ).filter(s => !s.id.startsWith('group-') || s.isBooked);

    setDoc(doc(db, 'availabilities', id), { slots: updatedSlots }, { merge: true });
  }, [db, availabilities]);

  const setSlotStatus = useCallback((teacherId: string, dateStr: string, slotId: string, status: 'pending' | 'completed') => {
    const id = `${teacherId}_${dateStr}`;
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    if (!existing) return;

    const updatedSlots = existing.slots.map(s => s.id === slotId ? { ...s, status } : s);
    setDoc(doc(db, 'availabilities', id), { slots: updatedSlots }, { merge: true });
  }, [db, availabilities]);

  return { availabilities, getDayAvailability, updateAvailability, bookSlot, createGroupClass, cancelBooking, setSlotStatus };
}
