"use client";

import {
  type CurriculumStatus,
  type SkillProgress
} from '@/lib/game-engine/curriculum-tracker';

export type CurriculumVariant = 'curriculum-default' | 'curriculum-a' | 'curriculum-b';

interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

const eventQueue: AnalyticsEvent[] = [];
const variantMap = new Map<string, CurriculumVariant>();

function hashProfileId(profileId: string): number {
  return profileId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildPayload(
  eventName: string,
  profileId: string,
  extraProps: Record<string, unknown>
): AnalyticsEvent {
  const variant = getCurriculumVariant(profileId);
  const payload: AnalyticsEvent = {
    eventName,
    timestamp: new Date().toISOString(),
    properties: {
      profileId,
      curriculumVariant: variant,
      ...extraProps,
    },
  };

  return payload;
}

function sendToAnalytics(payload: AnalyticsEvent) {
  eventQueue.push(payload);

  if (typeof window === 'undefined') {
    return;
  }

  const analyticsClient = (window as Window & { analytics?: { track?: (name: string, props?: Record<string, unknown>) => void } }).analytics;
  analyticsClient?.track?.(payload.eventName, payload.properties);
}

export function getAnalyticsQueue() {
  return [...eventQueue];
}

export function clearAnalyticsQueue() {
  eventQueue.length = 0;
}

export function getCurriculumVariant(profileId?: string): CurriculumVariant {
  if (!profileId) {
    return 'curriculum-default';
  }

  if (variantMap.has(profileId)) {
    return variantMap.get(profileId)!;
  }

  const override = typeof window !== 'undefined'
    ? window.localStorage?.getItem('curriculumVariantOverride')
    : null;

  if (override === 'A' || override === 'B') {
    const variant = override === 'A' ? 'curriculum-a' : 'curriculum-b';
    variantMap.set(profileId, variant);
    return variant;
  }

  const variant = hashProfileId(profileId) % 2 === 0 ? 'curriculum-a' : 'curriculum-b';
  variantMap.set(profileId, variant);
  return variant;
}

function trackEvent(eventName: string, profileId: string, props: Record<string, unknown>) {
  const payload = buildPayload(eventName, profileId, props);
  sendToAnalytics(payload);
}

interface ProfileSetProps {
  country?: string;
  yearGrade?: string;
  source?: 'profile_creator' | 'curriculum_settings' | 'curriculum_migration';
  actionStage?: 'setup' | 'migration' | 'update';
}

export function trackCurriculumProfileSet(profileId: string, props: ProfileSetProps) {
  trackEvent('curriculum_profile_set', profileId, props);
}

export function trackCurriculumProgressViewed(profileId: string, overallStatus: CurriculumStatus | null) {
  trackEvent('curriculum_progress_viewed', profileId, {
    overallStatus,
  });
}

export function trackCurriculumSkillDetailed(
  profileId: string,
  skillId: string,
  skillStatus: SkillProgress['proficiency']
) {
  trackEvent('curriculum_skill_detailed', profileId, {
    skillId,
    skillStatus,
  });
}

export function trackCurriculumRecommendationClicked(
  profileId: string,
  skillId: string,
  source: 'recommendation_panel' | 'progress_panel'
) {
  trackEvent('curriculum_recommendation_clicked', profileId, {
    skillId,
    source,
  });
}
