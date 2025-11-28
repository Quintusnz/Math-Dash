'use client';

import { useState } from 'react';
import { copyToClipboard, generateQRCodeURL } from '@/lib/auth/play-code';
import { motion } from 'motion/react';
import { Copy, Check, Download, QrCode } from 'lucide-react';
import styles from './PlayCodeDisplay.module.css';

interface PlayCodeDisplayProps {
  code: string;
  playerName?: string;
  avatarId?: string;
  showQR?: boolean;
  compact?: boolean;
}

export function PlayCodeDisplay({ 
  code, 
  playerName,
  avatarId,
  showQR = true,
  compact = false 
}: PlayCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    const qrUrl = generateQRCodeURL(code, 400);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `math-dash-code-${code}.png`;
    link.click();
  };

  const qrCodeUrl = generateQRCodeURL(code, 200);

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <span className={styles.compactCode}>{code}</span>
        <button
          className={styles.compactCopyButton}
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.container}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      {/* Card Header */}
      {(playerName || avatarId) && (
        <div className={styles.cardHeader}>
          {avatarId && <span className={styles.avatar}>{avatarId}</span>}
          {playerName && <span className={styles.playerName}>{playerName}</span>}
        </div>
      )}

      {/* Code Display */}
      <div className={styles.codeSection}>
        <span className={styles.codeLabel}>Your Play Code</span>
        <div className={styles.codeDisplay}>
          <span className={styles.codePrefix}>DASH</span>
          <span className={styles.codeDash}>-</span>
          <span className={styles.codeValue}>{code.replace('DASH-', '')}</span>
        </div>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className={styles.qrSection}>
          <div className={styles.qrWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt={`QR code for ${code}`}
              width={140}
              height={140}
              className={styles.qrImage}
            />
          </div>
          <span className={styles.qrHint}>Scan to log in on another device</span>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${styles.primaryAction}`}
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy Code
            </>
          )}
        </button>

        <button
          className={styles.actionButton}
          onClick={handleDownloadQR}
          aria-label="Download QR code"
        >
          <Download size={18} />
          Save QR
        </button>
      </div>

      {/* Safety Reminder */}
      <div className={styles.reminder}>
        <span className={styles.reminderIcon}>💡</span>
        <p className={styles.reminderText}>
          Write this code down or ask a grown-up to save it. 
          You&apos;ll need it to play on other devices!
        </p>
      </div>
    </motion.div>
  );
}
