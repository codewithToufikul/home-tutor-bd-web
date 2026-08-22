import { MessageSquare, Send, User } from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';

export default function StudentMessages() {
  return (
    <StudentLayout>
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-black text-[#001F3F]">Messages & Support</h1>
          <p className="text-xs text-ink-muted">Communicate with admin and shortlisted tutors.</p>
        </div>

        <div className="bg-white rounded-3xl border border-ink/10 shadow-sm h-[500px] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-ink/5 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#001F3F]">Admin Support</h4>
              <p className="text-[10px] text-emerald-600 font-bold">Online</p>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-4">
            <div className="bg-gray-100 p-4 rounded-2xl max-w-sm text-xs font-medium text-ink">
              Welcome to Home Tutor Provider BD! How can we help you find the best tutor for your child today?
            </div>
          </div>

          <div className="p-4 border-t border-ink/5 flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-grow bg-gray-50 border border-ink/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
            <button className="p-3 bg-secondary text-white rounded-2xl hover:bg-emerald-600 transition-colors shadow-md shadow-secondary/20">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}