/**
 * Math Dash - Skill to Game Mapping
 * 
 * Maps curriculum skill IDs to game configuration parameters.
 * Used by CurriculumTracker to calculate skill proficiency from mastery records.
 * 
 * @see src/lib/constants/curriculum-data.ts for skill definitions
 * @see src/lib/stores/useGameStore.ts for TopicType and NumberRange types
 */

import { type SkillId, getSkillById, type SkillSubdomain } from './curriculum-data';
import type { MasteryRecord } from '../db';
import type { TopicType, Operation, NumberRange, RangePreset, RangeType } from '../stores/useGameStore';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SkillGameConfig {
  /** The curriculum skill ID */
  skillId: SkillId;
  
  /** Human-readable name for debugging/logging */
  name: string;
  
  /** TopicTypes that map to this skill (for special topics) */
  topics?: TopicType[];
  
  /** Operations that map to this skill (for basic operations) */
  operations?: Operation[];
  
  /** Number range configuration (for add/sub skills) */
  numberRange?: {
    preset?: RangePreset;
    min: number;
    max: number;
    rangeType: RangeType;
  };
  
  /** Times table numbers that map to this skill */
  selectedNumbers?: number[];
  
  /** Expected fact count for coverage/progress calculation */
  expectedFactCount: number;
  
  /** Fact pattern matcher - regex pattern to match facts in mastery records */
  factPattern?: RegExp;
  
  /** Additional filter for more complex matching */
  factFilter?: (fact: string) => boolean;
}

// ============================================================================
// Number Bonds Mappings
// ============================================================================

const NUMBER_BONDS_MAPPINGS: SkillGameConfig[] = [
  {
    skillId: 'NB10',
    name: 'Number Bonds to 10',
    topics: ['number-bonds-10'],
    operations: ['addition'],
    expectedFactCount: 11, // 0+10, 1+9, 2+8, 3+7, 4+6, 5+5, 6+4, 7+3, 8+2, 9+1, 10+0
    factPattern: /^(\d)\+(\d)=10$/,
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)\+(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b, result] = match;
      return parseInt(result) === 10 && parseInt(a) + parseInt(b) === 10;
    },
  },
  {
    skillId: 'NB20',
    name: 'Number Bonds to 20',
    topics: ['number-bonds-20'],
    operations: ['addition'],
    expectedFactCount: 21, // All pairs summing to 20
    factPattern: /^\d+\+\d+=20$/,
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)\+(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b, result] = match;
      return parseInt(result) === 20 && parseInt(a) + parseInt(b) === 20;
    },
  },
  {
    skillId: 'NB100',
    name: 'Number Bonds to 100',
    topics: ['number-bonds-50', 'number-bonds-100'],
    operations: ['addition'],
    expectedFactCount: 20, // Focus on multiples of 5 and 10 (10+90, 20+80, etc.)
    factPattern: /^\d+\+\d+=100$/,
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)\+(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b, result] = match;
      return parseInt(result) === 100 && parseInt(a) + parseInt(b) === 100;
    },
  },
  {
    skillId: 'NB_DEC1',
    name: 'Decimal Number Bonds to 1.0',
    operations: ['addition'],
    expectedFactCount: 10, // 0.1+0.9, 0.2+0.8, etc.
    factPattern: /^0\.\d\+0\.\d=1(\.0)?$/,
    factFilter: (fact) => {
      // Matches decimal addition facts that sum to 1.0
      const match = fact.match(/^([\d.]+)\+([\d.]+)=([\d.]+)$/);
      if (!match) return false;
      const [, a, b, result] = match;
      return Math.abs(parseFloat(result) - 1.0) < 0.001;
    },
  },
];

// ============================================================================
// Addition & Subtraction Mappings
// ============================================================================

const ADD_SUB_MAPPINGS: SkillGameConfig[] = [
  {
    skillId: 'ADD_SUB_20',
    name: 'Add/Sub within 20',
    operations: ['addition', 'subtraction'],
    numberRange: { min: 0, max: 20, rangeType: 'answer' },
    expectedFactCount: 220, // Approx: addition facts + subtraction facts within 20
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)([+\-])(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, op, b, result] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      const numResult = parseInt(result);
      // All operands and result must be ≤ 20
      return numA <= 20 && numB <= 20 && numResult <= 20 && numResult >= 0;
    },
  },
  {
    skillId: 'ADD_SUB_100',
    name: 'Add/Sub within 100',
    operations: ['addition', 'subtraction'],
    numberRange: { min: 0, max: 100, rangeType: 'answer' },
    expectedFactCount: 400, // Subset of common facts
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)([+\-])(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, , b, result] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      const numResult = parseInt(result);
      // Focus on 2-digit operations
      return numA <= 100 && numB <= 100 && numResult <= 100 && numResult >= 0 &&
             (numA > 20 || numB > 20 || numResult > 20);
    },
  },
  {
    skillId: 'ADD_SUB_1000',
    name: 'Add/Sub within 1000',
    operations: ['addition', 'subtraction'],
    numberRange: { min: 0, max: 1000, rangeType: 'answer' },
    expectedFactCount: 300, // Subset of common facts
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)([+\-])(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, , b, result] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      const numResult = parseInt(result);
      // Focus on 3-digit operations
      return numA <= 1000 && numB <= 1000 && numResult <= 1000 && numResult >= 0 &&
             (numA > 100 || numB > 100 || numResult > 100);
    },
  },
];

// ============================================================================
// Times Tables Mappings
// ============================================================================

const TIMES_TABLES_MAPPINGS: SkillGameConfig[] = [
  {
    skillId: 'TT_2_5_10',
    name: 'Times Tables: 2, 5, 10',
    operations: ['multiplication'],
    selectedNumbers: [2, 5, 10],
    expectedFactCount: 36, // 12 facts each for 2, 5, 10 (1-12 range)
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[×x](\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return [2, 5, 10].includes(numA) || [2, 5, 10].includes(numB);
    },
  },
  {
    skillId: 'TT_CORE',
    name: 'Times Tables: 2, 3, 4, 5, 8, 10 (Core)',
    operations: ['multiplication'],
    selectedNumbers: [2, 3, 4, 5, 8, 10],
    expectedFactCount: 72, // 12 facts each for 2, 3, 4, 5, 8, 10 (6 tables)
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[×x](\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return [2, 3, 4, 5, 8, 10].includes(numA) || [2, 3, 4, 5, 8, 10].includes(numB);
    },
  },
  {
    skillId: 'TT_1_10_ALL',
    name: 'Times Tables: 1-10 Complete',
    operations: ['multiplication'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expectedFactCount: 100, // 10×10 grid
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[×x](\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA >= 1 && numA <= 10 && numB >= 1 && numB <= 10;
    },
  },
  {
    skillId: 'TT_1_12_ALL',
    name: 'Times Tables: 1-12 Complete',
    operations: ['multiplication'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    expectedFactCount: 144, // 12×12 grid
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[×x](\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA >= 1 && numA <= 12 && numB >= 1 && numB <= 12;
    },
  },
];

// ============================================================================
// Division Mappings
// ============================================================================

const DIVISION_MAPPINGS: SkillGameConfig[] = [
  {
    skillId: 'DIV_2_5_10',
    name: 'Division by 2, 5, 10',
    operations: ['division'],
    selectedNumbers: [2, 5, 10],
    expectedFactCount: 36, // Inverse of TT_2_5_10
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[÷/](\d+)=(\d+)$/);
      if (!match) return false;
      const [, , b] = match;
      const divisor = parseInt(b);
      return [2, 5, 10].includes(divisor);
    },
  },
  {
    skillId: 'DIV_CORE',
    name: 'Division by 2, 3, 4, 5, 8, 10 (Core)',
    operations: ['division'],
    selectedNumbers: [2, 3, 4, 5, 8, 10],
    expectedFactCount: 72, // Inverse of TT_CORE
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[÷/](\d+)=(\d+)$/);
      if (!match) return false;
      const [, , b] = match;
      const divisor = parseInt(b);
      return [2, 3, 4, 5, 8, 10].includes(divisor);
    },
  },
  {
    skillId: 'DIV_1_10_ALL',
    name: 'Division 1-10 Complete',
    operations: ['division'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expectedFactCount: 100, // Inverse of TT_1_10_ALL
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[÷/](\d+)=(\d+)$/);
      if (!match) return false;
      const [, , b, result] = match;
      const divisor = parseInt(b);
      const quotient = parseInt(result);
      return divisor >= 1 && divisor <= 10 && quotient >= 1 && quotient <= 10;
    },
  },
  {
    skillId: 'DIV_1_12_ALL',
    name: 'Division 1-12 Complete',
    operations: ['division'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    expectedFactCount: 144, // Inverse of TT_1_12_ALL
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[÷/](\d+)=(\d+)$/);
      if (!match) return false;
      const [, , b, result] = match;
      const divisor = parseInt(b);
      const quotient = parseInt(result);
      return divisor >= 1 && divisor <= 12 && quotient >= 1 && quotient <= 12;
    },
  },
];

// ============================================================================
// Doubles & Halves Mappings
// ============================================================================

const DOUBLES_HALVES_MAPPINGS: SkillGameConfig[] = [
  {
    skillId: 'DBL_10',
    name: 'Doubles 1-10',
    topics: ['doubles'],
    operations: ['addition'],
    expectedFactCount: 10, // 1+1, 2+2, ..., 10+10
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)\+(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b, result] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA === numB && numA >= 1 && numA <= 10;
    },
  },
  {
    skillId: 'DBL_20',
    name: 'Doubles 11-20',
    operations: ['addition'],
    expectedFactCount: 10, // 11+11, 12+12, ..., 20+20
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)\+(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA === numB && numA >= 11 && numA <= 20;
    },
  },
  {
    skillId: 'DBL_100',
    name: 'Doubles 21-100',
    operations: ['addition'],
    expectedFactCount: 20, // Key doubles within 100
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)\+(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA === numB && numA >= 21 && numA <= 100;
    },
  },
  {
    skillId: 'DBL_DEC',
    name: 'Doubles with Decimals',
    operations: ['addition'],
    expectedFactCount: 10, // 0.5+0.5, 1.5+1.5, etc.
    factFilter: (fact) => {
      const match = fact.match(/^([\d.]+)\+([\d.]+)=([\d.]+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      return numA === numB && !Number.isInteger(numA);
    },
  },
  {
    skillId: 'DBL_3DIG',
    name: 'Doubles 101-999',
    operations: ['addition'],
    expectedFactCount: 15, // Key 3-digit doubles
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)\+(\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA === numB && numA >= 101 && numA <= 999;
    },
  },
];

// ============================================================================
// Squares Mappings
// ============================================================================

const SQUARES_MAPPINGS: SkillGameConfig[] = [
  {
    skillId: 'SQ_1_10',
    name: 'Squares 1-10',
    topics: ['squares'],
    operations: ['multiplication'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expectedFactCount: 10,
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[×x](\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA === numB && numA >= 1 && numA <= 10;
    },
  },
  {
    skillId: 'SQ_1_12',
    name: 'Squares 1-12',
    topics: ['squares'],
    operations: ['multiplication'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    expectedFactCount: 12,
    factFilter: (fact) => {
      const match = fact.match(/^(\d+)[×x](\d+)=(\d+)$/);
      if (!match) return false;
      const [, a, b] = match;
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA === numB && numA >= 1 && numA <= 12;
    },
  },
];

// ============================================================================
// Combined Mapping
// ============================================================================

/**
 * Complete mapping of all curriculum skills to game configurations
 */
export const SKILL_GAME_MAPPING: SkillGameConfig[] = [
  ...NUMBER_BONDS_MAPPINGS,
  ...ADD_SUB_MAPPINGS,
  ...TIMES_TABLES_MAPPINGS,
  ...DIVISION_MAPPINGS,
  ...DOUBLES_HALVES_MAPPINGS,
  ...SQUARES_MAPPINGS,
];

/**
 * Map for quick lookup by skill ID
 */
export const SKILL_GAME_MAP: Record<SkillId, SkillGameConfig> = Object.fromEntries(
  SKILL_GAME_MAPPING.map((config) => [config.skillId, config])
) as Record<SkillId, SkillGameConfig>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the game configuration for a skill
 */
export function getSkillGameConfig(skillId: SkillId): SkillGameConfig | undefined {
  return SKILL_GAME_MAP[skillId];
}

/**
 * Get all skills that map to a specific operation
 */
export function getSkillsForOperation(operation: Operation): SkillGameConfig[] {
  return SKILL_GAME_MAPPING.filter(
    (config) => config.operations?.includes(operation)
  );
}

/**
 * Get all skills that map to a specific topic
 */
export function getSkillsForTopic(topic: TopicType): SkillGameConfig[] {
  return SKILL_GAME_MAPPING.filter(
    (config) => config.topics?.includes(topic)
  );
}

/**
 * Get skills that include specific times table numbers
 */
export function getSkillsForTimesTableNumbers(numbers: number[]): SkillGameConfig[] {
  return SKILL_GAME_MAPPING.filter((config) => {
    if (!config.selectedNumbers) return false;
    return numbers.some((n) => config.selectedNumbers?.includes(n));
  });
}

/**
 * Check if a mastery fact matches a skill's criteria
 */
export function doesFactMatchSkill(fact: string, skillId: SkillId): boolean {
  const config = SKILL_GAME_MAP[skillId];
  if (!config) return false;
  
  // Use custom filter if available
  if (config.factFilter) {
    return config.factFilter(fact);
  }
  
  // Fall back to regex pattern
  if (config.factPattern) {
    return config.factPattern.test(fact);
  }
  
  return false;
}

/**
 * Return all skills whose patterns match the provided fact string.
 */
export function getMatchingSkillsForFact(fact: string): SkillId[] {
  return SKILL_GAME_MAPPING
    .filter((config) => doesFactMatchSkill(fact, config.skillId))
    .map((config) => config.skillId);
}

const SPECIFICITY_FALLBACK = Number.MAX_SAFE_INTEGER;

const getSpecificityTuple = (skillId: SkillId): [number, number, number] => {
  const cfg = SKILL_GAME_MAP[skillId];
  if (!cfg) return [SPECIFICITY_FALLBACK, SPECIFICITY_FALLBACK, SPECIFICITY_FALLBACK];

  const rangeWidth = cfg.numberRange
    ? Math.max(1, cfg.numberRange.max - cfg.numberRange.min)
    : SPECIFICITY_FALLBACK;

  const selectionScope = cfg.selectedNumbers?.length
    ?? cfg.topics?.length
    ?? SPECIFICITY_FALLBACK;

  const factScope = cfg.expectedFactCount ?? SPECIFICITY_FALLBACK;

  return [rangeWidth, selectionScope, factScope];
};

const selectMostSpecificSkill = (
  skillIds: SkillId[],
  targetSubdomain: SkillSubdomain | null
): SkillId | undefined => {
  if (skillIds.length === 0) return undefined;

  const subdomainMatches = targetSubdomain
    ? skillIds.filter((id) => getSkillById(id)?.subdomain === targetSubdomain)
    : skillIds;

  const pool = subdomainMatches.length > 0 ? subdomainMatches : skillIds;

  return [...pool].sort((a, b) => {
    const [aFacts, aTopics, aOps] = getSpecificityTuple(a);
    const [bFacts, bTopics, bOps] = getSpecificityTuple(b);
    if (aFacts !== bFacts) return aFacts - bFacts;
    if (aTopics !== bTopics) return aTopics - bTopics;
    return aOps - bOps;
  })[0];
};

/**
 * Filter mastery records so that only facts belonging to the supplied skill remain.
 * If a fact qualifies for multiple skills, the most specific skill (smallest fact set)
 * retains ownership.
 */
export function filterRecordsForSkill(
  records: MasteryRecord[],
  skillId: SkillId
): MasteryRecord[] {
  const config = SKILL_GAME_MAP[skillId];
  if (!config) return [];

  return records.filter((record) => {
    if (config.operations && !config.operations.includes(record.operation)) {
      return false;
    }

    if (!doesFactMatchSkill(record.fact, skillId)) {
      return false;
    }

    const matchingSkills = getMatchingSkillsForFact(record.fact);
    if (matchingSkills.length <= 1) {
      return true;
    }

    const owner = selectMostSpecificSkill(
      matchingSkills,
      getSkillById(skillId)?.subdomain ?? null
    );
    return owner === skillId;
  });
}

/**
 * Get the expected fact count for a skill
 */
export function getExpectedFactCount(skillId: SkillId): number {
  return SKILL_GAME_MAP[skillId]?.expectedFactCount ?? 0;
}

/**
 * Calculate mastery percentage for a skill based on mastered facts count
 */
export function calculateSkillMasteryPercentage(
  skillId: SkillId,
  masteredFactCount: number
): number {
  const expected = getExpectedFactCount(skillId);
  if (expected === 0) return 0;
  return Math.min(100, Math.round((masteredFactCount / expected) * 100));
}
