import GuardianLayout from '@/src/pages/GuardianLayout.tsx';
import NoticeBoard from '@/src/components/NoticeBoard.tsx';

export default function GuardianNotices() {
  return (
    <GuardianLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <NoticeBoard
          userRole="guardian"
          title="অভিভাবক নোটিশ বোর্ড (Guardian Notice Board)"
          subtitle="টিউটর নিয়োগ, পেমেন্ট পলিসি ও গুরুত্বপূর্ণ প্রাতিষ্ঠানিক নির্দেশনাবলী"
        />
      </div>
    </GuardianLayout>
  );
}
