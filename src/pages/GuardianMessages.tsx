import { MessageSquare, Send, User } from 'lucide-react';
import GuardianLayout from './GuardianLayout';

export default function GuardianMessages() {
  return (
    <GuardianLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-xl shadow-ink/5">
          <h1 className="text-3xl font-display font-black text-ink">Messages & Support</h1>
          <p className="text-xs font-medium text-ink-muted mt-1">Communicate with admin and shortlisted tutors for your child.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-xl shadow-ink/5 h-[550px] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-ink/5 bg-white/40 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
              <User size={22} />
            </div>
            <div>
              <h4 className="text-sm font-black text-ink">Admin Support</h4>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Online</p>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-4">
            <div className="bg-white p-4 rounded-2xl max-w-sm text-xs font-bold text-ink shadow-sm border border-ink/5">
              Welcome to Home Tutor Provider BD Guardian Portal! How can we help you find the best tutor for your child today?
            </div>
          </div>

          <div className="p-6 border-t border-ink/5 bg-white/40 flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-grow bg-white border border-ink/5 rounded-2xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-ink"
            />
            <button className="p-4 bg-secondary text-white rounded-2xl hover:bg-secondary-dark transition-all shadow-lg shadow-secondary/20 cursor-pointer">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </GuardianLayout>
  );
}