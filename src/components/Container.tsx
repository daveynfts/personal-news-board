import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
  style?: React.CSSProperties;
}

export default function Container({ children, className = '', size = 'default', style }: ContainerProps) {
  const maxWidth = size === 'wide' ? '1440px' : size === 'narrow' ? '1000px' : '1300px';

  return (
    <div 
      className={`app-container ${className}`}
      style={{ 
        maxWidth,
        margin: '0 auto',
        padding: '0 24px',
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  );
}
