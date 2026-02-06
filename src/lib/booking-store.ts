
"use client"

import { useState, useEffect, useCallback } from 'react';

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: string;
}

export interface DayAvailability {
  date: string; // ISO string YYYY-MM-DD
  teacherId: string;
  slots: TimeSlot[];
}

export const INITIAL_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
];

export function useBookingStore() {
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ac_availabilities');
    if (saved) {
      try {
        setAvailabilities(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading availabilities", e);
      }
    }
  }, []);

  const saveToStorage = useCallback((data: DayAvailability[]) => {
    localStorage.setItem('ac_availabilities', JSON.stringify(data));
    setAvailabilities([...data]);
  }, []);

  const getDayAvailability = useCallback((teacherId: string, date: Date): DayAvailability => {
    const dateStr = date.toISOString().split('T')[0];
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    
    if (existing) return existing;

    return {
      date: dateStr,
      teacherId,
      slots: INITIAL_SLOTS.map(s => ({ 
        id: Math.random().toString(36).substring(2, 9), 
        time: s, 
        isAvailable: false, 
        isBooked: false 
      }))
    };
  }, [availabilities]);

  const updateAvailability = useCallback((teacherId: string, date: Date, slots: TimeSlot[]) => {
    const dateStr = date.toISOString().split('T')[0];
    const newAvailabilities = availabilities.filter(a => !(a.teacherId === teacherId && a.date === dateStr));
    newAvailabilities.push({ teacherId, date: dateStr, slots });
    saveToStorage(newAvailabilities);
  }, [availabilities, saveToStorage]);

  const bookSlot = useCallback((teacherId: string, date: Date, slotId: string, studentName: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const exists = availabilities.some(a => a.teacherId === teacherId && a.date === dateStr);
    
    let updated: DayAvailability[];
    if (exists) {
      updated = availabilities.map(a => {
        if (a.teacherId === teacherId && a.date === dateStr) {
          return {
            ...a,
            slots: a.slots.map(s => s.id === slotId ? { ...s, isBooked: true, bookedBy: studentName, isAvailable: false } : s)
          };
        }
        return a;
      });
    } else {
      const current = {
        date: dateStr,
        teacherId,
        slots: INITIAL_SLOTS.map(s => {
          const id = Math.random().toString(36).substring(2, 9);
          return {
            id: id,
            time: s,
            isAvailable: false,
            isBooked: id === slotId,
            bookedBy: id === slotId ? studentName : undefined
          };
        })
      };
      updated = [...availabilities, current];
    }

    saveToStorage(updated);
  }, [availabilities, saveToStorage]);

  return { availabilities, getDayAvailability, updateAvailability, bookSlot };
}
