"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useGameStore, Operation, GameMode, NumberRange, NUMBER_RANGE_PRESETS, TopicType, SPECIAL_TOPICS, TopicCategory } from "@/lib/stores/useGameStore";
import { useVoskModel } from "@/lib/hooks/useVoskModel";
import { usePremiumAccess } from "@/lib/hooks/usePremiumAccess";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { isNumberLocked, FREE_NUMBERS, PREMIUM_NUMBERS, getPremiumDescription, isSpecialTopicLocked, PREMIUM_CONTENT_DESCRIPTIONS } from "@/lib/constants/content-access";
import { ProfileChip } from "@/components/features/profiles/ProfileChip";
import { NumberRangeSelector } from "./NumberRangeSelector";
import { LockedContentModal } from "@/components/ui/LockedContentModal";
import { Plus, Minus, X, Divide, Timer, Infinity as InfinityIcon, ChevronRight, ChevronLeft, Play, Zap, Calculator, List, Mic, Check, Download, Loader2, Lock, Link2, Sparkles, Square } from "lucide-react";
import styles from "./GameSetup.module.css";

// Practice category for the first step
type PracticeCategory = 'basic-operations' | 'special-topics';

interface GameSetupProps {
  onStart: () => void;
}

export function GameSetup({ onStart }: GameSetupProps) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('basic-operations');
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedModalDescription, setLockedModalDescription] = useState('');
  
  const { config, setConfig, startGame } = useGameStore();
  const { status: voskStatus, progress: voskProgress, startLoading: startVoskLoading } = useVoskModel();
  const { isPremium, isDevOverride } = usePremiumAccess();
  const { corePricing } = useCurrency();

  // Handle URL parameters for pre-configuration (from suggestions)
  useEffect(() => {
    const opsParam = searchParams.get('ops');
    const numsParam = searchParams.get('nums');
    const rangeParam = searchParams.get('range');
    
    if (opsParam) {
      const operations = opsParam.split(',').filter(op => 
        ['addition', 'subtraction', 'multiplication', 'division'].includes(op)
      ) as Operation[];
      
      if (operations.length > 0) {
        setConfig({ operations });
        setPracticeCategory('basic-operations');
        
        // Parse numbers for mult/div
        if (numsParam) {
          const numbers = numsParam.split(',')
            .map(n => parseInt(n, 10))
            .filter(n => !isNaN(n) && n >= 1 && n <= 12);
          if (numbers.length > 0) {
            setConfig({ selectedNumbers: numbers });
          }
        }
        
        // Parse range preset for add/sub
        if (rangeParam && ['starter', 'builder', 'challenge', 'pro'].includes(rangeParam)) {
          const preset = rangeParam as keyof typeof NUMBER_RANGE_PRESETS;
          const rangeConfig = NUMBER_RANGE_PRESETS[preset];
          setConfig({ 
            numberRange: {
              preset,
              min: rangeConfig.min,
              max: rangeConfig.max,
              rangeType: 'operand',
              allowNegatives: false,
            }
          });
        }
        
        // Skip to the number selection step (step 2)
        setStep(2);
      }
    }
  }, [searchParams, setConfig]);

  // Start loading Vosk when voice is selected
  useEffect(() => {
    if (config.inputMode === 'voice' && voskStatus === 'idle') {
      startVoskLoading();
    }
  }, [config.inputMode, voskStatus, startVoskLoading]);

  const handlePracticeCategorySelect = (category: PracticeCategory) => {
    setPracticeCategory(category);
    // Reset topic selections when switching category
    setConfig({ operations: [], selectedTopics: [], selectedNumbers: [] });
    setStep(1);
  };

  const handleOperationSelect = (op: Operation) => {
    setConfig({ operations: [op], selectedNumbers: [], selectedTopics: [] });
    setStep(2);
  };

  const handleSpecialTopicToggle = (topic: TopicType) => {
    // Check if this topic is locked for free users
    if (isSpecialTopicLocked(topic, isPremium)) {
      // Get the category for proper description
      const topicConfig = SPECIAL_TOPICS.find(t => t.type === topic);
      const category = topicConfig?.category || 'general';
      setLockedModalDescription(PREMIUM_CONTENT_DESCRIPTIONS[category as keyof typeof PREMIUM_CONTENT_DESCRIPTIONS] || PREMIUM_CONTENT_DESCRIPTIONS.general);
      setShowLockedModal(true);
      return;
    }
    
    const current = config.selectedTopics || [];
    const updated = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];
    setConfig({ selectedTopics: updated });
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
    // Step index depends on practice category
    setStep(practiceCategory === 'basic-operations' ? 4 : 3);
  };

  const handleInputModeSelect = (inputMode: 'numpad' | 'choice' | 'voice') => {
    setConfig({ inputMode });
    // Start loading Vosk immediately when voice is selected
    if (inputMode === 'voice' && voskStatus === 'idle') {
      startVoskLoading();
    }
    setStep(practiceCategory === 'basic-operations' ? 5 : 4);
  };

  const handleSettingsNext = () => {
    setStep(practiceCategory === 'basic-operations' ? 6 : 5);
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

  const getTopicIcon = (type: TopicType) => {
    switch (type) {
      case 'number-bonds-10':
      case 'number-bonds-20':
      case 'number-bonds-50':
      case 'number-bonds-100':
        return <Link2 size={36} className={`${styles.topicIcon} ${styles.iconBonds}`} />;
      case 'doubles':
        return <Sparkles size={36} className={`${styles.topicIcon} ${styles.iconDoubles}`} />;
      case 'halves':
        return <Sparkles size={36} className={`${styles.topicIcon} ${styles.iconHalves}`} />;
      case 'squares':
        return <Square size={36} className={`${styles.topicIcon} ${styles.iconSquares}`} />;
      default:
        return <Calculator size={36} className={styles.topicIcon} />;
    }
  };

  const renderSpecialTopicsSelection = () => {
    // Group topics by category
    const numberBondTopics = SPECIAL_TOPICS.filter(t => t.category === 'number-bonds');
    const doublesHalvesTopics = SPECIAL_TOPICS.filter(t => t.category === 'doubles-halves');
    const squaresTopics = SPECIAL_TOPICS.filter(t => t.category === 'squares');

    const renderTopicCard = (topic: typeof SPECIAL_TOPICS[0]) => {
      const isLocked = isSpecialTopicLocked(topic.type, isPremium);
      const isSelected = config.selectedTopics?.includes(topic.type);

      return (
        <button
          key={topic.type}
          className={`${styles.topicCard} ${isSelected ? styles.selected : ''} ${isLocked ? styles.locked : ''}`}
          onClick={() => handleSpecialTopicToggle(topic.type)}
          aria-label={isLocked ? `${topic.label} - Premium content, tap to unlock` : topic.label}
        >
          {isSelected && !isLocked && (
            <div className={styles.checkBadge}>
              <Check size={16} strokeWidth={4} />
            </div>
          )}
          {isLocked && (
            <div className={styles.lockBadge}>
              <Lock size={14} strokeWidth={3} />
            </div>
          )}
          {getTopicIcon(topic.type)}
          <span className={styles.topicLabel}>
            {topic.label}
          </span>
          <span className={styles.topicDescription}>{topic.description}</span>
        </button>
      );
    };

    return (
      <div className={styles.specialTopicsContainer}>
        {/* Number Bonds Section */}
        <div className={styles.topicSection}>
          <h3 className={styles.topicSectionTitle}>
            <Link2 size={16} /> Number Bonds
          </h3>
          <div className={styles.topicGrid}>
            {numberBondTopics.map(renderTopicCard)}
          </div>
        </div>

        {/* Doubles & Halves Section */}
        <div className={styles.topicSection}>
          <h3 className={styles.topicSectionTitle}>
            <Sparkles size={16} /> Doubles & Halves
          </h3>
          <div className={styles.topicGrid}>
            {doublesHalvesTopics.map(renderTopicCard)}
          </div>
        </div>

        {/* Squares Section */}
        <div className={styles.topicSection}>
          <h3 className={styles.topicSectionTitle}>
            <Square size={16} /> Square Numbers
          </h3>
          <div className={styles.topicGrid}>
            {squaresTopics.map(renderTopicCard)}
          </div>
        </div>

        <div className={styles.selectionSummary}>
          {config.selectedTopics?.length 
            ? <><strong>{config.selectedTopics.length}</strong> topic{config.selectedTopics.length !== 1 ? 's' : ''} selected</>
            : <span className={styles.placeholderText}>Select at least one topic</span>
          }
        </div>

        {/* Show unlock button for free users */}
        {!isPremium && (
          <button
            className={styles.unlockButton}
            onClick={() => {
              setLockedModalDescription(PREMIUM_CONTENT_DESCRIPTIONS.general);
              setShowLockedModal(true);
            }}
          >
            <Lock size={16} />
            <span>Unlock All Topics</span>
            <span className={styles.unlockPrice}>{corePricing.displayPrice}</span>
          </button>
        )}
      </div>
    );
  };

  // Build steps based on practice category
  const getSteps = () => {
    const commonSteps = {
      mode: {
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
      input: {
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
      settings: {
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
      }
    };

    // Practice category selection step (step 0 for both flows)
    const practiceCategoryStep = {
      id: 'practiceCategory',
      title: "What would you like to practice?",
      subtitle: "Choose your practice type.",
      content: (
        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <button 
            className={`${styles.card} ${styles.categoryCard} ${practiceCategory === 'basic-operations' ? styles.selected : ''}`}
            onClick={() => handlePracticeCategorySelect('basic-operations')}
          >
            <div className={styles.categoryIcons}>
              <Plus size={28} className={styles.opAdd} strokeWidth={3} />
              <Minus size={28} className={styles.opSub} strokeWidth={3} />
              <X size={28} className={styles.opMul} strokeWidth={3} />
              <Divide size={28} className={styles.opDiv} strokeWidth={3} />
            </div>
            <span className={styles.cardLabel}>Basic Operations</span>
            <p className={styles.modeDescription}>Addition, subtraction, multiplication, division</p>
          </button>
          <button 
            className={`${styles.card} ${styles.categoryCard} ${practiceCategory === 'special-topics' ? styles.selected : ''}`}
            onClick={() => handlePracticeCategorySelect('special-topics')}
          >
            <div className={styles.categoryIcons}>
              <Link2 size={28} className={styles.topicBonds} strokeWidth={3} />
              <Sparkles size={28} className={styles.topicDoubles} strokeWidth={3} />
              <Square size={28} className={styles.topicSquares} strokeWidth={3} />
            </div>
            <span className={styles.cardLabel}>Special Topics</span>
            <p className={styles.modeDescription}>Number bonds, doubles, halves, squares</p>
          </button>
        </div>
      )
    };

    if (practiceCategory === 'basic-operations') {
      return [
        practiceCategoryStep,
        // Step 1: Select operation
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
        // Step 2: Number Range for addition/subtraction OR Number Selection for mult/div
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
          canProceed: true
        } : {
          id: 'numbers',
          title: getNumberGridTitle(),
          subtitle: "Select one or more to practice.",
          content: renderNumberSelection(),
          canProceed: (config.selectedNumbers?.length || 0) > 0
        },
        // Step 3: Game mode
        commonSteps.mode,
        // Step 4: Input mode
        commonSteps.input,
        // Step 5: Settings
        commonSteps.settings,
        // Step 6: Ready
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
    } else {
      // Special topics flow
      return [
        practiceCategoryStep,
        // Step 1: Select special topics
        {
          id: 'specialTopics',
          title: "Choose your topics",
          subtitle: "Select one or more to practice.",
          content: renderSpecialTopicsSelection(),
          canProceed: (config.selectedTopics?.length || 0) > 0
        },
        // Step 2: Game mode
        commonSteps.mode,
        // Step 3: Input mode
        commonSteps.input,
        // Step 4: Settings
        commonSteps.settings,
        // Step 5: Ready
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
                <span className={styles.summaryLabel}>Topics</span>
                <span className={styles.summaryValue}>
                  {config.selectedTopics?.map(t => {
                    const topic = SPECIAL_TOPICS.find(st => st.type === t);
                    return topic?.label || t;
                  }).join(', ') || 'None selected'}
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
    }
  };

  const steps = getSteps();

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
                  disabled={'canProceed' in steps[step] && steps[step].canProceed === false}
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
