"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameStore, Operation, GameMode } from "@/lib/stores/useGameStore";
import { Plus, Minus, X, Divide, Timer, Infinity as InfinityIcon, ChevronRight, ChevronLeft, Play, Zap } from "lucide-react";
import styles from "./GameSetup.module.css";

interface GameSetupProps {
  onStart: () => void;
}

export function GameSetup({ onStart }: GameSetupProps) {
  const [step, setStep] = useState(0);
  const { config, setConfig, startGame } = useGameStore();

  const handleOperationSelect = (op: Operation) => {
    setConfig({ operations: [op], selectedNumbers: [] });
    setStep(1);
  };

  const handleNumberToggle = (num: number) => {
    const current = config.selectedNumbers || [];
    const updated = current.includes(num)
      ? current.filter(n => n !== num)
      : [...current, num];
    setConfig({ selectedNumbers: updated });
  };

  const handleModeSelect = (mode: GameMode) => {
    setConfig({ mode });
    setStep(3);
  };

  const handleSettingsNext = () => {
    setStep(4);
  };

  const handleStart = () => {
    startGame();
    onStart();
  };

  const getNumberGridTitle = () => {
    const op = config.operations[0];
    if (op === 'multiplication') return "Which times tables?";
    if (op === 'division') return "Which divisors?";
    if (op === 'addition') return "Practice adding by...";
    if (op === 'subtraction') return "Practice subtracting by...";
    return "Select numbers";
  };

  const steps = [
    {
      id: 'operation',
      title: "What do you want to practice?",
      subtitle: "Choose an operation to master.",
      content: (
        <div className={styles.grid}>
          <button 
            className={`${styles.card} ${config.operations.includes('addition') ? styles.selected : ''}`}
            onClick={() => handleOperationSelect('addition')}
          >
            <Plus size={48} className={`${styles.cardIcon} ${styles.opAdd}`} strokeWidth={3} />
            <span className={styles.cardLabel}>Addition</span>
          </button>
          <button 
            className={`${styles.card} ${config.operations.includes('subtraction') ? styles.selected : ''}`}
            onClick={() => handleOperationSelect('subtraction')}
          >
            <Minus size={48} className={`${styles.cardIcon} ${styles.opSub}`} strokeWidth={3} />
            <span className={styles.cardLabel}>Subtraction</span>
          </button>
          <button 
            className={`${styles.card} ${config.operations.includes('multiplication') ? styles.selected : ''}`}
            onClick={() => handleOperationSelect('multiplication')}
          >
            <X size={48} className={`${styles.cardIcon} ${styles.opMul}`} strokeWidth={3} />
            <span className={styles.cardLabel}>Multiplication</span>
          </button>
          <button 
            className={`${styles.card} ${config.operations.includes('division') ? styles.selected : ''}`}
            onClick={() => handleOperationSelect('division')}
          >
            <Divide size={48} className={`${styles.cardIcon} ${styles.opDiv}`} strokeWidth={3} />
            <span className={styles.cardLabel}>Division</span>
          </button>
        </div>
      )
    },
    {
      id: 'numbers',
      title: getNumberGridTitle(),
      subtitle: "Select one or more to practice.",
      content: (
        <div className={styles.numberGrid}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`${styles.numberCard} ${config.selectedNumbers?.includes(num) ? styles.selected : ''}`}
              onClick={() => handleNumberToggle(num)}
            >
              {num}
            </button>
          ))}
        </div>
      ),
      canProceed: (config.selectedNumbers?.length || 0) > 0
    },
    {
      id: 'mode',
      title: "How do you want to play?",
      subtitle: "Choose your challenge style.",
      content: (
        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <button 
            className={`${styles.card} ${config.mode === 'timed' ? styles.selected : ''}`}
            onClick={() => handleModeSelect('timed')}
          >
            <Timer size={48} className={styles.cardIcon} />
            <span className={styles.cardLabel}>Dash Blitz</span>
            <p className={styles.modeDescription}>Race against the clock! Answer as many as you can.</p>
          </button>
          <button 
            className={`${styles.card} ${config.mode === 'sprint' ? styles.selected : ''}`}
            onClick={() => handleModeSelect('sprint')}
          >
            <Zap size={48} className={styles.cardIcon} />
            <span className={styles.cardLabel}>Sprint</span>
            <p className={styles.modeDescription}>Speed run! Answer {config.questionCount || 20} questions as fast as possible.</p>
          </button>
          <button 
            className={`${styles.card} ${config.mode === 'practice' ? styles.selected : ''}`}
            onClick={() => handleModeSelect('practice')}
          >
            <InfinityIcon size={48} className={styles.cardIcon} />
            <span className={styles.cardLabel}>Zen Practice</span>
            <p className={styles.modeDescription}>No timer, no pressure. Just focus on getting them right.</p>
          </button>
        </div>
      )
    },
    {
      id: 'settings',
      title: "Customize your game",
      subtitle: "Adjust the settings to your liking.",
      content: (
        <div className={styles.sliderContainer}>
          {config.mode === 'timed' && (
            <>
              <div className={styles.sliderLabel}>
                <span>Duration</span>
                <span className={styles.sliderValue}>{config.duration}s</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="10"
                value={config.duration}
                onChange={(e) => setConfig({ duration: parseInt(e.target.value) })}
                className={styles.slider}
              />
            </>
          )}
          {config.mode === 'sprint' && (
            <>
              <div className={styles.sliderLabel}>
                <span>Questions</span>
                <span className={styles.sliderValue}>{config.questionCount}</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={config.questionCount}
                onChange={(e) => setConfig({ questionCount: parseInt(e.target.value) })}
                className={styles.slider}
              />
            </>
          )}
          {config.mode === 'practice' && (
            <p className={styles.modeDescription} style={{ textAlign: 'center' }}>
              Just relax and practice. No settings needed!
            </p>
          )}
        </div>
      )
    },
    {
      id: 'ready',
      title: "Ready to Dash?",
      subtitle: "Double check your setup.",
      content: (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Operation</span>
            <span className={styles.summaryValue} style={{ textTransform: 'capitalize' }}>
              {config.operations[0]}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Focus Numbers</span>
            <span className={styles.summaryValue}>
              {config.selectedNumbers?.length 
                ? config.selectedNumbers.sort((a, b) => a - b).join(', ') 
                : 'All'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Mode</span>
            <span className={styles.summaryValue}>
              {config.mode === 'timed' ? `Dash Blitz (${config.duration}s)` : 
               config.mode === 'sprint' ? `Sprint (${config.questionCount} Qs)` : 
               'Zen Practice'}
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.stepContainer}
        >
          <div>
            <h2 className={styles.title}>{steps[step].title}</h2>
            <p className={styles.subtitle}>{steps[step].subtitle}</p>
          </div>
          
          {steps[step].content}

          <div className={styles.actions}>
            {step > 0 ? (
              <button className={styles.backButton} onClick={() => setStep(step - 1)}>
                <ChevronLeft size={20} /> Back
              </button>
            ) : <div />}
            
            {step === steps.length - 1 ? (
              <button className={styles.nextButton} onClick={handleStart}>
                Start Game <Play size={20} fill="currentColor" />
              </button>
            ) : (
              step > 0 && (
                <button 
                  className={styles.nextButton} 
                  onClick={() => setStep(step + 1)}
                  disabled={steps[step].canProceed === false}
                >
                  Next <ChevronRight size={20} />
                </button>
              )
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
