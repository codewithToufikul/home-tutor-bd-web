import { RouterProvider } from 'react-router-dom';

import { appRouter } from '@/src/app/router/index.tsx';
import { AppProviders } from '@/src/app/providers/AppProviders.tsx';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}