import { useEffect, useState } from 'react';

export function useVisitCounter() {
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    const storageKey = 'portfolio-visit-ledger';
    const sessionKey = 'portfolio-visit-counted';
    let timeout: number | null = null;
    const updateCount = (count: number) => {
      timeout = window.setTimeout(() => setVisitCount(count), 0);
    };

    try {
      const storedCount = Number.parseInt(window.localStorage.getItem(storageKey) ?? '0', 10);
      const currentCount = Number.isFinite(storedCount) ? Math.max(0, storedCount) : 0;
      const hasCountedThisSession = window.sessionStorage.getItem(sessionKey) === 'true';
      const nextCount = hasCountedThisSession ? currentCount || 1 : Math.min(currentCount + 1, 999);

      if (!hasCountedThisSession) {
        window.localStorage.setItem(storageKey, String(nextCount));
        window.sessionStorage.setItem(sessionKey, 'true');
      }

      updateCount(nextCount);
    } catch {
      updateCount(1);
    }

    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, []);

  return visitCount;
}
