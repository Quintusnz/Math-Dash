'use client';

import { useEffect } from 'react';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { WelcomeScreen } from './WelcomeScreen';
import { CreatePlayerFlow } from './CreatePlayerFlow';
import { EnterCodeScreen } from './EnterCodeScreen';
import { ProfileSelector } from './ProfileSelector';
import { AnimatePresence, motion } from 'motion/react';
import styles from './AuthFlow.module.css';

export function AuthFlow() {
  const { authStep, initialize } = useProfileStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const renderStep = () => {
    switch (authStep) {
      case 'welcome':
        return <WelcomeScreen key="welcome" />;
      
      case 'create-name':
      case 'create-avatar':
      case 'create-age':
      case 'create-code':
        return <CreatePlayerFlow key="create" />;
      
      case 'enter-code':
        return <EnterCodeScreen key="enter-code" />;
      
      case 'profile-select':
        return <ProfileSelector key="profile-select" />;
      
      case 'playing':
        return null; // Will be handled by parent
      
      default:
        return <WelcomeScreen key="welcome-default" />;
    }
  };

  // Get a stable key for animation - group all create steps together
  const getAnimationKey = () => {
    if (['create-name', 'create-avatar', 'create-age', 'create-code'].includes(authStep)) {
      return 'create-flow';
    }
    return authStep;
  };

  if (authStep === 'playing') {
    return null;
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={getAnimationKey()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={styles.content}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
