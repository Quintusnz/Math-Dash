"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  NumberRange,
  RangePreset,
  NUMBER_RANGE_PRESETS,
} from "@/lib/stores/useGameStore";
import { Star, Check, Settings2, X, Minus, Plus } from "lucide-react";
import styles from "./NumberRangeSelector.module.css";

interface NumberRangeSelectorProps {
  operation: "addition" | "subtraction";
  value: NumberRange;
  onChange: (range: NumberRange) => void;
}

interface PresetTileProps {
  preset: Exclude<RangePreset, "custom">;
  isSelected: boolean;
  onSelect: () => void;
  operation: "addition" | "subtraction";
}

function PresetTile({
  preset,
  isSelected,
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
      className={`${styles.presetTile} ${isSelected ? styles.selected : ""}`}
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-pressed={isSelected}
      aria-label={`${config.label} zone, numbers up to ${config.max}, ${isSelected ? "currently selected" : ""}`}
    >
      {isSelected && (
        <motion.div
          className={styles.selectedBadge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Check size={16} strokeWidth={3} />
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

      <div className={styles.tileLabel}>{config.label.toUpperCase()}</div>

      <div className={styles.rangeLabel}>Up to {config.max}</div>

      <div className={styles.exampleList}>
        {examples.map((ex, i) => (
          <span key={i} className={styles.example}>
            {ex}
          </span>
        ))}
      </div>

      <div className={styles.yearHint}>{config.yearHint}</div>
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
  const [localRangeType, setLocalRangeType] = useState(value.rangeType);
  const [localAllowNegatives, setLocalAllowNegatives] = useState(
    value.allowNegatives
  );

  // Generate preview problems
  const getPreviewProblems = () => {
    const examples: string[] = [];
    const range = localMax - localMin;

    for (let i = 0; i < 3; i++) {
      const n1 = Math.floor(Math.random() * range) + localMin;
      const n2 = Math.floor(Math.random() * range) + localMin;

      if (operation === "addition") {
        examples.push(`${n1} + ${n2} = ?`);
      } else {
        const bigger = Math.max(n1, n2);
        const smaller = Math.min(n1, n2);
        examples.push(`${bigger} - ${smaller} = ?`);
      }
    }
    return examples;
  };

  const handleApply = () => {
    // Ensure min <= max
    const finalMin = Math.min(localMin, localMax);
    const finalMax = Math.max(localMin, localMax);

    onChange({
      preset: "custom",
      min: finalMin,
      max: finalMax,
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

  const adjustMin = (delta: number) => {
    const newVal = Math.max(0, Math.min(99, localMin + delta));
    setLocalMin(newVal);
  };

  const adjustMax = (delta: number) => {
    const newVal = Math.max(1, Math.min(100, localMax + delta));
    setLocalMax(newVal);
  };

  return (
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
          <motion.div
            className={styles.panel}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
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
                <label className={styles.sectionLabel}>Range Type</label>
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
                    <span className={styles.radioText}>
                      Operand range (each number is 0–X)
                    </span>
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
                    <span className={styles.radioText}>
                      Answer range (results are 0–X)
                    </span>
                  </label>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.rangeInputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Minimum Value</label>
                  <div className={styles.stepperRow}>
                    <button
                      className={styles.stepperButton}
                      onClick={() => adjustMin(-5)}
                      disabled={localMin <= 0}
                      aria-label="Decrease minimum by 5"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={localMin}
                      onChange={(e) =>
                        setLocalMin(
                          Math.max(0, Math.min(99, parseInt(e.target.value) || 0))
                        )
                      }
                      min={0}
                      max={99}
                    />
                    <button
                      className={styles.stepperButton}
                      onClick={() => adjustMin(5)}
                      disabled={localMin >= 99}
                      aria-label="Increase minimum by 5"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Maximum Value</label>
                  <div className={styles.stepperRow}>
                    <button
                      className={styles.stepperButton}
                      onClick={() => adjustMax(-5)}
                      disabled={localMax <= 1}
                      aria-label="Decrease maximum by 5"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={localMax}
                      onChange={(e) =>
                        setLocalMax(
                          Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                        )
                      }
                      min={1}
                      max={100}
                    />
                    <button
                      className={styles.stepperButton}
                      onClick={() => adjustMax(5)}
                      disabled={localMax >= 100}
                      aria-label="Increase maximum by 5"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.divider} />

              {operation === "subtraction" && (
                <div className={styles.section}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={!localAllowNegatives}
                      onChange={(e) => setLocalAllowNegatives(!e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxText}>
                      No negative results in subtraction
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
                Apply Custom Range
              </button>
              <button className={styles.resetButton} onClick={handleReset}>
                Reset to Presets
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function NumberRangeSelector({
  operation,
  value,
  onChange,
}: NumberRangeSelectorProps) {
  const [showCustomPanel, setShowCustomPanel] = useState(false);

  const presets: Exclude<RangePreset, "custom">[] = [
    "starter",
    "builder",
    "challenge",
    "pro",
  ];

  const handlePresetSelect = (preset: Exclude<RangePreset, "custom">) => {
    const config = NUMBER_RANGE_PRESETS[preset];
    onChange({
      preset,
      min: config.min,
      max: config.max,
      rangeType: "operand",
      allowNegatives: false,
    });
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
            onSelect={() => handlePresetSelect(preset)}
            operation={operation}
          />
        ))}
      </div>

      {value.preset === "custom" && (
        <div className={styles.customIndicator}>
          <span className={styles.customLabel}>
            Custom: {value.min}–{value.max} ({value.rangeType})
          </span>
          <button
            className={styles.editButton}
            onClick={() => setShowCustomPanel(true)}
          >
            Edit
          </button>
        </div>
      )}

      <button
        className={styles.moreOptionsButton}
        onClick={() => setShowCustomPanel(true)}
        aria-label="Open custom range settings"
      >
        <Settings2 size={16} />
        <span>More options</span>
      </button>

      <CustomRangePanel
        isOpen={showCustomPanel}
        onClose={() => setShowCustomPanel(false)}
        value={value}
        onChange={onChange}
        operation={operation}
      />
    </div>
  );
}
