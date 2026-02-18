
"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from './auth-store';

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: string | null;
  studentId?: string | null;
  teacherName?: string | null;
  instrument?: string | null;
  type: 'virtual' | 'presencial';
  zone?: string | null; 
  status?: 'pending' | 'completed';
  isGroup?: boolean;
  students?: { id: string, name: string }[] | null;
  teachers?: { id: string, name: string }[] | null;
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

function cleanData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => cleanData(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanData(v)])
    );
  }
  return obj;
}

export function useBookingStore() {
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);
  const db = useFirestore();
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (!firebaseUser) {
      setAvailabilities([]);
      return;
    }

    const q = collection(db, 'availabilities');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: DayAvailability[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id } as DayAvailability));
      setAvailabilities(list);
    }, async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'availabilities',
        operation: 'list'
      }));
    });
    return () => unsubscribe();
  }, [db, firebaseUser]);

  const addNotification = useCallback(async (recipientId: string, title: string, body: string, type: string) => {
    const notifId = Math.random().toString(36).substring(7);
    const docRef = doc(db, 'notifications', notifId);
    await setDoc(docRef, {
      id: notifId,
      recipientId,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
      type
    });
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
    const docRef = doc(db, 'availabilities', id);
    const data = cleanData({ teacherId, date: dateStr, slots });
    setDoc(docRef, data, { merge: true })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      });
  }, [db]);

  const bookSlot = useCallback(async (teacherId: string, date: Date, slotId: string, studentName: string, studentId: string, instrument: string, teacherName?: string, adminIds: string[] = [], zone?: string) => {
    const dateStr = toLocalDateString(date);
    const id = `${teacherId}_${dateStr}`;
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    
    let updatedSlots: TimeSlot[] = [];
    let targetSlot: TimeSlot | undefined;

    const slotPayload = {
      isBooked: true, 
      bookedBy: studentName, 
      studentId, 
      isAvailable: false, 
      instrument, 
      status: 'pending', 
      teacherName: teacherName || null,
      zone: zone || 'Miraflores'
    };

    if (existing) {
      updatedSlots = existing.slots.map(s => {
        if (s.id === slotId) {
          targetSlot = { ...s, ...slotPayload };
          return targetSlot;
        }
        return s;
      });
    } else {
      updatedSlots = INITIAL_SLOTS.map(s => {
        const sid = Math.random().toString(36).substring(2, 9);
        const isTarget = sid === slotId;
        const newSlot: TimeSlot = {
          id: sid, 
          time: s, 
          isAvailable: false,
          isBooked: isTarget,
          bookedBy: isTarget ? studentName : null,
          studentId: isTarget ? studentId : null,
          instrument: isTarget ? instrument : null,
          teacherName: isTarget ? (teacherName || null) : null,
          type: 'presencial', 
          zone: isTarget ? (zone || 'Miraflores') : null,
          status: 'pending'
        };
        if (isTarget) targetSlot = newSlot;
        return newSlot;
      });
    }

    const docRef = doc(db, 'availabilities', id);
    const data = cleanData({ teacherId, date: dateStr, slots: updatedSlots });
    
    await setDoc(docRef, data, { merge: true })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      });

    if (targetSlot) {
      const time = targetSlot.time;
      const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      
      const profTitle = "¡Nueva Clase Agendada! 🎸";
      const profBody = `${studentName} ha reservado una clase de ${instrument} para el ${formattedDate} en el horario de ${time}. Zona: ${zone || 'No especificada'}.`;
      addNotification(teacherId, profTitle, profBody, 'booking');

      const adminTitle = "Nueva Reserva en la Academia 🏢";
      const adminBody = `${studentName} reservó con Prof. ${teacherName || 'Docente'} para ${instrument} el ${formattedDate} (${time}) en ${zone || 'Miraflores'}.`;
      
      adminIds.forEach(adminId => {
        addNotification(adminId, adminTitle, adminBody, 'admin_alert');
      });
    }
  }, [db, availabilities, addNotification]);

  const createGroupClass = useCallback((teacherId: string, date: Date, time: string, studentList: {id: string, name: string}[], instrument: string, type: 'virtual' | 'presencial', teacherList: {id: string, name: string}[]) => {
    const dateStr = toLocalDateString(date);
    const id = `${teacherId}_${dateStr}`;
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    
    const newSlot: TimeSlot = {
      id: 'group-' + Math.random().toString(36).substring(2, 9),
      time, isAvailable: false, isBooked: true, isGroup: true,
      students: studentList, teachers: teacherList, instrument, type, status: 'pending',
      zone: type === 'virtual' ? 'Virtual' : 'Sede' 
    };

    const slots = existing ? [...existing.slots, newSlot] : [newSlot];
    const docRef = doc(db, 'availabilities', id);
    const data = cleanData({ teacherId, date: dateStr, slots });
    setDoc(docRef, data, { merge: true })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      });
  }, [db, availabilities]);

  const cancelBooking = useCallback((teacherId: string, date: Date, slotId: string) => {
    const dateStr = toLocalDateString(date);
    const id = `${teacherId}_${dateStr}`;
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    if (!existing) return;

    const updatedSlots = existing.slots.map(s => 
      s.id === slotId ? { 
        ...s, 
        isBooked: false, 
        bookedBy: null, 
        studentId: null, 
        isAvailable: true, 
        instrument: null, 
        status: 'pending', 
        students: null, 
        isGroup: false, 
        teachers: null,
        zone: null
      } : s
    ).filter(s => !s.id.startsWith('group-') || s.isBooked);

    const docRef = doc(db, 'availabilities', id);
    const data = cleanData({ slots: updatedSlots });
    setDoc(docRef, data, { merge: true })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      });
  }, [db, availabilities]);

  const setSlotStatus = useCallback((teacherId: string, dateStr: string, slotId: string, status: 'pending' | 'completed') => {
    const id = `${teacherId}_${dateStr}`;
    const existing = availabilities.find(a => a.teacherId === teacherId && a.date === dateStr);
    if (!existing) return;

    const updatedSlots = existing.slots.map(s => s.id === slotId ? { ...s, status } : s);
    const docRef = doc(db, 'availabilities', id);
    const data = cleanData({ slots: updatedSlots });
    setDoc(docRef, data, { merge: true })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      });
  }, [db, availabilities]);

  return { availabilities, getDayAvailability, updateAvailability, bookSlot, createGroupClass, cancelBooking, setSlotStatus };
}
