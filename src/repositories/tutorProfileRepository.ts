import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface TutorProfileRecord {
  id?: string;
  uid: string;
  email?: string;
  name?: string;
  photoUrl?: string;
  sscInstitute?: string;
  sscCurriculum?: string;
  sscGroup?: string;
  sscYear?: string;
  sscResult?: string;
  hscInstitute?: string;
  hscCurriculum?: string;
  hscGroup?: string;
  hscYear?: string;
  hscResult?: string;
  gradInstituteType?: string;
  gradInstitute?: string;
  gradStudyType?: string;
  gradDept?: string;
  gradCurriculum?: string;
  gradYear?: string;
  gradCgpa?: string;
  tuitionDistrict?: string;
  preferredArea?: string;
  preferredMedium?: string;
  preferredClass?: string;
  preferredSubject?: string;
  daysPerWeek?: string;
  timingShift?: string;
  expectedSalary?: string;
  tutoringStyle?: string;
  experienceYears?: string;
  fullName?: string;
  phone?: string;
  altPhone?: string;
  gender?: string;
  currentCity?: string;
  currentArea?: string;
  permanentAddress?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  emergencyPhone?: string;
  guardianRelation?: string;
  bio?: string;
  verificationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const TutorProfileRepository = {
  async getById(id: string) {
    return getDocument<TutorProfileRecord>('tutor_profiles', id);
  },

  async getByUid(uid: string) {
    const items = await listDocuments<TutorProfileRecord>('tutor_profiles', [{ field: 'uid', op: '==', value: uid }]);
    return items[0] ?? null;
  },

  async getAll() {
    return listDocuments<TutorProfileRecord>('tutor_profiles');
  },

  async create(record: TutorProfileRecord) {
    return createDocument('tutor_profiles', record);
  },

  async update(id: string, data: Partial<TutorProfileRecord>) {
    return updateDocument('tutor_profiles', id, data);
  },

  async remove(id: string) {
    return deleteDocument('tutor_profiles', id);
  },
};
