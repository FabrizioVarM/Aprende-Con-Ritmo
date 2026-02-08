
"use client"

import { useState, useEffect, useCallback } from 'react';

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
  date: string; // Formato YYYY-MM-DD local
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

// Helper para fecha local consistente YYYY-MM-DD
const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useBookingStore() {
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);

  const loadData = useCallback(() => {
    const saved = localStorage.getItem('ac_availabilities');
    if (saved) {
      try {
        setAvailabilities(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading availabilities", e);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
    // Escuchar cambios de otras instancias o pestañas
    const handleSync = () => loadData();
    window.addEventListener('ac_sync_booking', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ac_sync_booking', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadData]);

  const saveToStorage = useCallback((data: DayAvailability[]) => {
    localStorage.setItem('ac_availabilities', JSON.stringify(data));
    setAvailabilities([...data]);
    // Forzar evento de sincronización global
    window.dispatchEvent(new CustomEvent('ac_sync_booking'));
  }, []);

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
    const newAvailabilities = availabilities.filter(a => !(a.teacherId === teacherId && a.date === dateStr));
    newAvailabilities.push({ teacherId, date: dateStr, slots });
    saveToStorage(newAvailabilities);
  }, [availabilities, saveToStorage]);

  const bookSlot = useCallback((teacherId: string, date: Date, slotId: string, studentName: string, studentId: string, instrument: string, teacherName?: string) => {
    const dateStr = toLocalDateString(date);
    const exists = availabilities.some(a => a.teacherId === teacherId && a.date === dateStr);
    
    let updated: DayAvailability[];
    if (exists) {
      updated = availabilities.map(a => {
        if (a.teacherId === teacherId && a.date === dateStr) {
          return {
            ...a,
            slots: a.slots.map(s => s.id === slotId ? { ...s, isBooked: true, bookedBy: studentName, studentId, isAvailable: false, instrument, status: 'pending', teacherName } : s)
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
            bookedBy: id === slotId ? studentName : undefined,
            studentId: id === slotId ? studentId : undefined,
            instrument: id === slotId ? instrument : undefined,
            teacherName: id === slotId ? teacherName : undefined,
            type: 'presencial',
            status: 'pending'
          };
        })
      };
      updated = [...availabilities, current];
    }

    saveToStorage(updated);
  }, [availabilities, saveToStorage]);

  const createGroupClass = useCallback((teacherId: string, date: Date, time: string, studentList: {id: string, name: string}[], instrument: string, type: 'virtual' | 'presencial', teacherList: {id: string, name: string}[]) => {
    const dateStr = toLocalDateString(date);
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    
    const newSlot: TimeSlot = {
      id: 'group-' + Math.random().toString(36).substring(2, 9),
      time,
      isAvailable: false,
      isBooked: true,
      isGroup: true,
      students: studentList,
      teachers: teacherList,
      instrument,
      type,
      status: 'pending'
    };

    let updated: DayAvailability[];
    if (existing) {
      updated = availabilities.map(a => {
        if (a.teacherId === teacherId && a.date === dateStr) {
          return { ...a, slots: [...a.slots, newSlot] };
        }
        return a;
      });
    } else {
      updated = [...availabilities, { teacherId, date: dateStr, slots: [newSlot] }];
    }
    saveToStorage(updated);
  }, [availabilities, saveToStorage]);

  const cancelBooking = useCallback((teacherId: string, date: Date, slotId: string) => {
    const dateStr = toLocalDateString(date);
    const updated = availabilities.map(a => {
      if (a.teacherId === teacherId && a.date === dateStr) {
        return {
          ...a,
          slots: a.slots.map(s => 
            s.id === slotId 
              ? { ...s, isBooked: false, bookedBy: undefined, studentId: undefined, isAvailable: true, instrument: undefined, status: 'pending', students: undefined, isGroup: false, teachers: undefined } 
              : s
          ).filter(s => !s.id.startsWith('group-') || (s.isBooked)) // Eliminar slots de grupo si se cancelan (opcional)
        };
      }
      return a;
    });
    saveToStorage(updated);
  }, [availabilities, saveToStorage]);

  const setSlotStatus = useCallback((teacherId: string, dateStr: string, slotId: string, status: 'pending' | 'completed') => {
    const updated = availabilities.map(a => {
      if (a.teacherId === teacherId && a.date === dateStr) {
        return {
          ...a,
          slots: a.slots.map(s => s.id === slotId ? { ...s, status } : s)
        };
      }
      return a;
    });
    saveToStorage(updated);
  }, [availabilities, saveToStorage]);

  return { availabilities, getDayAvailability, updateAvailability, bookSlot, createGroupClass, cancelBooking, setSlotStatus };
}
