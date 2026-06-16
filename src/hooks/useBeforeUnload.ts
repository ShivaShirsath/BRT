import { useEffect } from 'react';

/**
 * Custom hook to show a confirmation dialog when the user tries to leave the page
 * or refresh the tab with unsaved changes.
 */
export function useBeforeUnload(enabled: boolean, message: string = "You have unsaved changes. Are you sure you want to leave?") {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, message]);
}
