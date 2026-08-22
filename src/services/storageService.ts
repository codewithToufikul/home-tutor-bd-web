import { StorageRepository, type StorageUploadResult } from '@/src/repositories/storageRepository.ts';

export type StorageFolder =
  | 'profile-images'
  | 'guardian-profile-images'
  | 'student-profile-images'
  | 'coaching-logo'
  | 'coaching-banner'
  | 'cv'
  | 'certificates'
  | 'nid'
  | 'verification'
  | 'blogs'
  | 'downloads'
  | 'notice-attachments';

export type StorageMetadata = {
  downloadURL: string;
  storagePath: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  ownerUid: string;
  fileName: string;
};

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  'profile-images': ['jpg', 'jpeg', 'png', 'webp'],
  'guardian-profile-images': ['jpg', 'jpeg', 'png', 'webp'],
  'student-profile-images': ['jpg', 'jpeg', 'png', 'webp'],
  'coaching-logo': ['jpg', 'jpeg', 'png', 'webp'],
  'coaching-banner': ['jpg', 'jpeg', 'png', 'webp'],
  'cv': ['pdf'],
  'certificates': ['pdf', 'png', 'jpg', 'jpeg'],
  'nid': ['pdf', 'png', 'jpg', 'jpeg'],
  'verification': ['pdf', 'png', 'jpg', 'jpeg'],
  'blogs': ['jpg', 'jpeg', 'png', 'webp'],
  'downloads': ['pdf', 'zip'],
  'notice-attachments': ['pdf', 'zip', 'jpg', 'jpeg', 'png', 'webp'],
};

const MAX_SIZES: Record<string, number> = {
  'profile-images': 5 * 1024 * 1024,
  'guardian-profile-images': 5 * 1024 * 1024,
  'student-profile-images': 5 * 1024 * 1024,
  'coaching-logo': 5 * 1024 * 1024,
  'coaching-banner': 5 * 1024 * 1024,
  'cv': 10 * 1024 * 1024,
  'certificates': 10 * 1024 * 1024,
  'nid': 10 * 1024 * 1024,
  'verification': 10 * 1024 * 1024,
  'blogs': 5 * 1024 * 1024,
  'downloads': 25 * 1024 * 1024,
  'notice-attachments': 25 * 1024 * 1024,
};

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  zip: 'application/zip',
};

const deepSafeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getExtension = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return ext;
};

const sanitizeFileName = (fileName: string) => {
  const extension = getExtension(fileName);
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const normalizedBase = baseName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();

  const safeBase = normalizedBase || 'file';
  return extension ? `${safeBase}.${extension}` : safeBase;
};

const getContentType = (file: File) => {
  const ext = getExtension(file.name);
  return MIME_BY_EXTENSION[ext] || file.type || 'application/octet-stream';
};

const validateFile = (folder: StorageFolder, file: File) => {
  const extension = getExtension(file.name);
  const allowed = ALLOWED_EXTENSIONS[folder] ?? [];
  const mime = getContentType(file);
  const maxSize = MAX_SIZES[folder] ?? Number.MAX_SAFE_INTEGER;

  if (!allowed.includes(extension)) {
    throw new Error(`Unsupported file type for ${folder}.`);
  }

  if (!mime || mime === 'application/octet-stream') {
    throw new Error('Unsupported or missing file content type.');
  }

  if (file.size > maxSize) {
    throw new Error(`File exceeds the ${maxSize / (1024 * 1024)}MB size limit for ${folder}.`);
  }

  if (folder === 'profile-images' || folder === 'guardian-profile-images' || folder === 'student-profile-images' || folder === 'coaching-logo' || folder === 'coaching-banner' || folder === 'blogs') {
    if (!mime.startsWith('image/')) {
      throw new Error(`Only image files are allowed in ${folder}.`);
    }
  }

  if (folder === 'cv' || folder === 'certificates' || folder === 'nid' || folder === 'verification' || folder === 'downloads') {
    const allowedMime = folder === 'downloads' ? ['application/pdf', 'application/zip'] : ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMime.includes(mime)) {
      throw new Error(`Invalid content type for ${folder}.`);
    }
  }
};

export const StorageService = {
  buildStoragePath(folder: StorageFolder, uid: string, fileName?: string) {
    const extension = fileName ? getExtension(fileName) : 'bin';
    const safeFileName = sanitizeFileName(`${Date.now()}-${deepSafeId()}.${extension}`);
    return `${folder}/${uid}/${safeFileName}`;
  },

  buildAdminStoragePath(folder: StorageFolder, fileName?: string) {
    const extension = fileName ? getExtension(fileName) : 'bin';
    const safeFileName = sanitizeFileName(`${Date.now()}-${deepSafeId()}.${extension}`);
    return `${folder}/${safeFileName}`;
  },

  async upload({
    folder,
    uid,
    file,
    onProgress,
  }: {
    folder: StorageFolder;
    uid: string;
    file: File;
    onProgress?: (progress: number) => void;
  }): Promise<StorageMetadata> {
    validateFile(folder, file);

    const storagePath = this.buildStoragePath(folder, uid, file.name);
    const result = await StorageRepository.uploadFile(storagePath, file, onProgress, {
      contentType: getContentType(file),
    });

    return {
      downloadURL: result.downloadURL,
      storagePath: result.storagePath,
      contentType: result.contentType,
      size: result.size,
      uploadedAt: result.uploadedAt,
      ownerUid: uid,
      fileName: result.fileName,
    };
  },

  async replace({
    folder,
    uid,
    oldStoragePath,
    file,
    onProgress,
  }: {
    folder: StorageFolder;
    uid: string;
    oldStoragePath: string;
    file: File;
    onProgress?: (progress: number) => void;
  }): Promise<StorageMetadata> {
    validateFile(folder, file);

    const storagePath = this.buildStoragePath(folder, uid, file.name);
    const result = await StorageRepository.replaceFile(oldStoragePath, storagePath, file, onProgress);

    return {
      downloadURL: result.downloadURL,
      storagePath: result.storagePath,
      contentType: result.contentType,
      size: result.size,
      uploadedAt: result.uploadedAt,
      ownerUid: uid,
      fileName: result.fileName,
    };
  },

  async remove(storagePath: string) {
    await StorageRepository.deleteFile(storagePath);
  },

  async getDownloadURL(storagePath: string) {
    return StorageRepository.downloadURL(storagePath);
  },

  async getMetadata(storagePath: string) {
    return StorageRepository.metadata(storagePath);
  },
};
