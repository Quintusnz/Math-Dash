'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/lib/hooks/useCurrency';
import styles from './LockedContentModal.module.css';

interface LockedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  operation?: string;
}

export function LockedContentModal({ 
  isOpen, 
  onClose, 
  title = 'Premium Content',
  description = 'Unlock all math content with a one-time purchase.',
  operation
}: LockedContentModalProps) {
  const [mounted, setMounted] = useState(false);
  const { corePricing } = useCurrency();

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <X size={24} />
            </button>

            <div className={styles.iconContainer}>
              <div className={styles.lockIcon}>
                <Lock size={32} />
              </div>
              <motion.div
                className={styles.sparkle}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={20} />
              </motion.div>
            </div>

            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✖️</span>
                <span>All times tables (×1 to ×12)</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>➗</span>
                <span>All division facts</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>➕</span>
                <span>Addition up to 100</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>➖</span>
                <span>Subtraction up to 100</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/grown-ups?tab=premium" className={styles.upgradeButton}>
                <Sparkles size={18} />
                Unlock for {corePricing.displayPrice}
              </Link>
              <button className={styles.laterButton} onClick={onClose}>
                Maybe Later
              </button>
            </div>

            <p className={styles.note}>
              One-time purchase • No subscription • Family-wide access
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to render outside of parent container hierarchy
  if (!mounted) return null;
  
  const portalTarget = document.getElementById('modal-root') || document.body;
  return createPortal(modalContent, portalTarget);
}
