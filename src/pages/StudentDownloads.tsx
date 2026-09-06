import StudentLayout from '@/src/components/StudentLayout.tsx';
import DownloadZone from '@/src/components/DownloadZone.tsx';

export default function StudentDownloads() {
  return (
    <StudentLayout>
      <div className="space-y-6">
        <DownloadZone />
      </div>
    </StudentLayout>
  );
}
