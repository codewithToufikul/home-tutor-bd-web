import { RouterProvider } from 'react-router-dom';

import { appRouter } from '@/src/app/router/index.tsx';
import { AppProviders } from '@/src/app/providers/AppProviders.tsx';
import { MaintenancePage } from '@/src/pages/MaintenancePage.tsx';

// ⚙️ Maintenance Mode Switch (Set to false to bring the site back live)
const IS_MAINTENANCE_MODE = false;

export default function App() {
  if (IS_MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}