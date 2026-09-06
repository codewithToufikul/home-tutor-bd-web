import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import NoticeBoard from '@/src/components/NoticeBoard.tsx';

export default function CoachingNotices() {
  return (
    <CoachingLayout title="Coaching Notice Board">
      <div className="max-w-5xl mx-auto space-y-6">
        <NoticeBoard
          userRole="coaching"
          title="কোচিং নোটিশ বোর্ড (Coaching Notice Board)"
          subtitle="কোচিং সেন্টার পরিচালনা, ব্যাচ কার্যক্রম ও প্রশাসনিক নীতিমালার নিয়মিত আপডেট"
        />
      </div>
    </CoachingLayout>
  );
}
