import GuardianLayout from './GuardianLayout';
import ChatInterface from '@/src/components/chat/ChatInterface';

export default function GuardianMessages() {
  return (
    <GuardianLayout>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        <ChatInterface
          headerTitle="Guardian Messages & Support"
          headerSubtitle="Communicate directly with Admin Support and verified tutors for your child."
          theme="guardian"
        />
      </div>
    </GuardianLayout>
  );
}