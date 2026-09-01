import TutorLayout from '@/src/components/TutorLayout.tsx';
import ChatInterface from '@/src/components/chat/ChatInterface';

export default function TutorMessages() {
  return (
    <TutorLayout>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        <ChatInterface
          headerTitle="Tutor Messages & Support"
          headerSubtitle="Chat with student posters, guardians, and Home Tutor BD Admin Support in real time."
          theme="tutor"
        />
      </div>
    </TutorLayout>
  );
}
