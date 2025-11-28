"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  NumberRange,
  RangePreset,
  NUMBER_RANGE_PRESETS,
} from "@/lib/stores/useGameStore";
import { usePremiumAccess } from "@/lib/hooks/usePremiumAccess";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { isRangePresetLocked, getPremiumDescription } from "@/lib/constants/content-access";
import { LockedContentModal } from "@/components/ui/LockedContentModal";
import { Star, Check, Settings2, X, Minus, Plus, Lock } from "lucide-react";
import styles from "./NumberRangeSelector.module.css";

interface NumberRangeSelectorProps {
  operation: "addition" | "subtraction";
  value: NumberRange;
  onChange: (range: NumberRange) => void;
}

interface PresetTileProps {
  preset: Exclude<RangePreset, "custom">;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
  operation: "addition" | "subtraction";
}

function PresetTile({
  preset,
  isSelected,
  isLocked,
  onSelect,
  operation,
}: PresetTileProps) {
  const config = NUMBER_RANGE_PRESETS[preset];

  // Generate example problems based on preset
  const getExamples = () => {
    const max = config.max;
    if (operation === "addition") {
      if (max <= 10) return ["7 + 3 = ?", "4 + 5 = ?"];
      if (max <= 20) return ["13 + 6 = ?", "8 + 9 = ?"];
      if (max <= 50) return ["34 + 15 = ?", "28 + 19 = ?"];
      return ["67 + 28 = ?", "45 + 37 = ?"];
    } else {
      if (max <= 10) return ["9 - 2 = ?", "8 - 5 = ?"];
      if (max <= 20) return ["17 - 8 = ?", "15 - 9 = ?"];
      if (max <= 50) return ["48 - 23 = ?", "41 - 17 = ?"];
      return ["91 - 54 = ?", "73 - 38 = ?"];
    }
  };

  const examples = getExamples();

  return (
    <motion.button
      className={`${styles.presetTile} ${isSelected ? styles.selected : ""} ${isLocked ? styles.locked : ""}`}
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-pressed={isSelected}
      aria-label={`${config.label} zone, numbers up to ${config.max}, ${isLocked ? "premium content - tap to unlock" : isSelected ? "currently selected" : ""}`}
    >
      {isSelected && !isLocked && (
        <motion.div
          className={styles.selectedBadge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Check size={16} strokeWidth={3} />
        </motion.div>
      )}
      
      {isLocked && (
        <motion.div
          className={styles.lockBadge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Lock size={14} strokeWidth={3} />
        </motion.div>
      )}

      <div className={styles.starRow}>
        {Array.from({ length: config.stars }).map((_, i) => (
          <Star
            key={i}
            size={16}
            fill="currentColor"
            className={styles.star}
          />
        ))}
      </div>

      <div className={`${styles.tileLabel} ${isLocked ? styles.lockedText : ""}`}>{config.label.toUpperCase()}</div>

      <div className={`${styles.rangeLabel} ${isLocked ? styles.lockedText : ""}`}>Up to {config.max}</div>

      <div className={styles.exampleList}>
        {examples.map((ex, i) => (
          <span key={i} className={`${styles.example} ${isLocked ? styles.lockedText : ""}`}>
            {ex}
          </span>
        ))}
      </div>

      <div className={`${styles.yearHint} ${isLocked ? styles.lockedText : ""}`}>{config.yearHint}</div>
    </motion.button>
  );
}

interface CustomRangePanelProps {
  isOpen: boolean;
  onClose: () => void;
  value: NumberRange;
  onChange: (range: NumberRange) => void;
  operation: "addition" | "subtraction";
}

function CustomRangePanel({
  isOpen,
  onClose,
  value,
  onChange,
  operation,
}: CustomRangePanelProps) {
  const [localMin, setLocalMin] = useState(value.min);
  const [localMax, setLocalMax] = useState(value.max);
  const [localMin2, setLocalMin2] = useState(value.min2 ?? value.min);
  const [localMax2, setLocalMax2] = useState(value.max2 ?? value.max);
  const [localRangeType, setLocalRangeType] = useState(value.rangeType);
  const [localAllowNegatives, setLocalAllowNegatives] = useState(
    value.allowNegatives
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate preview problems based on range type
  const getPreviewProblems = () => {
    const examples: string[] = [];
    
    if (localRangeType === 'operand') {
      // For operand mode, use separate ranges for each number
      const range1 = localMax - localMin;
      const range2 = localMax2 - localMin2;

      for (let i = 0; i < 3; i++) {
        const n1 = Math.floor(Math.random() * (range1 + 1)) + localMin;
        const n2 = Math.floor(Math.random() * (range2 + 1)) + localMin2;

        if (operation === "addition") {
          examples.push(`${n1} + ${n2} = ?`);
        } else {
          // For subtraction, ensure first number is larger if no negatives
          if (!localAllowNegatives && n1 < n2) {
            examples.push(`${n2} - ${n1} = ?`);
          } else {
            examples.push(`${n1} - ${n2} = ?`);
          }
        }
      }
    } else {
      // For answer mode, generate problems that result in answers within range
      for (let i = 0; i < 3; i++) {
        const answer = Math.floor(Math.random() * (localMax - localMin + 1)) + localMin;
        if (operation === "addition") {
          const n1 = Math.floor(Math.random() * (answer + 1));
          const n2 = answer - n1;
          examples.push(`${n1} + ${n2} = ?`);
        } else {
          const n2 = Math.floor(Math.random() * 20);
          const n1 = answer + n2;
          examples.push(`${n1} - ${n2} = ?`);
        }
      }
    }
    return examples;
  };

  const handleApply = () => {
    // Ensure min <= max for both ranges
    const finalMin = Math.min(localMin, localMax);
    const finalMax = Math.max(localMin, localMax);
    const finalMin2 = Math.min(localMin2, localMax2);
    const finalMax2 = Math.max(localMin2, localMax2);

    onChange({
      preset: "custom",
      min: finalMin,
      max: finalMax,
      min2: localRangeType === 'operand' ? finalMin2 : undefined,
      max2: localRangeType === 'operand' ? finalMax2 : undefined,
      rangeType: localRangeType,
      allowNegatives: localAllowNegatives,
    });
    onClose();
  };

  const handleReset = () => {
    // Reset to starter preset
    onChange({
      preset: "starter",
      min: 0,
      max: 10,
      rangeType: "operand",
      allowNegatives: false,
    });
    onClose();
  };

  const adjustValue = (setter: (val: number) => void, current: number, delta: number, min: number = 0, max: number = 100) => {
    const newVal = Math.max(min, Math.min(max, current + delta));
    setter(newVal);
  };

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className={styles.panelWrapper}>
            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Custom Range Settings</h3>
                <button
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Close panel"
                >
                  <X size={24} />
                </button>
              </div>

            <div className={styles.panelContent}>
              <div className={styles.section}>
                <label className={styles.sectionLabel}>What should the range apply to?</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="rangeType"
                      value="operand"
                      checked={localRangeType === "operand"}
                      onChange={() => setLocalRangeType("operand")}
                      className={styles.radioInput}
                    />
                    <div className={styles.radioContent}>
                      <span className={styles.radioTitle}>Numbers in the question</span>
                      <span className={styles.radioDescription}>
                        Set range for each number separately
                      </span>
                    </div>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="rangeType"
                      value="answer"
                      checked={localRangeType === "answer"}
                      onChange={() => setLocalRangeType("answer")}
                      className={styles.radioInput}
                    />
                    <div className={styles.radioContent}>
                      <span className={styles.radioTitle}>The answer</span>
                      <span className={styles.radioDescription}>
                        Answers will be between {localMin} and {localMax}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Show different UI based on range type */}
              {localRangeType === 'operand' ? (
                <>
                  {/* First Number Range */}
                  <div className={styles.section}>
                    <label className={styles.sectionLabel}>
                      First number range
                    </label>
                    <div className={styles.rangeInputs}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Min</label>
                        <div className={styles.stepperRow}>
                          <button
                            className={styles.stepperButton}
                            onClick={() => adjustValue(setLocalMin, localMin, -5)}
                            disabled={localMin <= 0}
                            aria-label="Decrease minimum by 5"
                          >
                            <Minus size={18} />
                          </button>
                          <input
                            type="number"
                            className={styles.numberInput}
                            value={localMin}
                            onChange={(e) =>
                              setLocalMin(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))
                            }
                            min={0}
                            max={99}
                          />
                          <button
                            className={styles.stepperButton}
                            onClick={() => adjustValue(setLocalMin, localMin, 5)}
                            disabled={localMin >= 99}
                            aria-label="Increase minimum by 5"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Max</label>
                        <div className={styles.stepperRow}>
                          <button
                            className={styles.stepperButton}
                            onClick={() => adjustValue(setLocalMax, localMax, -5, 1)}
                            disabled={localMax <= 1}
                            aria-label="Decrease maximum by 5"
                          >
                            <Minus size={18} />
                          </button>
                          <input
                            type="number"
                            className={styles.numberInput}
                            value={localMax}
                            onChange={(e) =>
                              setLocalMax(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
                            }
                            min={1}
                            max={100}
                          />
                          <button
                            className={styles.stepperButton}
                            onClick={() => adjustValue(setLocalMax, localMax, 5, 1)}
                            disabled={localMax >= 100}
                            aria-label="Increase maximum by 5"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second Number Range */}
                  <div className={styles.section}>
                    <label className={styles.sectionLabel}>
                      Second number range
                    </label>
                    <div className={styles.rangeInputs}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Min</label>
                        <div className={styles.stepperRow}>
                          <button
                            className={styles.stepperButton}
                            onClick={() => adjustValue(setLocalMin2, localMin2, -5)}
                            disabled={localMin2 <= 0}
                            aria-label="Decrease minimum by 5"
                          >
                            <Minus size={18} />
                          </button>
                          <input
                            type="number"
                            className={styles.numberInput}
                            value={localMin2}
                            onChange={(e) =>
                              setLocalMin2(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))
                            }
                            min={0}
                            max={99}
                          />
                          <button
                            className={styles.stepperButton}
                            onClick={() => adjustValue(setLocalMin2, localMin2, 5)}
                            disabled={localMin2 >= 99}
                            aria-label="Increase minimum by 5"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Max</label>
                        <div className={styles.stepperRow}>
                          <button
                            className={styles.stepperButton}
                            onClick={() => adjustValue(setLocalMax2, localMax2, -5, 1)}
                            disabled={localMax2 <= 1}
                            aria-label="Decrease maximum by 5"
                          >
                            <Minus size={18} />
                          </button>
                          <input
                            type="number"
                            className={styles.numberInput}
                            value={localMax2}
                            onChange={(e) =>
                              setLocalMax2(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
                            }
                            min={1}
                            max={100}
                          />
                          <button
                            className={styles.stepperButton}
                            onClick={() => adjustValue(setLocalMax2, localMax2, 5, 1)}
                            disabled={localMax2 >= 100}
                            aria-label="Increase maximum by 5"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Answer Range - single range */
                <div className={styles.section}>
                  <label className={styles.sectionLabel}>
                    Answer range
                  </label>
                  <div className={styles.rangeInputs}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Min</label>
                      <div className={styles.stepperRow}>
                        <button
                          className={styles.stepperButton}
                          onClick={() => adjustValue(setLocalMin, localMin, -5)}
                          disabled={localMin <= 0}
                          aria-label="Decrease minimum by 5"
                        >
                          <Minus size={18} />
                        </button>
                        <input
                          type="number"
                          className={styles.numberInput}
                          value={localMin}
                          onChange={(e) =>
                            setLocalMin(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))
                          }
                          min={0}
                          max={99}
                        />
                        <button
                          className={styles.stepperButton}
                          onClick={() => adjustValue(setLocalMin, localMin, 5)}
                          disabled={localMin >= 99}
                          aria-label="Increase minimum by 5"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Max</label>
                      <div className={styles.stepperRow}>
                        <button
                          className={styles.stepperButton}
                          onClick={() => adjustValue(setLocalMax, localMax, -5, 1)}
                          disabled={localMax <= 1}
                          aria-label="Decrease maximum by 5"
                        >
                          <Minus size={18} />
                        </button>
                        <input
                          type="number"
                          className={styles.numberInput}
                          value={localMax}
                          onChange={(e) =>
                            setLocalMax(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
                          }
                          min={1}
                          max={100}
                        />
                        <button
                          className={styles.stepperButton}
                          onClick={() => adjustValue(setLocalMax, localMax, 5, 1)}
                          disabled={localMax >= 100}
                          aria-label="Increase maximum by 5"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {operation === "subtraction" && localRangeType === 'operand' && (
                <div className={styles.section}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={!localAllowNegatives}
                      onChange={(e) => setLocalAllowNegatives(!e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxText}>
                      No negative answers
                    </span>
                  </label>
                </div>
              )}

              <div className={styles.previewSection}>
                <label className={styles.sectionLabel}>Preview problems:</label>
                <div className={styles.previewProblems}>
                  {getPreviewProblems().map((problem, i) => (
                    <span key={i} className={styles.previewProblem}>
                      {problem}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.panelActions}>
              <button className={styles.applyButton} onClick={handleApply}>
                Apply
              </button>
              <button className={styles.resetButton} onClick={handleReset}>
                Reset
              </button>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to render outside of parent container hierarchy
  if (!mounted) return null;
  
  const portalTarget = document.getElementById('modal-root') || document.body;
  return createPortal(panelContent, portalTarget);
}

export function NumberRangeSelector({
  operation,
  value,
  onChange,
}: NumberRangeSelectorProps) {
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const { isPremium } = usePremiumAccess();
  const { corePricing } = useCurrency();

  const presets: Exclude<RangePreset, "custom">[] = [
    "starter",
    "builder",
    "challenge",
    "pro",
  ];

  const handlePresetSelect = (preset: Exclude<RangePreset, "custom">) => {
    // Check if preset is locked
    if (isRangePresetLocked(preset, isPremium)) {
      setShowLockedModal(true);
      return;
    }
    
    const config = NUMBER_RANGE_PRESETS[preset];
    onChange({
      preset,
      min: config.min,
      max: config.max,
      rangeType: "operand",
      allowNegatives: false,
    });
  };
  
  const handleCustomPanelOpen = () => {
    // Custom panel is premium-only
    if (!isPremium) {
      setShowLockedModal(true);
      return;
    }
    setShowCustomPanel(true);
  };

  const isPresetSelected = (preset: Exclude<RangePreset, "custom">) => {
    return value.preset === preset;
  };

  return (
    <div className={styles.container}>
      <div className={styles.presetGrid}>
        {presets.map((preset) => (
          <PresetTile
            key={preset}
            preset={preset}
            isSelected={isPresetSelected(preset)}
            isLocked={isRangePresetLocked(preset, isPremium)}
            onSelect={() => handlePresetSelect(preset)}
            operation={operation}
          />
        ))}
      </div>

      {value.preset === "custom" && (
        <div className={styles.customIndicator}>
          <span className={styles.customLabel}>
            {value.rangeType === 'operand' 
              ? `Custom: (${value.min} to ${value.max}) ${operation === 'addition' ? '+' : '−'} (${value.min2 ?? value.min} to ${value.max2 ?? value.max})`
              : `Custom: answers ${value.min} to ${value.max}`
            }
          </span>
          <button
            className={styles.editButton}
            onClick={() => setShowCustomPanel(true)}
          >
            Edit
          </button>
        </div>
      )}

      {/* Show unlock prompt for free users, custom range button for premium */}
      {isPremium ? (
        <button
          className={styles.moreOptionsButton}
          onClick={handleCustomPanelOpen}
          aria-label="Open custom range settings"
        >
          <Settings2 size={16} />
          <span>Custom Range</span>
        </button>
      ) : (
        <button
          className={styles.unlockButton}
          onClick={() => setShowLockedModal(true)}
          aria-label="Unlock all number zones"
        >
          <Lock size={16} />
          <span>Unlock All Zones</span>
          <span className={styles.unlockPrice}>{corePricing.displayPrice}</span>
        </button>
      )}

      <CustomRangePanel
        isOpen={showCustomPanel}
        onClose={() => setShowCustomPanel(false)}
        value={value}
        onChange={onChange}
        operation={operation}
      />
      
      <LockedContentModal
        isOpen={showLockedModal}
        onClose={() => setShowLockedModal(false)}
        title="Premium Content"
        description={getPremiumDescription(operation)}
        operation={operation}
      />
    </div>
  );
}
