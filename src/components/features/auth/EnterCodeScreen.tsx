'use client';

import { useState, useRef, useEffect } from 'react';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { db } from '@/lib/db';
import { isValidCodeFormat, normalizeCode, getProfileByCode } from '@/lib/auth/play-code';
import { motion } from 'motion/react';
import { ArrowLeft, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import styles from './EnterCodeScreen.module.css';

export function EnterCodeScreen() {
  const { setAuthStep, setActiveProfile, addDeviceProfile } = useProfileStore();
  
  const [codeDigits, setCodeDigits] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow alphanumeric
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (cleaned.length <= 1) {
      const newDigits = [...codeDigits];
      newDigits[index] = cleaned;
      setCodeDigits(newDigits);
      setError(null);

      // Auto-advance to next input
      if (cleaned && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all filled
      if (cleaned && index === 3) {
        const fullCode = `DASH-${newDigits.join('')}`;
        if (isValidCodeFormat(fullCode)) {
          handleSubmit(fullCode);
        }
      }
    } else if (cleaned.length > 1) {
      // Handle paste of multiple characters
      const chars = cleaned.slice(0, 4 - index).split('');
      const newDigits = [...codeDigits];
      chars.forEach((char, i) => {
        if (index + i < 4) {
          newDigits[index + i] = char;
        }
      });
      setCodeDigits(newDigits);

      // Focus appropriate input
      const nextIndex = Math.min(index + chars.length, 3);
      inputRefs.current[nextIndex]?.focus();

      // Auto-submit if complete
      if (newDigits.every(d => d)) {
        const fullCode = `DASH-${newDigits.join('')}`;
        if (isValidCodeFormat(fullCode)) {
          handleSubmit(fullCode);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase();
    
    // Handle full code paste (DASH-XXXX)
    let code = pasted;
    if (pasted.startsWith('DASH-')) {
      code = pasted.substring(5);
    }
    
    const cleaned = code.replace(/[^A-Z0-9]/g, '').slice(0, 4);
    const chars = cleaned.split('');
    
    const newDigits = ['', '', '', ''];
    chars.forEach((char, i) => {
      newDigits[i] = char;
    });
    setCodeDigits(newDigits);

    // Focus last filled or next empty
    const nextIndex = Math.min(chars.length, 3);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if complete
    if (newDigits.every(d => d)) {
      const fullCode = `DASH-${newDigits.join('')}`;
      handleSubmit(fullCode);
    }
  };

  const handleSubmit = async (code?: string) => {
    const fullCode = code || `DASH-${codeDigits.join('')}`;
    
    if (!isValidCodeFormat(fullCode)) {
      setError('Please enter all 4 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = await getProfileByCode(fullCode);

      if (profile) {
        // Save to device
        await db.profiles.put(profile);
        
        // Update device settings
        await db.deviceSettings.put({
          id: 'default',
          lastActivePlayCode: profile.playCode,
          requireCodeToSwitch: false,
          updatedAt: new Date().toISOString(),
        });

        addDeviceProfile(profile);
        setActiveProfile(profile);
      } else {
        setError("We couldn't find that code. Please check and try again.");
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Error validating code:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setAuthStep('welcome');
  };

  const isComplete = codeDigits.every(d => d);

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button 
        className={styles.backButton}
        onClick={handleBack}
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <KeyRound size={40} strokeWidth={2} />
        </div>
        <h2 className={styles.title}>Enter Your Code</h2>
        <p className={styles.subtitle}>
          Type in your special Play Code to continue your adventure!
        </p>
      </div>

      {/* Code Input */}
      <div className={styles.codeInputWrapper}>
        <span className={styles.prefix}>DASH</span>
        <span className={styles.dash}>-</span>
        <div className={styles.digitInputs}>
          {codeDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`${styles.digitInput} ${digit ? styles.filled : ''} ${error ? styles.error : ''}`}
              disabled={isLoading}
              aria-label={`Code digit ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className={styles.errorMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        className={styles.submitButton}
        onClick={() => handleSubmit()}
        disabled={!isComplete || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className={styles.spinner} />
            Checking...
          </>
        ) : (
          <>Let&apos;s Go!</>
        )}
      </button>

      {/* Help Text */}
      <p className={styles.helpText}>
        Your code looks like <strong>DASH-X7K9</strong>
        <br />
        Ask a grown-up if you can&apos;t find it!
      </p>
    </div>
  );
}
