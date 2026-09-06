import TutorLayout from '@/src/components/TutorLayout.tsx';
import DownloadZone from '@/src/components/DownloadZone.tsx';

export default function TutorDownloads() {
  return (
    <TutorLayout>
      <div className="space-y-6">
        <DownloadZone />
      </div>
    </TutorLayout>
  );
}
