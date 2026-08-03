import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

import { db } from '@/src/firebase.js';

export type FirestoreFilter = {
  field: string;
  op: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains';
  value: unknown;
};

export function getCollectionRef(name: string) {
  return collection(db, name);
}

export function getDocumentRef(collectionName: string, id: string) {
  return doc(db, collectionName, id);
}

export async function listDocuments<T>(collectionName: string, filters: FirestoreFilter[] = [], orderByField?: string) {
  const constraints = [] as any[];

  filters.forEach((filter) => {
    constraints.push(where(filter.field, filter.op, filter.value));
  });

  if (orderByField) {
    constraints.push(orderBy(orderByField));
  }

  const snapshot = await getDocs(query(getCollectionRef(collectionName), ...constraints));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as T[];
}

export async function getDocument<T>(collectionName: string, id: string) {
  const snapshot = await getDoc(getDocumentRef(collectionName, id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as T & { id: string };
}

export async function createDocument<T extends { id?: string }>(collectionName: string, data: T) {
  const record = {
    ...data,
    createdAt: data.createdAt ?? Timestamp.now().toDate().toISOString(),
    updatedAt: Timestamp.now().toDate().toISOString(),
  };

  if (record.id) {
    const ref = getDocumentRef(collectionName, record.id);
    await setDoc(ref, record, { merge: true });
    return record.id;
  }

  const ref = await addDoc(getCollectionRef(collectionName), record);
  return ref.id;
}

export async function updateDocument<T>(collectionName: string, id: string, data: Partial<T>) {
  const ref = getDocumentRef(collectionName, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: Timestamp.now().toDate().toISOString(),
  });

  return id;
}

export async function deleteDocument(collectionName: string, id: string) {
  await deleteDoc(getDocumentRef(collectionName, id));
}
