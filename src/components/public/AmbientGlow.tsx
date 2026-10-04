import React from 'react';

export const AmbientGlow: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] sm:h-[800px] hero-ambient-glow opacity-80" />
    </div>
  );
};
