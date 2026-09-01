import { apiDelete, apiGet, apiPost } from './baseRepository';

export interface SavedTutorRecord {
  id?: string;
  _id?: string;
  tutorId?: string;
  guardianId?: string;
  studentId?: string;
  [key: string]: unknown;
}

const STORAGE_KEY = 'saved_tutors_list';

const getLocalSaved = (userId?: string): SavedTutorRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: SavedTutorRecord[] = JSON.parse(raw);
    if (userId) {
      return list.filter(item => item.studentId === userId || item.guardianId === userId || item.userId === userId);
    }
    return list;
  } catch {
    return [];
  }
};

const saveLocalSaved = (list: SavedTutorRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to update saved tutors in localStorage:', err);
  }
};

export const SavedTutorsRepository = {
  async list(): Promise<SavedTutorRecord[]> {
    return getLocalSaved();
  },
  async listForGuardian(guardianId?: string): Promise<SavedTutorRecord[]> {
    return getLocalSaved(guardianId);
  },
  async listForStudent(studentId?: string): Promise<SavedTutorRecord[]> {
    return getLocalSaved(studentId);
  },
  async save(tutorId: string, userId?: string): Promise<SavedTutorRecord> {
    const current = getLocalSaved();
    const newItem: SavedTutorRecord = { id: `st_${Date.now()}`, tutorId, studentId: userId, guardianId: userId, createdAt: new Date().toISOString() };
    const updated = [...current.filter(i => i.tutorId !== tutorId), newItem];
    saveLocalSaved(updated);
    return newItem;
  },
  async create(payload: Partial<SavedTutorRecord>): Promise<SavedTutorRecord> {
    const current = getLocalSaved();
    const newItem: SavedTutorRecord = { id: `st_${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
    const updated = [...current.filter(i => i.tutorId !== payload.tutorId), newItem];
    saveLocalSaved(updated);
    return newItem;
  },
  async remove(idOrTutorId: string): Promise<boolean> {
    const current = getLocalSaved();
    const updated = current.filter(i => i.id !== idOrTutorId && i.tutorId !== idOrTutorId);
    saveLocalSaved(updated);
    return true;
  },
};

