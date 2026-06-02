import { useEffect, useState } from "react";
import { triggerSync } from "../api/syncEngine";

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Thundering Herd Protection: Wait for a random jitter between 0 and 5 seconds
      const jitterMs = Math.random() * 5000;
      console.log(`Connection recovered! Scheduling background sync in ${(jitterMs / 1000).toFixed(2)}s (jitter)...`);
      
      const timer = setTimeout(() => {
        triggerSync().catch(console.error);
      }, jitterMs);

      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("Connection lost! Entered offline mode.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial sync check on mount if online
    if (navigator.onLine) {
      triggerSync().catch(console.error);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
