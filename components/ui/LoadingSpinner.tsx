import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-surface-100 via-surface-200 to-surface-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </main>
  );
};

export default LoadingSpinner;
