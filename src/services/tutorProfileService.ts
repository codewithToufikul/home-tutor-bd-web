import { TutorProfileRepository, TutorProfileRecord } from '@/src/repositories/tutorProfileRepository';

export const TutorProfileService = {
  /** Fetch own profile via /tutors/me — returns null if not yet created */
  async getByUid(uid: string): Promise<TutorProfileRecord | null> {
    return TutorProfileRepository.getByUid(uid);
  },

  async getById(id: string): Promise<TutorProfileRecord | null> {
    return TutorProfileRepository.getById(id);
  },

  async getAll(): Promise<TutorProfileRecord[]> {
    const result = await TutorProfileRepository.getAll();
    return Array.isArray(result) ? result : [];
  },

  /** Create a brand-new profile (POST /tutors/profile) */
  async create(payload: Partial<TutorProfileRecord>): Promise<TutorProfileRecord> {
    return TutorProfileRepository.create(payload as TutorProfileRecord);
  },

  /** Update existing profile (PATCH /tutors/profile — no ID needed, uses auth token) */
  async update(_id: string, data: Partial<TutorProfileRecord>): Promise<TutorProfileRecord> {
    return TutorProfileRepository.update(_id, data);
  },

  /**
   * Smart upsert — checks if a profile exists first, then:
   *   • exists  → PATCH /tutors/profile
   *   • missing → POST  /tutors/profile
   *
   * This is the recommended method to call from the UI.
   */
  async upsert(uid: string, data: Partial<TutorProfileRecord>): Promise<TutorProfileRecord> {
    const existing = await TutorProfileRepository.getByUid(uid);
    if (existing) {
      // Profile exists — update it (PATCH does not require an ID on this backend)
      return TutorProfileRepository.update('me', data);
    } else {
      // No profile yet — create it
      return TutorProfileRepository.create(data as TutorProfileRecord);
    }
  },

  async remove(id: string) {
    return TutorProfileRepository.remove(id);
  },
};

