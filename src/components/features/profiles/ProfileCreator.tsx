'use client';

import { useState, useCallback } from 'react';
import { db, Profile } from '@/lib/db';
import { useUserStore } from '@/lib/stores/useUserStore';
import { generatePlayCode } from '@/lib/auth/play-code';
import { motion, AnimatePresence } from 'motion/react';
import { CountrySelector } from '@/components/features/curriculum/CountrySelector';
import { YearGradeSelector } from '@/components/features/curriculum/YearGradeSelector';
import { type CountryCode } from '@/lib/constants/curriculum-data';
import { trackCurriculumProfileSet } from '@/lib/analytics/curriculum-analytics';
import styles from './ProfileCreator.module.css';

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];

type WizardStep = 'basics' | 'curriculum';

export interface ProfileCreatorProps {
  onCreated?: () => void;
}

export function ProfileCreator({ onCreated }: ProfileCreatorProps) {
  // Wizard step state
  const [step, setStep] = useState<WizardStep>('basics');
  
  // Basic profile fields
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [ageBand, setAgeBand] = useState('6-7');
  
  // Curriculum fields
  const [country, setCountry] = useState<CountryCode | 'skip' | null>(null);
  const [yearGrade, setYearGrade] = useState<string | null>(null);
  
  const setActiveProfileId = useUserStore(state => state.setActiveProfileId);

  // Handle country change - reset yearGrade when country changes
  const handleCountryChange = useCallback((newCountry: CountryCode | 'skip') => {
    setCountry(newCountry);
    setYearGrade(null); // Reset year/grade when country changes
  }, []);

  // Navigate to next step
  const handleNext = () => {
    if (step === 'basics' && name.trim()) {
      setStep('curriculum');
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    if (step === 'curriculum') {
      setStep('basics');
    }
  };

  // Skip curriculum selection
  const handleSkipCurriculum = async () => {
    await createProfile(null, null);
  };

  // Create the profile
  const createProfile = async (
    selectedCountry: CountryCode | null,
    selectedYearGrade: string | null
  ) => {
    if (!name.trim()) return;

    const playCode = await generatePlayCode();
    
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      playCode,
      displayName: name,
      avatarId: avatar,
      ageBand,
      isGuest: false,
      classroomId: null,
      preferences: {
        theme: 'default',
        soundEnabled: true,
        hapticsEnabled: true
      },
      // Curriculum fields (optional)
      ...(selectedCountry && { country: selectedCountry }),
      ...(selectedYearGrade && { yearGrade: selectedYearGrade }),
      ...(selectedCountry && { curriculumLastUpdated: new Date().toISOString() }),
      syncStatus: 'local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.profiles.add(newProfile);
    setActiveProfileId(newProfile.id);
    setName('');
    onCreated?.();

    if (selectedCountry && selectedYearGrade) {
      trackCurriculumProfileSet(newProfile.id, {
        country: selectedCountry,
        yearGrade: selectedYearGrade,
        source: 'profile_creator',
        actionStage: 'setup',
      });
    }
  };

  // Final submit with curriculum
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'basics') {
      handleNext();
      return;
    }
    
    // Curriculum step - create profile with selected values
    const selectedCountry = country && country !== 'skip' ? country : null;
    await createProfile(selectedCountry, yearGrade);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <div className={`${styles.stepDot} ${step === 'basics' || step === 'curriculum' ? styles.active : ''}`} />
        <div className={styles.stepLine} />
        <div className={`${styles.stepDot} ${step === 'curriculum' ? styles.active : ''}`} />
      </div>

      <AnimatePresence mode="wait">
        {step === 'basics' && (
          <motion.div
            key="basics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={styles.stepContent}
          >
            <h2 className={styles.title}>Create New Profile</h2>
            
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Choose Avatar</label>
              <div className={styles.avatarGrid}>
                {AVATARS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`${styles.avatarBtn} ${avatar === a ? styles.selected : ''}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Age Group</label>
              <select 
                value={ageBand} 
                onChange={(e) => setAgeBand(e.target.value)}
                className={styles.select}
              >
                <option value="5-6">5-6 Years</option>
                <option value="6-7">6-7 Years</option>
                <option value="7-8">7-8 Years</option>
                <option value="8-9">8-9 Years</option>
                <option value="9-10">9-10 Years</option>
                <option value="10-11">10-11 Years</option>
                <option value="11-12">11-12 Years</option>
              </select>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className={styles.submitBtn}
              disabled={!name.trim()}
            >
              Next →
            </motion.button>
          </motion.div>
        )}

        {step === 'curriculum' && (
          <motion.div
            key="curriculum"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className={styles.stepContent}
          >
            <h2 className={styles.title}>Where are you learning?</h2>
            <p className={styles.subtitle}>
              This helps us show your progress against your school curriculum.
            </p>
            
            <div className={styles.field}>
              <label className={styles.label}>Select Your Country</label>
              <CountrySelector
                value={country}
                onChange={handleCountryChange}
              />
            </div>

            {country && country !== 'skip' && (
              <motion.div 
                className={styles.field}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <label className={styles.label}>Select Your Year/Grade</label>
                <YearGradeSelector
                  country={country}
                  value={yearGrade ?? undefined}
                  onChange={setYearGrade}
                  ageBand={ageBand}
                  autoSelect={true}
                />
              </motion.div>
            )}

            <div className={styles.buttonGroup}>
              <button 
                type="button"
                onClick={handleBack}
                className={styles.backBtn}
              >
                ← Back
              </button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className={styles.submitBtn}
                disabled={country !== 'skip' && (!country || !yearGrade)}
              >
                Start Adventure! 🚀
              </motion.button>
            </div>

            <button 
              type="button"
              onClick={handleSkipCurriculum}
              className={styles.skipBtn}
            >
              Skip for now – I&apos;ll set this up later
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
