
"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface NewsArticle {
  id: string;
  tag: string;
  title: string;
  content: string;
  fullContent?: string;
  image: string;
  extraImages?: string[];
  date: string;
  type: 'news' | 'event' | 'update';
  createdAt?: string;
  likes?: string[];
}

export function useNewsStore() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: NewsArticle[] = [];
      snapshot.forEach(doc => {
        list.push({ ...doc.data() as NewsArticle, id: doc.id });
      });
      setArticles(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching news:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const addArticle = useCallback(async (article: Omit<NewsArticle, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substring(7);
    const docRef = doc(db, 'news', id);
    const data: NewsArticle = {
      ...article,
      id,
      createdAt: new Date().toISOString(),
      likes: []
    };

    return setDoc(docRef, data).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: data
      }));
    });
  }, [db]);

  const updateArticle = useCallback(async (id: string, updates: Partial<NewsArticle>) => {
    const docRef = doc(db, 'news', id);
    return updateDoc(docRef, updates).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updates
      }));
    });
  }, [db]);

  const deleteArticle = useCallback(async (id: string) => {
    const docRef = doc(db, 'news', id);
    return deleteDoc(docRef).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
  }, [db]);

  const toggleLike = useCallback(async (articleId: string, userId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const currentLikes = article.likes || [];
    const isLiked = currentLikes.includes(userId);
    const newLikes = isLiked 
      ? currentLikes.filter(id => id !== userId)
      : [...currentLikes, userId];

    const docRef = doc(db, 'news', articleId);
    // Usamos updateDoc para actualizar específicamente el campo de likes
    return updateDoc(docRef, { likes: newLikes }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { likes: newLikes }
      }));
    });
  }, [db, articles]);

  return { articles, loading, addArticle, updateArticle, deleteArticle, toggleLike };
}
