
"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  image: string;
  stock: number;
  category: string;
  isEnabled: boolean;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  studentId: string;
  pointsSpent: number;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: any;
}

export function useRewardsStore() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    if (!db) return;

    const unsubRewards = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      const list: RewardItem[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data() as RewardItem, id: doc.id }));
      setRewards(list);
      setLoading(false);
    });

    const unsubRedemptions = onSnapshot(collection(db, 'redemptions'), (snapshot) => {
      const list: RewardRedemption[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data() as RewardRedemption, id: doc.id }));
      setRedemptions(list);
    });

    return () => {
      unsubRewards();
      unsubRedemptions();
    };
  }, [db]);

  const addReward = useCallback(async (reward: Omit<RewardItem, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const docRef = doc(db, 'rewards', id);
    return setDoc(docRef, { ...reward, id }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: reward
      }));
    });
  }, [db]);

  const updateReward = useCallback(async (id: string, updates: Partial<RewardItem>) => {
    const docRef = doc(db, 'rewards', id);
    return updateDoc(docRef, updates).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updates
      }));
    });
  }, [db]);

  const redeemReward = useCallback(async (rewardId: string, studentId: string, points: number) => {
    const id = Math.random().toString(36).substring(7);
    const docRef = doc(db, 'redemptions', id);
    const redemption: RewardRedemption = {
      id,
      rewardId,
      studentId,
      pointsSpent: points,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    return setDoc(docRef, redemption).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: redemption
      }));
    });
  }, [db]);

  const updateRedemptionStatus = useCallback(async (id: string, status: RewardRedemption['status']) => {
    const docRef = doc(db, 'redemptions', id);
    return updateDoc(docRef, { status }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { status }
      }));
    });
  }, [db]);

  return { 
    rewards, 
    redemptions, 
    loading, 
    addReward, 
    updateReward, 
    redeemReward, 
    updateRedemptionStatus 
  };
}
