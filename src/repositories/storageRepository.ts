// REST-API Cloudflare R2 Upload Client
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
  return uploadFileWithProgress(file, folder);
};

export const uploadFileWithProgress = (
  file: File,
  folder = 'home-tutor-bd/documents',
  onProgress?: (percent: number) => void,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/upload/single`);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.withCredentials = true;

    if (onProgress) onProgress(10);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.min(95, Math.max(15, Math.round((e.loaded / e.total) * 95)));
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (onProgress) onProgress(100);
          resolve(res.data.url);
        } catch (err) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
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
