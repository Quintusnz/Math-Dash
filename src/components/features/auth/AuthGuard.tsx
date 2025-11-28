'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { AuthFlow } from '@/components/features/auth';
import { Sparkles } from 'lucide-react';
import styles from './AuthGuard.module.css';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useProfileStore((state) => state.isAuthenticated);
  const authStep = useProfileStore((state) => state.authStep);
  const initialize = useProfileStore((state) => state.initialize);
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsInitialized(true);
    };
    init();
  }, [initialize]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className={styles.loading}>
        <Sparkles className={styles.loadingIcon} size={32} />
        <span>Loading...</span>
      </div>
    );
  }

  // If auth is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If authenticated, render children
  if (isAuthenticated && authStep === 'playing') {
    return <>{children}</>;
  }

  // Otherwise, show auth flow
  return <AuthFlow />;
}
