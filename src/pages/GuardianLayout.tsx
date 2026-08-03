import { ReactNode, useEffect, useState } from 'react';
import { LayoutDashboard, PlusCircle, History, Heart, MessageSquare, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { GuardianProfileService } from '@/src/services/guardianProfileService.ts';

export default function GuardianLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const { user } = useAuth();
  const [guardianAvatar, setGuardianAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=guardian');
  const [guardianName, setGuardianName] = useState('Guardian Panel');

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      try {
        const profile = await GuardianProfileService.getByUid(user.uid);
        if (profile) {
          setGuardianAvatar(profile.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guardian');
          setGuardianName(profile.name || 'Guardian Panel');
        }
      } catch (err) {
        console.error('Failed to load guardian profile:', err);
      }
    };
    load();
  }, [user]);

  const menuItems = [
    { label: 'Dashboard', path: '/guardian/dashboard', icon: LayoutDashboard },
    { label: 'Post New Job', path: '/request-tutor', icon: PlusCircle },
    { label: 'My Requests', path: '/guardian/requests', icon: History },
    { label: 'Saved Tutors', path: '/guardian/saved', icon: Heart },
    { label: 'Messages', path: '/guardian/messages', icon: MessageSquare },
    { label: 'Settings', path: '/guardian/profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-ink/5 p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-8">
          {/* Brand & Guardian Profile Image */}
          <div className="flex items-center gap-3 px-2">
            <img 
              src={guardianAvatar} 
              alt="Guardian" 
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg shadow-emerald-500/20" 
            />
            <div>
              <h2 className="font-display font-black text-ink text-sm truncate max-w-[140px]">{guardianName}</h2>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Guardian Portal</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-ink/5 mt-6">
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut size={18} />
            Logout Account
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}