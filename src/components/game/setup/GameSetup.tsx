"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useGameStore, Operation, GameMode, NumberRange, NUMBER_RANGE_PRESETS } from "@/lib/stores/useGameStore";
import { useVoskModel } from "@/lib/hooks/useVoskModel";
import { usePremiumAccess } from "@/lib/hooks/usePremiumAccess";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { isNumberLocked, FREE_NUMBERS, PREMIUM_NUMBERS, getPremiumDescription } from "@/lib/constants/content-access";
import { ProfileChip } from "@/components/features/profiles/ProfileChip";
import { NumberRangeSelector } from "./NumberRangeSelector";
import { LockedContentModal } from "@/components/ui/LockedContentModal";
import { Plus, Minus, X, Divide, Timer, Infinity as InfinityIcon, ChevronRight, ChevronLeft, Play, Zap, Calculator, List, Mic, Check, Download, Loader2, Lock } from "lucide-react";
import styles from "./GameSetup.module.css";

interface GameSetupProps {
  onStart: () => void;
}

export function GameSetup({ onStart }: GameSetupProps) {
  const [step, setStep] = useState(0);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedModalDescription, setLockedModalDescription] = useState('');
  
  const { config, setConfig, startGame } = useGameStore();
  const { status: voskStatus, progress: voskProgress, startLoading: startVoskLoading } = useVoskModel();
  const { isPremium, isDevOverride } = usePremiumAccess();
  const { corePricing } = useCurrency();

  // Start loading Vosk when voice is selected
  useEffect(() => {
    if (config.inputMode === 'voice' && voskStatus === 'idle') {
      startVoskLoading();
    }
  }, [config.inputMode, voskStatus, startVoskLoading]);

  const handleOperationSelect = (op: Operation) => {
    setConfig({ operations: [op], selectedNumbers: [] });
    setStep(1);
  };

  // Check if current operation uses number range (addition/subtraction) vs number selection (mult/div)
  const usesNumberRange = config.operations[0] === 'addition' || config.operations[0] === 'subtraction';

  const handleNumberRangeChange = (range: NumberRange) => {
    setConfig({ numberRange: range });
  };

  const handleNumberToggle = (num: number) => {
    // Check if this number is locked for free users
    if (isNumberLocked(num, isPremium)) {
      setLockedModalDescription(getPremiumDescription(config.operations[0]));
      setShowLockedModal(true);
      return;
    }
    
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

  const handleInputModeSelect = (inputMode: 'numpad' | 'choice' | 'voice') => {
    setConfig({ inputMode });
    // Start loading Vosk immediately when voice is selected
    if (inputMode === 'voice' && voskStatus === 'idle') {
      startVoskLoading();
    }
    setStep(4);
  };

  const handleSettingsNext = () => {
    setStep(5);
  };

  // Check if we can start the game
  const canStart = config.inputMode !== 'voice' || voskStatus === 'ready';
  const isVoiceLoading = config.inputMode === 'voice' && voskStatus === 'loading';

  const handleStart = () => {
    if (!canStart) return;
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

  const formatNumber = (num: number) => {
    const op = config.operations[0];
    if (op === 'multiplication') return `×${num}`;
    if (op === 'division') return `÷${num}`;
    if (op === 'addition') return `+${num}`;
    if (op === 'subtraction') return `-${num}`;
    return num.toString();
  };

  const handleSelectAll = () => {
    // Only select free numbers if user isn't premium
    const numbersToSelect = isPremium 
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : FREE_NUMBERS;
    setConfig({ selectedNumbers: numbersToSelect });
  };

  const handleClearSelection = () => {
    setConfig({ selectedNumbers: [] });
  };

  const getSummaryText = () => {
    if (!config.selectedNumbers?.length) return <span className={styles.placeholderText}>Select at least one number</span>;
    
    const count = config.selectedNumbers.length;
    const op = config.operations[0];
    const noun = op === 'multiplication' ? 'tables' : 'numbers';
    
    const formattedNumbers = config.selectedNumbers
      .sort((a, b) => a - b)
      .map(num => formatNumber(num))
      .join(', ');

    return (
      <>
        <strong>{count}</strong> {noun} selected: {formattedNumbers}
      </>
    );
  };

  const renderNumberSelection = () => {
    const op = config.operations[0];
    const isTimesTable = op === 'multiplication' || op === 'division';
    
    return (
      <div className={styles.numbersContainer}>
        <div className={styles.selectionControls}>
          <button onClick={handleSelectAll} className={styles.textButton}>Select All</button>
          <button onClick={handleClearSelection} className={styles.textButton}>Clear</button>
        </div>
        <div className={styles.numberGrid}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
            const isLocked = isNumberLocked(num, isPremium);
            const isSelected = config.selectedNumbers?.includes(num);
            
            return (
              <button
                key={num}
                className={`${styles.numberCard} ${isSelected ? styles.selected : ''} ${isLocked ? styles.locked : ''}`}
                onClick={() => handleNumberToggle(num)}
                aria-label={isLocked ? `${formatNumber(num)} - Premium content, tap to unlock` : formatNumber(num)}
              >
                {isSelected && !isLocked && (
                  <div className={styles.checkBadge}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
                {isLocked && (
                  <div className={styles.lockBadge}>
                    <Lock size={14} strokeWidth={3} />
                  </div>
                )}
                <span className={isLocked ? styles.lockedText : undefined}>
                  {formatNumber(num)}
                </span>
              </button>
            );
          })}
        </div>
        <div className={styles.selectionSummary}>
          {getSummaryText()}
        </div>
        {/* Show unlock button for free users */}
        {!isPremium && (
          <button
            className={styles.unlockButton}
            onClick={() => {
              setLockedModalDescription(getPremiumDescription(config.operations[0]));
              setShowLockedModal(true);
            }}
          >
            <Lock size={16} />
            <span>Unlock All Tables</span>
            <span className={styles.unlockPrice}>{corePricing.displayPrice}</span>
          </button>
        )}
      </div>
    );
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
    // Step 1: Number Range for addition/subtraction OR Number Selection for mult/div
    usesNumberRange ? {
      id: 'numberRange',
      title: "Pick Your Number Zone",
      subtitle: "Choose your challenge level.",
      content: (
        <NumberRangeSelector
          operation={config.operations[0] as 'addition' | 'subtraction'}
          value={config.numberRange}
          onChange={handleNumberRangeChange}
        />
      ),
      canProceed: true // Always can proceed with preset selected
    } : {
      id: 'numbers',
      title: getNumberGridTitle(),
      subtitle: "Select one or more to practice.",
      content: renderNumberSelection(),
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
      id: 'input',
      title: "How do you want to answer?",
      subtitle: "Choose your input method.",
      content: (
        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <button 
            className={`${styles.card} ${config.inputMode === 'numpad' ? styles.selected : ''}`}
            onClick={() => handleInputModeSelect('numpad')}
          >
            <Calculator size={48} className={styles.cardIcon} />
            <span className={styles.cardLabel}>Number Pad</span>
            <p className={styles.modeDescription}>Type your answers using a keypad.</p>
          </button>
          <button 
            className={`${styles.card} ${config.inputMode === 'choice' ? styles.selected : ''}`}
            onClick={() => handleInputModeSelect('choice')}
          >
            <List size={48} className={styles.cardIcon} />
            <span className={styles.cardLabel}>Multiple Choice</span>
            <p className={styles.modeDescription}>Pick the correct answer from 5 options.</p>
          </button>
          <button 
            className={`${styles.card} ${config.inputMode === 'voice' ? styles.selected : ''}`}
            onClick={() => handleInputModeSelect('voice')}
          >
            {config.inputMode === 'voice' && voskStatus === 'loading' ? (
              <Download size={48} className={`${styles.cardIcon} ${styles.spin}`} />
            ) : (
              <Mic size={48} className={styles.cardIcon} />
            )}
            <span className={styles.cardLabel}>Voice</span>
            <p className={styles.modeDescription}>
              {config.inputMode === 'voice' && voskStatus === 'loading' 
                ? `Downloading... ${voskProgress > 0 ? `${voskProgress}%` : ''}`
                : config.inputMode === 'voice' && voskStatus === 'ready'
                ? 'Ready! ✓'
                : 'Say your answers out loud! 🎤'}
            </p>
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
              <div className={styles.sliderRow}>
                <button
                  className={styles.adjustButton}
                  onClick={() => setConfig({ duration: Math.max(30, config.duration - 10) })}
                  disabled={config.duration <= 30}
                  aria-label="Decrease duration"
                >
                  <Minus size={44} strokeWidth={3} />
                </button>
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="10"
                  value={config.duration}
                  onChange={(e) => setConfig({ duration: parseInt(e.target.value) })}
                  className={styles.slider}
                />
                <button
                  className={styles.adjustButton}
                  onClick={() => setConfig({ duration: Math.min(90, config.duration + 10) })}
                  disabled={config.duration >= 90}
                  aria-label="Increase duration"
                >
                  <Plus size={44} strokeWidth={3} />
                </button>
              </div>
            </>
          )}
          {config.mode === 'sprint' && (
            <>
              <div className={styles.sliderLabel}>
                <span>Questions</span>
                <span className={styles.sliderValue}>{config.questionCount}</span>
              </div>
              <div className={styles.sliderRow}>
                <button
                  className={styles.adjustButton}
                  onClick={() => setConfig({ questionCount: Math.max(10, config.questionCount - 5) })}
                  disabled={config.questionCount <= 10}
                  aria-label="Decrease questions"
                >
                  <Minus size={44} strokeWidth={3} />
                </button>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={config.questionCount}
                  onChange={(e) => setConfig({ questionCount: parseInt(e.target.value) })}
                  className={styles.slider}
                />
                <button
                  className={styles.adjustButton}
                  onClick={() => setConfig({ questionCount: Math.min(50, config.questionCount + 5) })}
                  disabled={config.questionCount >= 50}
                  aria-label="Increase questions"
                >
                  <Plus size={44} strokeWidth={3} />
                </button>
              </div>
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
      mascot: (
        <motion.div
          className={styles.mascotContainer}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className={styles.mascotReady}
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, -2, 0, 2, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <Image
              src="/mascots/mascot dashy - stance is ready for a sprint with a determined look.png"
              alt="Dashy ready to sprint"
              width={160}
              height={160}
              className={styles.mascotImage}
              priority
            />
          </motion.div>
          <motion.div
            className={styles.readyPulse}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ),
      content: (
        <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Operation</span>
              <span className={styles.summaryValue} style={{ textTransform: 'capitalize' }}>
                {config.operations[0]}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                {usesNumberRange ? 'Number Zone' : 'Focus Numbers'}
              </span>
              <span className={styles.summaryValue}>
                {usesNumberRange 
                  ? config.numberRange.preset === 'custom'
                    ? `Custom (${config.numberRange.min}–${config.numberRange.max})`
                    : `${NUMBER_RANGE_PRESETS[config.numberRange.preset as Exclude<typeof config.numberRange.preset, 'custom'>].label} (up to ${config.numberRange.max})`
                  : config.selectedNumbers?.length 
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
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Input</span>
              <span className={styles.summaryValue}>
                {config.inputMode === 'choice' ? 'Multiple Choice' : 
                 config.inputMode === 'voice' ? 'Voice' : 'Number Pad'}
              </span>
            </div>
          </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <ProfileChip size="md" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.stepContainer}
        >
          {'mascot' in steps[step] && steps[step].mascot}
          
          <div className={styles.stepHeader}>
            <h2 className={styles.title}>{steps[step].title}</h2>
            <p className={styles.subtitle}>{steps[step].subtitle}</p>
          </div>
          
          <div className={styles.stepContent}>
            {steps[step].content}
          </div>

          <div className={styles.actions}>
            {step > 0 ? (
              <button className={styles.backButton} onClick={() => setStep(step - 1)}>
                <ChevronLeft size={20} /> Back
              </button>
            ) : <div />}
            
            {step === steps.length - 1 ? (
              <button 
                className={`${styles.nextButton} ${isVoiceLoading ? styles.loading : ''}`} 
                onClick={handleStart}
                disabled={!canStart}
              >
                {isVoiceLoading ? (
                  <>
                    <Loader2 size={20} className={styles.spin} />
                    Loading Voice... {voskProgress > 0 ? `${voskProgress}%` : ''}
                  </>
                ) : (
                  <>
                    Start Game <Play size={20} fill="currentColor" />
                  </>
                )}
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
      
      {/* Locked content upgrade modal */}
      <LockedContentModal
        isOpen={showLockedModal}
        onClose={() => setShowLockedModal(false)}
        title="Premium Content"
        description={lockedModalDescription}
        operation={config.operations[0]}
      />
    </div>
  );
}
