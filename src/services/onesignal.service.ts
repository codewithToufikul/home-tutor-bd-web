declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
    getOneSignalInfo?: () => any;
  }
}

const ONESIGNAL_APP_ID = '44dd5693-e9aa-421a-8e15-9301b88acf22';
const SAFARI_WEB_ID = 'web.onesignal.auto.13f7d09c-87f4-478e-9a86-b96c3b883b5b';

let initPromise: Promise<void> | null = null;

const getPushSub = (OneSignal: any) => {
  return (
    OneSignal?.User?.PushSubscription ||
    OneSignal?.User?.pushSubscription ||
    OneSignal?.PushSubscription ||
    OneSignal?.pushSubscription
  );
};

export const initOneSignal = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();

  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise<void>((resolve) => {
    // 1. Ensure Service Worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/OneSignalSDKWorker.js')
        .then((reg) => console.log('⚙️ [ServiceWorker Scope]:', reg.scope))
        .catch((err) => console.warn('ServiceWorker notice:', err));
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        if (!OneSignal._isInitialized && !OneSignal.initialized) {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            safari_web_id: SAFARI_WEB_ID,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: 'OneSignalSDKWorker.js',
            serviceWorkerParam: { scope: '/' },
            notifyButton: {
              enable: false,
            },
          });
          console.log('✅ [OneSignal Frontend] Initialized successfully');

          // Trigger registration / permission
          try {
            if (OneSignal.Notifications?.requestPermission) {
              await OneSignal.Notifications.requestPermission();
            }
            const pushSub = getPushSub(OneSignal);
            if (pushSub?.optIn) {
              await pushSub.optIn();
            }
          } catch (pErr) {
            console.warn('Subscription trigger note:', pErr);
          }

          // Helper function for quick inspection in console
          window.getOneSignalInfo = () => {
            const pushSub = getPushSub(OneSignal);
            const info = {
              appId: ONESIGNAL_APP_ID,
              externalId: OneSignal.User?.externalId,
              pushSubscriptionId: pushSub?.id || pushSub?._id || 'None',
              pushToken: pushSub?.token ? 'Present' : 'None',
              optedIn: pushSub?.optedIn,
              permission: OneSignal.Notifications?.permission,
              browserPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unknown',
            };
            console.table(info);
            return info;
          };
        }
      } catch (error: any) {
        if (!error?.message?.includes('already initialized')) {
          console.warn('⚠️ [OneSignal Frontend Init Notice]:', error);
        }
      } finally {
        resolve();
      }
    });
  });

  return initPromise;
};

export const setOneSignalUser = async (userId: string, role?: string, _email?: string) => {
  if (typeof window === 'undefined' || !userId) return;

  await initOneSignal();

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      if (typeof OneSignal?.login === 'function') {
        await OneSignal.login(userId);

        if (OneSignal.User?.addAlias) {
          try {
            await OneSignal.User.addAlias('external_id', userId);
          } catch {}
        }

        const pushSub = getPushSub(OneSignal);
        if (pushSub?.optIn) {
          try {
            await pushSub.optIn();
          } catch {}
        }

        console.log(`👤 [OneSignal User Linked]: ${userId}`);

        if (role && OneSignal.User?.addTag) {
          await OneSignal.User.addTag('role', role);
        }
      }
    } catch (error) {
      console.warn('⚠️ [OneSignal User Link Warning]:', error);
    }
  });
};

export const logoutOneSignal = async () => {
  if (typeof window === 'undefined') return;

  await initOneSignal();

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      if (typeof OneSignal?.logout === 'function') {
        await OneSignal.logout();
        console.log('👋 [OneSignal] User logged out');
      }
    } catch (error) {
      console.warn('OneSignal logout:', error);
    }
  });
};

export const requestPushPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  await initOneSignal();

  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        if (OneSignal.Notifications?.requestPermission) {
          const permission = await OneSignal.Notifications.requestPermission();
          const pushSub = getPushSub(OneSignal);
          if (pushSub?.optIn) {
            await pushSub.optIn();
          }
          console.log('📣 [OneSignal Permission Result]:', permission);
          resolve(permission === true || permission === 'granted');
        } else {
          resolve(false);
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
        resolve(false);
      }
    });
  });
};
