// src/components/AuthLoader.js
"use client";
import { useAuth } from '@/context/AuthContext';
import HRMSLoader from '@/components/common/HRMSLoader';

export default function AuthLoader({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <HRMSLoader text="Loading applicationddfs..." variant="fullscreen" size="md" />;
  }

  return children;
}