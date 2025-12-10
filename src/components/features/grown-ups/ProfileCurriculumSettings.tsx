'use client';

import { useState, useCallback, useMemo } from 'react';
import { Globe, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, Profile } from '@/lib/db';
import { CountrySelector } from '@/components/features/curriculum/CountrySelector';
import { YearGradeSelector } from '@/components/features/curriculum/YearGradeSelector';
import { useToast } from '@/components/ui/Toast';
import { type CountryCode } from '@/lib/constants/curriculum-data';
import { COUNTRY_METADATA } from '@/lib/constants/country-config';
import { trackCurriculumProfileSet } from '@/lib/analytics/curriculum-analytics';
import styles from './ProfileCurriculumSettings.module.css';

interface ProfileCurriculumSettingsProps {
  profiles: Profile[];
  onProfileUpdated?: (profile: Profile) => void;
}

type EditingState = {
  profileId: string;
  field: 'country' | 'yearGrade';
} | null;

/**
 * ProfileCurriculumSettings - Per-profile curriculum settings for the Grown-Ups dashboard.
 * 
 * Displays all profiles with their curriculum settings, allowing parents to
 * configure country and year/grade for each child.
 */
export function ProfileCurriculumSettings({ profiles, onProfileUpdated }: ProfileCurriculumSettingsProps) {
  const { showToast } = useToast();
  
  const [editingState, setEditingState] = useState<EditingState>(null);
  const [pendingCountry, setPendingCountry] = useState<CountryCode | 'skip' | null>(null);
  const [pendingYearGrade, setPendingYearGrade] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);

  // Handle starting to edit a field
  const handleStartEdit = useCallback((profileId: string, field: 'country' | 'yearGrade') => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    setEditingState({ profileId, field });
    setExpandedProfileId(profileId);
    
    if (field === 'country') {
      setPendingCountry(profile.country ?? null);
    } else if (field === 'yearGrade') {
      setPendingYearGrade(profile.yearGrade ?? null);
    }
  }, [profiles]);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setEditingState(null);
    setPendingCountry(null);
    setPendingYearGrade(null);
  }, []);

  // Toggle profile expansion
  const handleToggleExpand = useCallback((profileId: string) => {
    setExpandedProfileId(prev => prev === profileId ? null : profileId);
    // Close any active editing when collapsing
    if (expandedProfileId === profileId) {
      handleCancelEdit();
    }
  }, [expandedProfileId, handleCancelEdit]);

  // Save country change
  const handleSaveCountry = useCallback(async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile || pendingCountry === null) return;
    
    setIsSaving(true);
    try {
      const effectiveCountry = pendingCountry === 'skip' ? undefined : pendingCountry;
      const updatedProfile: Profile = {
        ...profile,
        country: effectiveCountry,
        // Reset year/grade when country changes
        yearGrade: undefined,
        curriculumLastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.profiles.update(profileId, {
        country: effectiveCountry,
        yearGrade: undefined,
        curriculumLastUpdated: updatedProfile.curriculumLastUpdated,
        updatedAt: updatedProfile.updatedAt,
      });

      trackCurriculumProfileSet(profileId, {
        country: effectiveCountry ?? undefined,
        yearGrade: undefined,
        source: 'curriculum_settings',
        actionStage: 'migration',
      });

      onProfileUpdated?.(updatedProfile);
      
      setEditingState(null);
      setPendingCountry(null);
      
      if (effectiveCountry) {
        showToast(`${profile.displayName}'s country updated`, 'success');
        // Open year/grade selector after country change
        setTimeout(() => handleStartEdit(profileId, 'yearGrade'), 300);
      } else {
        showToast(`${profile.displayName}'s curriculum cleared`, 'info');
      }
    } catch (error) {
      console.error('Failed to save country:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [profiles, pendingCountry, onProfileUpdated, showToast, handleStartEdit]);

  // Save year/grade change
  const handleSaveYearGrade = useCallback(async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile || !pendingYearGrade || !profile.country) return;
    
    setIsSaving(true);
    try {
      const updatedProfile: Profile = {
        ...profile,
        yearGrade: pendingYearGrade,
        curriculumLastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.profiles.update(profileId, {
        yearGrade: pendingYearGrade,
        curriculumLastUpdated: updatedProfile.curriculumLastUpdated,
        updatedAt: updatedProfile.updatedAt,
      });

      trackCurriculumProfileSet(profileId, {
        country: profile.country,
        yearGrade: pendingYearGrade,
        source: 'curriculum_settings',
        actionStage: profile.yearGrade ? 'update' : 'migration',
      });

      onProfileUpdated?.(updatedProfile);
      
      setEditingState(null);
      setPendingYearGrade(null);
      
      const newLabel = COUNTRY_METADATA[profile.country]?.yearGradeOptions.find(
        opt => opt.key === pendingYearGrade
      )?.label ?? pendingYearGrade;
      
      showToast(`${profile.displayName}'s year updated to ${newLabel}`, 'success');
    } catch (error) {
      console.error('Failed to save year/grade:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [profiles, pendingYearGrade, onProfileUpdated, showToast]);

  if (!profiles || profiles.length === 0) {
    return (
      <div className={styles.emptyState}>
        No profiles found. Create one in the Profiles tab.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.description}>
        Set each child&apos;s country and year level to track progress against their school curriculum.
      </p>
      
      <div className={styles.profileList}>
        {profiles.map(profile => {
          const countryMeta = profile.country ? COUNTRY_METADATA[profile.country] : null;
          const yearGradeLabel = profile.country && profile.yearGrade
            ? countryMeta?.yearGradeOptions.find(opt => opt.key === profile.yearGrade)?.label
            : null;
          const isExpanded = expandedProfileId === profile.id;
          const isEditingThisProfile = editingState?.profileId === profile.id;
          
          return (
            <div key={profile.id} className={styles.profileCard}>
              {/* Profile Header */}
              <button 
                type="button"
                className={styles.profileHeader}
                onClick={() => handleToggleExpand(profile.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.profileInfo}>
                  <span className={styles.avatar}>{profile.avatarId}</span>
                  <div className={styles.profileText}>
                    <span className={styles.profileName}>{profile.displayName}</span>
                    <span className={styles.profileSummary}>
                      {countryMeta && yearGradeLabel 
                        ? `${countryMeta.flagEmoji} ${yearGradeLabel}`
                        : countryMeta 
                          ? `${countryMeta.flagEmoji} ${countryMeta.label} (year not set)`
                          : 'Curriculum not set'}
                    </span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={styles.expandedContent}
                  >
                    <div className={styles.settingsGrid}>
                      {/* Country Setting */}
                      <div className={styles.settingItem}>
                        <div className={styles.settingHeader}>
                          <Globe size={18} className={styles.settingIcon} />
                          <span className={styles.settingLabel}>Country</span>
                        </div>
                        
                        {isEditingThisProfile && editingState.field === 'country' ? (
                          <div className={styles.editPanel}>
                            <CountrySelector
                              value={pendingCountry}
                              onChange={setPendingCountry}
                              className={styles.selector}
                            />
                            <div className={styles.editActions}>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className={styles.cancelBtn}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveCountry(profile.id)}
                                disabled={pendingCountry === null || isSaving}
                                className={styles.saveBtn}
                              >
                                {isSaving ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(profile.id, 'country')}
                            className={styles.settingValue}
                          >
                            {countryMeta 
                              ? `${countryMeta.flagEmoji} ${countryMeta.label}`
                              : 'Not set - tap to configure'}
                            <span className={styles.editHint}>Edit</span>
                          </button>
                        )}
                      </div>

                      {/* Year/Grade Setting - only show if country is set */}
                      {profile.country && (
                        <div className={styles.settingItem}>
                          <div className={styles.settingHeader}>
                            <GraduationCap size={18} className={styles.settingIcon} />
                            <span className={styles.settingLabel}>
                              {countryMeta?.systemType === 'grade' ? 'Grade' : 'Year'}
                            </span>
                          </div>
                          
                          {isEditingThisProfile && editingState.field === 'yearGrade' ? (
                            <div className={styles.editPanel}>
                              <YearGradeSelector
                                country={profile.country}
                                value={pendingYearGrade ?? undefined}
                                onChange={setPendingYearGrade}
                                ageBand={profile.ageBand}
                                autoSelect={!profile.yearGrade}
                                className={styles.selector}
                              />
                              <div className={styles.editActions}>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className={styles.cancelBtn}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveYearGrade(profile.id)}
                                  disabled={!pendingYearGrade || isSaving}
                                  className={styles.saveBtn}
                                >
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(profile.id, 'yearGrade')}
                              className={styles.settingValue}
                            >
                              {yearGradeLabel || 'Not set - tap to configure'}
                              <span className={styles.editHint}>Edit</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
