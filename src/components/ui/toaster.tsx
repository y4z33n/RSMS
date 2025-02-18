'use client';

import { Toaster as ToasterProvider } from 'react-hot-toast';

export function Toaster() {
  return (
    <ToasterProvider
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: '#059669',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#DC2626',
          },
        },
      }}
    />
  );
} 