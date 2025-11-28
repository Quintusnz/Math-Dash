'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { AuthFlow } from '@/components/features/auth';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, authStep, initialize } = useProfileStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated && authStep === 'playing') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authStep, router]);

  if (isAuthenticated && authStep === 'playing') {
    return null; // Will redirect
  }

  return <AuthFlow />;
}
