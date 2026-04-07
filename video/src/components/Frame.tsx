import React from 'react';

export const Frame: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 80,
        boxSizing: 'border-box',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      }}
    >
      {children}
    </div>
  );
};
