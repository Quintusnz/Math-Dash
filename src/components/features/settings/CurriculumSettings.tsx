'use client';

import { useState, useCallback, useMemo } from 'react';
import { Globe, GraduationCap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, Profile } from '@/lib/db';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { CountrySelector } from '@/components/features/curriculum/CountrySelector';
import { YearGradeSelector } from '@/components/features/curriculum/YearGradeSelector';
import { useToast } from '@/components/ui/Toast';
import { type CountryCode } from '@/lib/constants/curriculum-data';
import { COUNTRY_METADATA } from '@/lib/constants/country-config';
import styles from './CurriculumSettings.module.css';

type EditingField = 'country' | 'yearGrade' | null;

/**
 * CurriculumSettings - Settings section for managing curriculum country and year/grade.
 * 
 * Displays current curriculum settings with the ability to edit them.
 * Changes are persisted immediately to the database.
 */
export function CurriculumSettings() {
  const { activeProfile, setActiveProfile, addDeviceProfile } = useProfileStore();
  const { showToast } = useToast();
  
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [pendingCountry, setPendingCountry] = useState<CountryCode | 'skip' | null>(null);
  const [pendingYearGrade, setPendingYearGrade] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get current values from profile
  const currentCountry = activeProfile?.country ?? null;
  const currentYearGrade = activeProfile?.yearGrade ?? null;

  // Get display values
  const countryMeta = currentCountry ? COUNTRY_METADATA[currentCountry] : null;
  const yearGradeLabel = useMemo(() => {
    if (!currentCountry || !currentYearGrade) return null;
    const option = countryMeta?.yearGradeOptions.find(opt => opt.key === currentYearGrade);
    return option?.label ?? currentYearGrade;
  }, [currentCountry, currentYearGrade, countryMeta]);

  // Handle starting to edit a field
  const handleStartEdit = useCallback((field: EditingField) => {
    setEditingField(field);
    if (field === 'country') {
      setPendingCountry(currentCountry);
    } else if (field === 'yearGrade') {
      setPendingYearGrade(currentYearGrade);
    }
  }, [currentCountry, currentYearGrade]);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setPendingCountry(null);
    setPendingYearGrade(null);
  }, []);

  // Handle country change
  const handleCountryChange = useCallback((country: CountryCode | 'skip') => {
    setPendingCountry(country);
  }, []);

  // Handle year/grade change
  const handleYearGradeChange = useCallback((yearGrade: string) => {
    setPendingYearGrade(yearGrade);
  }, []);

  // Save country change
  const handleSaveCountry = useCallback(async () => {
    if (!activeProfile || pendingCountry === null) return;
    
    setIsSaving(true);
    try {
      const effectiveCountry = pendingCountry === 'skip' ? undefined : pendingCountry;
      const updatedProfile: Profile = {
        ...activeProfile,
        country: effectiveCountry,
        // Reset year/grade when country changes
        yearGrade: undefined,
        curriculumLastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.profiles.update(activeProfile.id, {
        country: effectiveCountry,
        yearGrade: undefined,
        curriculumLastUpdated: updatedProfile.curriculumLastUpdated,
        updatedAt: updatedProfile.updatedAt,
      });

      setActiveProfile(updatedProfile);
      addDeviceProfile(updatedProfile);
      
      setEditingField(null);
      setPendingCountry(null);
      
      if (effectiveCountry) {
        showToast(`Country updated to ${COUNTRY_METADATA[effectiveCountry].label}`, 'success');
        // Open year/grade selector after country change
        setTimeout(() => handleStartEdit('yearGrade'), 300);
      } else {
        showToast('Curriculum settings cleared', 'info');
      }
    } catch (error) {
      console.error('Failed to save country:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [activeProfile, pendingCountry, setActiveProfile, addDeviceProfile, showToast, handleStartEdit]);

  // Save year/grade change
  const handleSaveYearGrade = useCallback(async () => {
    if (!activeProfile || !pendingYearGrade || !currentCountry) return;
    
    setIsSaving(true);
    try {
      const updatedProfile: Profile = {
        ...activeProfile,
        yearGrade: pendingYearGrade,
        curriculumLastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.profiles.update(activeProfile.id, {
        yearGrade: pendingYearGrade,
        curriculumLastUpdated: updatedProfile.curriculumLastUpdated,
        updatedAt: updatedProfile.updatedAt,
      });

      setActiveProfile(updatedProfile);
      addDeviceProfile(updatedProfile);
      
      setEditingField(null);
      setPendingYearGrade(null);
      
      const newLabel = COUNTRY_METADATA[currentCountry]?.yearGradeOptions.find(
        opt => opt.key === pendingYearGrade
      )?.label ?? pendingYearGrade;
      
      showToast(`Year/Grade updated to ${newLabel}`, 'success');
    } catch (error) {
      console.error('Failed to save year/grade:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [activeProfile, pendingYearGrade, currentCountry, setActiveProfile, addDeviceProfile, showToast]);

  // Handle setup prompt click
  const handleSetupClick = useCallback(() => {
    handleStartEdit('country');
  }, [handleStartEdit]);

  if (!activeProfile) {
    return null;
  }

  const hasNoCurriculum = !currentCountry && !currentYearGrade;

  return (
    <div className={styles.container}>
      {/* Info banner explaining why curriculum matters */}
      <div className={styles.infoBanner}>
        <AlertCircle size={16} className={styles.infoIcon} />
        <p className={styles.infoText}>
          Setting your country and year helps us show your progress against your school curriculum.
        </p>
      </div>

      {/* Not Set State */}
      {hasNoCurriculum && editingField === null && (
        <button 
          type="button"
          className={styles.setupPrompt}
          onClick={handleSetupClick}
        >
          <Globe size={24} className={styles.setupIcon} />
          <div className={styles.setupContent}>
            <span className={styles.setupLabel}>Curriculum not set</span>
            <span className={styles.setupHint}>Tap to set your country and year</span>
          </div>
          <span className={styles.setupArrow}>→</span>
        </button>
      )}

      {/* Display current settings (when not editing and curriculum is set) */}
      {!hasNoCurriculum && editingField === null && (
        <div className={styles.settingsList}>
          {/* Country Row */}
          <button 
            type="button"
            className={styles.settingRow}
            onClick={() => handleStartEdit('country')}
          >
            <div className={styles.settingIcon}>
              <Globe size={20} />
            </div>
            <div className={styles.settingContent}>
              <span className={styles.settingLabel}>Country</span>
              <span className={styles.settingValue}>
                {countryMeta ? `${countryMeta.flagEmoji} ${countryMeta.label}` : 'Not set'}
              </span>
            </div>
            <span className={styles.settingArrow}>Edit</span>
          </button>

          {/* Year/Grade Row - only show if country is set */}
          {currentCountry && (
            <button 
              type="button"
              className={styles.settingRow}
              onClick={() => handleStartEdit('yearGrade')}
            >
              <div className={styles.settingIcon}>
                <GraduationCap size={20} />
              </div>
              <div className={styles.settingContent}>
                <span className={styles.settingLabel}>
                  {countryMeta?.systemType === 'grade' ? 'Grade' : 'Year'}
                </span>
                <span className={styles.settingValue}>
                  {yearGradeLabel || 'Not set'}
                </span>
              </div>
              <span className={styles.settingArrow}>Edit</span>
            </button>
          )}
        </div>
      )}

      {/* Country Selector Modal/Inline */}
      <AnimatePresence>
        {editingField === 'country' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.editorContainer}
          >
            <div className={styles.editorHeader}>
              <h3 className={styles.editorTitle}>Select Your Country</h3>
              <button 
                type="button"
                onClick={handleCancelEdit}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
            
            <CountrySelector
              value={pendingCountry}
              onChange={handleCountryChange}
              className={styles.selector}
            />
            
            <div className={styles.editorActions}>
              <button
                type="button"
                onClick={handleSaveCountry}
                disabled={pendingCountry === null || isSaving}
                className={styles.saveButton}
              >
                {isSaving ? 'Saving...' : 'Save Country'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Year/Grade Selector Modal/Inline */}
      <AnimatePresence>
        {editingField === 'yearGrade' && currentCountry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.editorContainer}
          >
            <div className={styles.editorHeader}>
              <h3 className={styles.editorTitle}>
                Select Your {countryMeta?.systemType === 'grade' ? 'Grade' : 'Year'}
              </h3>
              <button 
                type="button"
                onClick={handleCancelEdit}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
            
            <YearGradeSelector
              country={currentCountry}
              value={pendingYearGrade}
              onChange={handleYearGradeChange}
              ageBand={activeProfile.ageBand}
              autoSelect={!currentYearGrade}
              className={styles.selector}
            />
            
            <div className={styles.editorActions}>
              <button
                type="button"
                onClick={handleSaveYearGrade}
                disabled={!pendingYearGrade || isSaving}
                className={styles.saveButton}
              >
                {isSaving ? 'Saving...' : 'Save Year/Grade'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
