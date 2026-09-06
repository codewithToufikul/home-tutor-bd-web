/**
 * Client-side high-performance image compression utility.
 * Resizes large images maintaining aspect ratio and converts to webp/jpeg with compression.
 */
export interface CompressionResult {
  file: File;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  compressionRatio: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1000,
  quality = 0.82
): Promise<CompressionResult> {
  // If file is not an image or is an SVG/GIF, return as-is
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return {
      file,
      originalSizeFormatted: formatBytes(file.size),
      compressedSizeFormatted: formatBytes(file.size),
      compressionRatio: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            file,
            originalSizeFormatted: formatBytes(file.size),
            compressedSizeFormatted: formatBytes(file.size),
            compressionRatio: 0,
          });
          return;
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP (fallback to JPEG if webp not supported)
        const mimeType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                originalSizeFormatted: formatBytes(file.size),
                compressedSizeFormatted: formatBytes(file.size),
                compressionRatio: 0,
              });
              return;
            }

            // Create new File with clean extension
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${baseName}.webp`, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const ratio = Math.round(((file.size - compressedFile.size) / file.size) * 100);

            resolve({
              file: compressedFile,
              originalSizeFormatted: formatBytes(file.size),
              compressedSizeFormatted: formatBytes(compressedFile.size),
              compressionRatio: Math.max(0, ratio),
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
  });
}
