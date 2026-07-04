import { useEffect } from 'react';
import { useAppDispatch, useAppState } from '@/state/context';

const AUTO_DISMISS_MS = 2500;

/**
 * Fixed-position toast notice driven by `state.toast` (set via the `SHOW_TOAST`
 * action from anywhere in the app). Auto-dismisses itself after `AUTO_DISMISS_MS`
 * and stays mounted (rather than unmounting) so its fade transition can play.
 */
export function Toast() {
  const { toast } = useAppState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  const visible = !!toast;

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 text-white text-xs px-4 py-2 rounded shadow-lg z-50 transition-[opacity,transform] duration-200 ${
        toast?.variant === 'error' ? 'bg-red-700' : 'bg-wp-bar'
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      {toast?.message ?? ''}
    </div>
  );
}
