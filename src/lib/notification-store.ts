
"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: string;
}

export function useNotificationStore(userId?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const db = useFirestore();

  useEffect(() => {
    if (!userId || !db) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AppNotification[] = [];
      let unread = 0;
      snapshot.forEach(doc => {
        const data = doc.data() as AppNotification;
        list.push({ ...data, id: doc.id });
        if (!data.read) unread++;
      });
      setNotifications(list);
      setUnreadCount(unread);
    }, (error) => {
      console.error("Error loading notifications:", error);
    });

    return () => unsubscribe();
  }, [db, userId]);

  const addNotification = useCallback(async (recipientId: string, title: string, body: string, type: string = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const docRef = doc(db, 'notifications', id);
    const data: AppNotification = {
      id,
      recipientId,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
      type
    };

    setDoc(docRef, data).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: data
      }));
    });
  }, [db]);

  const markAsRead = useCallback((notificationId: string) => {
    const docRef = doc(db, 'notifications', notificationId);
    updateDoc(docRef, { read: true }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { read: true }
      }));
    });
  }, [db]);

  const markAllAsRead = useCallback(() => {
    notifications.forEach(n => {
      if (!n.read) markAsRead(n.id);
    });
  }, [notifications, markAsRead]);

  const clearNotification = useCallback((notificationId: string) => {
    const docRef = doc(db, 'notifications', notificationId);
    deleteDoc(docRef).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
  }, [db]);

  return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotification };
}
