// REST-API Cloudinary Upload Client
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const API_BASE_URL = metaEnv?.VITE_API_URL || 'http://localhost:5001/api/v1';

export interface StorageUploadResult {
  downloadURL: string;
  storagePath: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  fileName: string;
}

export const uploadFile = async (
  file: File,
  folder = 'home-tutor-bd/documents',
): Promise<string> => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch(`${API_BASE_URL}/upload/single`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const err = (await res.json()) as { message?: string };
    throw new Error(err.message || 'File upload failed');
  }

  const json = (await res.json()) as { data: { url: string } };
  return json.data.url;
};

export const uploadMultipleFiles = async (
  files: File[],
  folder = 'home-tutor-bd/documents',
): Promise<string[]> => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('folder', folder);

  const res = await fetch(`${API_BASE_URL}/upload/multiple`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const err = (await res.json()) as { message?: string };
    throw new Error(err.message || 'File upload failed');
  }

  const json = (await res.json()) as { data: Array<{ url: string }> };
  return json.data.map((d) => d.url);
};

export const StorageRepository = {
  async uploadFile(
    storagePath: string,
    file: File,
    onProgress?: (progress: number) => void,
    opts?: { contentType?: string },
  ): Promise<StorageUploadResult> {
    if (onProgress) onProgress(50);
    const url = await uploadFile(file, storagePath.split('/')[0] || 'documents');
    if (onProgress) onProgress(100);

    return {
      downloadURL: url,
      storagePath,
      contentType: opts?.contentType || file.type || 'application/octet-stream',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
    };
  },

  async replaceFile(
    _oldPath: string,
    newPath: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<StorageUploadResult> {
    return this.uploadFile(newPath, file, onProgress);
  },

  async deleteFile(_storagePath: string): Promise<void> {
    // Cloudinary deletion can be invoked via backend endpoint if needed
  },

  async downloadURL(storagePath: string): Promise<string> {
    return storagePath;
  },

  async metadata(storagePath: string): Promise<Partial<StorageUploadResult>> {
    return { storagePath };
  },
};
