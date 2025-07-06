import React from 'react';

const CyborgIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Cyborg head shape */}
    <path d="M12 2L4 8v8l8 6 8-6V8L12 2z" />
    {/* Eyes */}
    <circle cx="9" cy="10" r="1.5" fill={color} />
    <circle cx="15" cy="10" r="1.5" fill={color} />
    {/* Circuit lines */}
    <path d="M8 14h8" />
    <path d="M12 14v4" />
    <path d="M7 8l2-2" />
    <path d="M15 6l2 2" />
  </svg>
);

export default CyborgIcon; 