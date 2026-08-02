import type { ReactNode } from 'react';

import { AuthProvider } from '@/src/context/AuthContext.tsx';

export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
