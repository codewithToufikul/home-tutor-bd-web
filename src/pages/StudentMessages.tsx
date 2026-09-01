import StudentLayout from '@/src/components/StudentLayout.tsx';
import ChatInterface from '@/src/components/chat/ChatInterface';

export default function StudentMessages() {
  return (
    <StudentLayout>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        <ChatInterface
          headerTitle="Student Messages & Support"
          headerSubtitle="Chat directly with Home Tutor BD Admin Support and your shortlisted or matched tutors."
          theme="student"
        />
      </div>
    </StudentLayout>
  );
}