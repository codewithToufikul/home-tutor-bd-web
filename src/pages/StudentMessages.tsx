import StudentLayout from '@/src/components/StudentLayout.tsx';
import ChatInterface from '@/src/components/chat/ChatInterface';

export default function StudentMessages() {
  return (
    <StudentLayout>
      <div className="w-full h-full">
        <ChatInterface
          headerTitle="Student Messages & Support"
          headerSubtitle="Chat directly with Home Tutor BD Admin Support and your shortlisted or matched tutors."
          theme="student"
        />
      </div>
    </StudentLayout>
  );
}