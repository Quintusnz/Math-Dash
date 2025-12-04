"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ChevronRight, Lightbulb } from "lucide-react";
import { Suggestion } from "@/lib/game-engine/topic-suggestions";
import styles from "./SuggestedPractice.module.css";

interface SuggestedPracticeProps {
  suggestions: Suggestion[];
  loading?: boolean;
}

// Build the URL for a suggestion
function buildSuggestionUrl(suggestion: Suggestion): string {
  const params = new URLSearchParams();
  
  if (suggestion.action.operations.length > 0) {
    params.set('ops', suggestion.action.operations.join(','));
  }
  
  if (suggestion.action.selectedNumbers && suggestion.action.selectedNumbers.length > 0) {
    params.set('nums', suggestion.action.selectedNumbers.join(','));
  }
  
  if (suggestion.action.rangePreset) {
    params.set('range', suggestion.action.rangePreset);
  }
  
  return `/play?${params.toString()}`;
}

export function SuggestedPractice({ 
  suggestions, 
  loading = false 
}: SuggestedPracticeProps) {

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Lightbulb size={20} className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>Suggested Practice</h3>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingPulse} />
          <span>Finding suggestions...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Lightbulb size={20} className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>Suggested Practice</h3>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎉</span>
          <p className={styles.emptyText}>
            You&apos;re doing great! Keep practicing to get personalized suggestions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Lightbulb size={20} className={styles.headerIcon} />
        <h3 className={styles.headerTitle}>Suggested Practice</h3>
      </div>
      
      <div className={styles.suggestions}>
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
          >
            <Link
              href={buildSuggestionUrl(suggestion)}
              className={styles.suggestionCard}
            >
              <div className={styles.suggestionIcon}>
                <span role="img" aria-hidden="true">{suggestion.icon}</span>
              </div>
              
              <div className={styles.suggestionContent}>
                <span className={styles.suggestionHeadline}>
                  {suggestion.headline}
                </span>
                <span className={styles.suggestionDescription}>
                  {suggestion.description}
                </span>
              </div>
              
              <div className={styles.suggestionAction}>
                <ChevronRight size={20} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
