import GuardianLayout from '@/src/pages/GuardianLayout.tsx';
import DownloadZone from '@/src/components/DownloadZone.tsx';

export default function GuardianDownloads() {
  return (
    <GuardianLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <DownloadZone />
      </div>
    </GuardianLayout>
  );
}
