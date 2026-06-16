import { useState, useEffect } from 'react';

/**
 * Hook to get the actual visual viewport height,
 * which adjusts when the mobile keyboard is shown.
 */
export function useViewport() {
  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      // visualViewport.height is the actual visible area excluding keyboard
      setViewportHeight(`${window.visualViewport!.height}px`);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.visualViewport!.removeEventListener('resize', handleResize);
    };
  }, []);

  return { viewportHeight };
}
