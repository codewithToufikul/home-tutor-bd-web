import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, X, Sparkles, Loader2 } from 'lucide-react';
import { requestPushPermission } from '@/src/services/onesignal.service.ts';

export default function NotificationPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Check if user already dismissed for this session
    const isDismissed = sessionStorage.getItem('dismiss_notif_banner') === 'true';
    if (isDismissed) {
      return;
    }

    // If permission is already granted, do not show
    if (Notification.permission === 'granted') {
      return;
    }

    // If permission is denied
    if (Notification.permission === 'denied') {
      setIsBlocked(true);
    }

    setIsVisible(true);

    // Listen for OneSignal permission changes if available
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push((OneSignal: any) => {
      try {
        if (OneSignal?.Notifications?.addEventListener) {
          OneSignal.Notifications.addEventListener('permissionChange', (permission: boolean) => {
            if (permission) {
              setIsVisible(false);
            }
          });
        }
      } catch (err) {
        // silent catch
      }
    });
  }, []);

  const handleAllowClick = async () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      setIsBlocked(true);
      return;
    }

    setIsRequesting(true);
    try {
      const granted = await requestPushPermission();
      if (granted || (typeof Notification !== 'undefined' && Notification.permission === 'granted')) {
        setIsVisible(false);
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        setIsBlocked(true);
      }
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        setIsBlocked(true);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('dismiss_notif_banner', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Notification Permission Prompt"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-gradient-to-r from-[#006A4E] via-[#015840] to-[#014D39] text-white border-b border-emerald-500/20 shadow-xs relative z-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 text-xs">
          {/* Left: Icon & Text */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 text-emerald-200">
              <BellRing size={13} className="animate-pulse sm:w-[14px] sm:h-[14px]" />
            </div>
            
            {isBlocked ? (
              <p className="font-medium text-amber-200 text-[11px] sm:text-xs">
                <span className="font-black text-white">⚠️ Notifications Blocked in Browser:</span>{' '}
                ব্রাউজারের URL বারে <strong>🔒 Lock / Site Settings</strong> আইকনে ক্লিক করে Notification <strong>"Allow"</strong> করুন।
              </p>
            ) : (
              <p className="font-medium text-emerald-50 text-[11px] sm:text-xs truncate sm:whitespace-normal">
                <span className="font-bold text-white hidden sm:inline">Real-time Alerts: </span>
                Enable push notifications to get instant alerts on tuition requests, job updates & messages.
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isBlocked ? (
              <button
                onClick={handleAllowClick}
                disabled={isRequesting}
                className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white text-[#006A4E] hover:bg-emerald-50 font-black text-[10.5px] sm:text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-75"
              >
                {isRequesting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="text-amber-500" />
                    <span>Allow Notifications</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  alert('ব্রাউজার নোটিফিকেশন আনব্লক করার নিয়ম:\n\n১. ব্রাউজারের উপরে URL বারে (যেখানে localhost লেখা) বামপাশের 🔒 (Lock / Tune) আইকনে ক্লিক করুন।\n২. Notifications অপশনটিতে গিয়ে "Allow" সিলেক্ট করুন।\n৩. পেজটি একবার রিলোড (Refresh) করুন।');
                }}
                className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-amber-400 text-amber-950 hover:bg-amber-300 font-black text-[10.5px] sm:text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                কীভাবে আনব্লক করবেন?
              </button>
            )}

            <button
              onClick={handleDismiss}
              aria-label="Dismiss notification alert"
              className="p-1 hover:bg-white/10 rounded-full text-emerald-200 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
