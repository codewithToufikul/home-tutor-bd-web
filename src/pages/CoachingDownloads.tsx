import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import DownloadZone from '@/src/components/DownloadZone.tsx';

export default function CoachingDownloads() {
  return (
    <CoachingLayout title="Download & PDF Zone">
      <div className="max-w-5xl mx-auto space-y-6">
        <DownloadZone />
      </div>
    </CoachingLayout>
  );
}
