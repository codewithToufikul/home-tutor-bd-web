import { useState, useEffect } from 'react';
import { DEFAULT_PROFILE_IMAGE } from '@/src/constants';

interface SafeAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  alt?: string;
}

export default function SafeAvatar({ src, name, className = 'w-10 h-10 rounded-full object-cover', alt }: SafeAvatarProps) {
  const fallback = name
    ? `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`
    : DEFAULT_PROFILE_IMAGE;

  const [imgSrc, setImgSrc] = useState<string>(src?.trim() || fallback);

  useEffect(() => {
    setImgSrc(src?.trim() || fallback);
  }, [src, fallback]);

  const handleError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || name || 'User'}
      className={className}
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
}
