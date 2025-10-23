'use client';

import { useEffect } from 'react';

const HydrationBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Suppress hydration warnings caused by browser extensions
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Hydration failed') &&
        args[0].includes('cz-shortcut-listen')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
};

export default HydrationBoundary;
