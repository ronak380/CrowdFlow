// CrowdFlow — Firestore Client-Side Helpers
// Thin wrappers over Firestore SDK for type-safety

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  ticketId: string;
  role: 'user' | 'admin';
  activeSlotId: string | null;
  fcmToken: string | null;
  createdAt: Date;
}

export interface QueueDoc {
  id: string;
  gate: string;
  currentServing: number;
  lastAssigned: number;
  activeCount: number;
  capacity: number;
}

export interface SlotDoc {
  id: string;
  userId: string;
  queueId: string;
  number: number;
  status: 'waiting' | 'called' | 'completed' | 'missed';
  assignedAt: Date;
  expiresAt: Date;
  missedAt: Date | null;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, 'uid' | 'createdAt' | 'activeSlotId' | 'fcmToken'>
): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role: 'user',
    activeSlotId: null,
    fcmToken: null,
    createdAt: serverTimestamp(),
  });
}

export async function updateFcmToken(uid: string, token: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { fcmToken: token });
}

export async function clearActiveSlot(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { activeSlotId: null });
}

export async function getSlot(slotId: string): Promise<SlotDoc | null> {
  const snap = await getDoc(doc(db, 'slots', slotId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    ...d,
    assignedAt: d.assignedAt?.toDate?.() ?? new Date(),
    expiresAt: d.expiresAt?.toDate?.() ?? new Date(),
    missedAt: d.missedAt?.toDate?.() ?? null,
  } as SlotDoc;
}

export async function getMissedSlotForUser(userId: string): Promise<SlotDoc | null> {
  const q = query(
    collection(db, 'slots'),
    where('userId', '==', userId),
    where('status', '==', 'missed')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0].data();
  return {
    id: snap.docs[0].id,
    ...d,
    assignedAt: d.assignedAt?.toDate?.() ?? new Date(),
    expiresAt: d.expiresAt?.toDate?.() ?? new Date(),
    missedAt: d.missedAt?.toDate?.() ?? null,
  } as SlotDoc;
}
