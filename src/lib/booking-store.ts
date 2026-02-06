"use client"

import { useState, useEffect } from 'react';

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
      setAvailabilities(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (data: DayAvailability[]) => {
    localStorage.setItem('ac_availabilities', JSON.stringify(data));
    setAvailabilities([...data]);
  };

  const getDayAvailability = (teacherId: string, date: Date): DayAvailability => {
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
  };

  const updateAvailability = (teacherId: string, date: Date, slots: TimeSlot[]) => {
    const dateStr = date.toISOString().split('T')[0];
    const newAvailabilities = availabilities.filter(a => !(a.teacherId === teacherId && a.date === dateStr));
    newAvailabilities.push({ teacherId, date: dateStr, slots });
    saveToStorage(newAvailabilities);
  };

  const bookSlot = (teacherId: string, date: Date, slotId: string, studentName: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const updated = availabilities.map(a => {
      if (a.teacherId === teacherId && a.date === dateStr) {
        return {
          ...a,
          slots: a.slots.map(s => s.id === slotId ? { ...s, isBooked: true, bookedBy: studentName, isAvailable: false } : s)
        };
      }
      return a;
    });
    
    const exists = availabilities.some(a => a.teacherId === teacherId && a.date === dateStr);
    if (!exists) {
      const current = getDayAvailability(teacherId, date);
      current.slots = current.slots.map(s => s.id === slotId ? { ...s, isBooked: true, bookedBy: studentName, isAvailable: false } : s);
      updated.push(current);
    }

    saveToStorage(updated);
  };

  return { availabilities, getDayAvailability, updateAvailability, bookSlot };
}
