/**
 * Math Dash - Curriculum Alignment Data
 * 
 * This file contains the master curriculum data structure for aligning
 * Math Dash with primary-school curricula across NZ, AU, UK, US, and CA.
 * 
 * @see Docs/Cirriculum for the full research and specification
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type SkillId =
  | 'NB10' | 'NB20' | 'NB100' | 'NB_DEC1'          // Number bonds
  | 'ADD_SUB_20' | 'ADD_SUB_100' | 'ADD_SUB_1000'  // Add/sub fluency
  | 'TT_2_5_10' | 'TT_CORE' | 'TT_1_10_ALL' | 'TT_1_12_ALL'  // Times tables
  | 'DIV_2_5_10' | 'DIV_CORE' | 'DIV_1_10_ALL' | 'DIV_1_12_ALL'  // Division
  | 'DBL_10' | 'DBL_20' | 'DBL_100' | 'DBL_3DIG' | 'DBL_DEC'  // Doubles/halves
  | 'SQ_1_10' | 'SQ_1_12';  // Squares

export type SkillDomain = 'number_facts' | 'operations' | 'number_properties';
export type SkillSubdomain = 
  | 'number_bonds' 
  | 'add_sub' 
  | 'multiplication' 
  | 'division' 
  | 'doubles_halves' 
  | 'square_numbers';

export type CountryCode = 'NZ' | 'AU' | 'UK' | 'US' | 'CA';
export type SystemType = 'year' | 'grade';

export interface Skill {
  id: SkillId;
  label: string;
  domain: SkillDomain;
  subdomain: SkillSubdomain;
  description: string;
  numberRange: string;
  gameModes: string[];
}

export interface YearBenchmark {
  label: string;
  ageRange: string;
  coreSkills: SkillId[];
  extensionSkills: SkillId[];
}

export interface CountryConfig {
  label: string;
  systemType: SystemType;
  years: Record<string, YearBenchmark>;
}

export interface CurriculumData {
  version: number;
  skills: Skill[];
  countries: Record<CountryCode, CountryConfig>;
}

// ============================================================================
// Skill Definitions (22 skills total)
// ============================================================================

export const SKILLS: Skill[] = [
  // Number Bonds
  {
    id: 'NB10',
    label: 'Number bonds to 10',
    domain: 'number_facts',
    subdomain: 'number_bonds',
    description: 'Fluent recall of all addition and subtraction pairs where the total is 10 or less (e.g. 7+3, 4+6, 10-7).',
    numberRange: '0-10',
    gameModes: ['number-bonds-10', 'addition', 'subtraction'],
  },
  {
    id: 'NB20',
    label: 'Number bonds to 20',
    domain: 'number_facts',
    subdomain: 'number_bonds',
    description: 'Fluent recall of all addition and subtraction pairs where the total is 20 or less (e.g. 13+7, 18-5).',
    numberRange: '0-20',
    gameModes: ['number-bonds-20', 'addition', 'subtraction'],
  },
  {
    id: 'NB100',
    label: 'Number bonds to 100',
    domain: 'number_facts',
    subdomain: 'number_bonds',
    description: 'Complements to 100 using two-digit numbers (e.g. 47+53, 82+18, 100-64).',
    numberRange: '0-100',
    gameModes: ['number-bonds-100'],
  },
  {
    id: 'NB_DEC1',
    label: 'Decimal number bonds to 1',
    domain: 'number_facts',
    subdomain: 'number_bonds',
    description: 'Complements to 1.0 using decimals to 1 or 2 decimal places (e.g. 0.3+0.7, 0.45+0.55).',
    numberRange: '0.0-1.0',
    gameModes: ['number-bonds-decimal-1'],
  },

  // Addition & Subtraction Fluency
  {
    id: 'ADD_SUB_20',
    label: 'Addition and subtraction within 20',
    domain: 'operations',
    subdomain: 'add_sub',
    description: 'Fluent single-step addition and subtraction where both numbers and results are 20 or less (e.g. 14-6, 7+8, 9+9).',
    numberRange: '0-20',
    gameModes: ['addition', 'subtraction'],
  },
  {
    id: 'ADD_SUB_100',
    label: 'Addition and subtraction within 100',
    domain: 'operations',
    subdomain: 'add_sub',
    description: 'Mental and written addition and subtraction with two-digit numbers (e.g. 45+37, 82-19).',
    numberRange: '0-100',
    gameModes: ['addition', 'subtraction'],
  },
  {
    id: 'ADD_SUB_1000',
    label: 'Addition and subtraction within 1000',
    domain: 'operations',
    subdomain: 'add_sub',
    description: 'Addition and subtraction with three-digit numbers (e.g. 426+175, 900-357). Can be mental or written but evaluated as fact-level fluency.',
    numberRange: '0-1000',
    gameModes: ['addition', 'subtraction'],
  },

  // Multiplication (Times Tables)
  {
    id: 'TT_2_5_10',
    label: 'Times tables: 2, 5 and 10',
    domain: 'operations',
    subdomain: 'multiplication',
    description: 'Recall of single-digit multiplication facts for the 2, 5 and 10 times tables (e.g. 7×2, 6×5, 9×10).',
    numberRange: '1-10',
    gameModes: ['times-tables', 'multiplication'],
  },
  {
    id: 'TT_CORE',
    label: 'Core times tables: 2, 3, 4, 5, 8 and 10',
    domain: 'operations',
    subdomain: 'multiplication',
    description: 'Recall of multiplication facts for the 2, 3, 4, 5, 8 and 10 times tables. These are heavily emphasised across curricula around age 7–8.',
    numberRange: '1-10',
    gameModes: ['times-tables', 'multiplication'],
  },
  {
    id: 'TT_1_10_ALL',
    label: 'All times tables 1 to 10',
    domain: 'operations',
    subdomain: 'multiplication',
    description: 'Recall of all 1×1 to 10×10 multiplication facts.',
    numberRange: '1-10',
    gameModes: ['times-tables', 'multiplication'],
  },
  {
    id: 'TT_1_12_ALL',
    label: 'All times tables 1 to 12',
    domain: 'operations',
    subdomain: 'multiplication',
    description: 'Recall of all 1×1 to 12×12 multiplication facts.',
    numberRange: '1-12',
    gameModes: ['times-tables', 'multiplication'],
  },

  // Division
  {
    id: 'DIV_2_5_10',
    label: 'Division facts: ÷2, ÷5 and ÷10',
    domain: 'operations',
    subdomain: 'division',
    description: 'Division facts that are inverses of the 2, 5 and 10 times tables (e.g. 20÷5, 18÷2, 50÷10).',
    numberRange: 'quotients up to 12',
    gameModes: ['division'],
  },
  {
    id: 'DIV_CORE',
    label: 'Core division facts: ÷2, ÷3, ÷4, ÷5, ÷8 and ÷10',
    domain: 'operations',
    subdomain: 'division',
    description: 'Division facts that are inverses of the 2, 3, 4, 5, 8 and 10 times tables (e.g. 24÷3, 32÷4, 40÷8).',
    numberRange: 'quotients up to 12',
    gameModes: ['division'],
  },
  {
    id: 'DIV_1_10_ALL',
    label: 'All division facts (1–10 tables)',
    domain: 'operations',
    subdomain: 'division',
    description: 'All division facts that correspond to 1×1 to 10×10 multiplication facts, with dividends up to 100.',
    numberRange: 'dividends up to 100',
    gameModes: ['division'],
  },
  {
    id: 'DIV_1_12_ALL',
    label: 'All division facts (1–12 tables)',
    domain: 'operations',
    subdomain: 'division',
    description: 'All division facts that correspond to 1×1 to 12×12 multiplication facts, with dividends up to 144.',
    numberRange: 'dividends up to 144',
    gameModes: ['division'],
  },

  // Doubles & Halves
  {
    id: 'DBL_10',
    label: 'Doubles and halves to 10',
    domain: 'number_facts',
    subdomain: 'doubles_halves',
    description: 'Doubling and halving integers up to 10 (e.g. double 6, half of 8).',
    numberRange: '0-10',
    gameModes: ['doubles-halves'],
  },
  {
    id: 'DBL_20',
    label: 'Doubles and halves to 20',
    domain: 'number_facts',
    subdomain: 'doubles_halves',
    description: 'Doubling and halving integers up to 20 (e.g. double 15, half of 18).',
    numberRange: '0-20',
    gameModes: ['doubles-halves'],
  },
  {
    id: 'DBL_100',
    label: 'Doubles and halves of 2-digit numbers',
    domain: 'number_facts',
    subdomain: 'doubles_halves',
    description: 'Doubling and halving two-digit numbers, often multiples of 2, 5, or 10 (e.g. 24, 36, 45, 80).',
    numberRange: '10-99',
    gameModes: ['doubles-2digit'],
  },
  {
    id: 'DBL_3DIG',
    label: 'Doubles and halves of 3-digit numbers',
    domain: 'number_facts',
    subdomain: 'doubles_halves',
    description: 'Doubling and halving three-digit numbers (e.g. 144, 250, 360).',
    numberRange: '100-999',
    gameModes: ['doubles-3digit'],
  },
  {
    id: 'DBL_DEC',
    label: 'Doubles and halves of decimal numbers',
    domain: 'number_facts',
    subdomain: 'doubles_halves',
    description: 'Doubling and halving decimal numbers to one or two decimal places (e.g. 3.5, 0.75, 4.2).',
    numberRange: '0.0-100.0',
    gameModes: ['doubles-decimal'],
  },

  // Square Numbers
  {
    id: 'SQ_1_10',
    label: 'Square numbers 1² to 10²',
    domain: 'number_properties',
    subdomain: 'square_numbers',
    description: 'Recognising and recalling perfect squares from 1² up to 10² (1, 4, 9, ..., 100).',
    numberRange: '1-100',
    gameModes: ['squares'],
  },
  {
    id: 'SQ_1_12',
    label: 'Square numbers 1² to 12²',
    domain: 'number_properties',
    subdomain: 'square_numbers',
    description: 'Recognising and recalling perfect squares from 1² up to 12² (1, 4, 9, ..., 144).',
    numberRange: '1-144',
    gameModes: ['squares'],
  },
];

// ============================================================================
// Country & Year/Grade Benchmark Mappings
// ============================================================================

export const COUNTRY_BENCHMARKS: Record<CountryCode, CountryConfig> = {
  NZ: {
    label: 'New Zealand',
    systemType: 'year',
    years: {
      Y1: {
        label: 'Year 1',
        ageRange: '5-6',
        coreSkills: ['NB10', 'ADD_SUB_20', 'DBL_10'],
        extensionSkills: ['NB20', 'DBL_20'],
      },
      Y2: {
        label: 'Year 2',
        ageRange: '6-7',
        coreSkills: ['NB20', 'ADD_SUB_100', 'DBL_20', 'TT_2_5_10', 'DIV_2_5_10'],
        extensionSkills: ['NB100', 'TT_CORE', 'DBL_100'],
      },
      Y3: {
        label: 'Year 3',
        ageRange: '7-8',
        coreSkills: ['ADD_SUB_1000', 'NB100', 'DBL_100', 'TT_2_5_10', 'TT_CORE', 'DIV_2_5_10', 'DIV_CORE'],
        extensionSkills: ['TT_1_10_ALL', 'DIV_1_10_ALL', 'DBL_3DIG'],
      },
      Y4: {
        label: 'Year 4',
        ageRange: '8-9',
        coreSkills: ['TT_1_10_ALL', 'DIV_1_10_ALL', 'ADD_SUB_1000', 'DBL_3DIG'],
        extensionSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'DBL_DEC'],
      },
      Y5: {
        label: 'Year 5',
        ageRange: '9-10',
        coreSkills: ['TT_1_10_ALL', 'ADD_SUB_1000', 'NB_DEC1', 'DBL_DEC'],
        extensionSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'SQ_1_10'],
      },
      Y6: {
        label: 'Year 6',
        ageRange: '10-11',
        coreSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'ADD_SUB_1000', 'DBL_DEC', 'SQ_1_10'],
        extensionSkills: ['SQ_1_12'],
      },
      Y7: {
        label: 'Year 7',
        ageRange: '11-12',
        coreSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'ADD_SUB_1000', 'DBL_DEC', 'SQ_1_10', 'SQ_1_12'],
        extensionSkills: ['DBL_3DIG'],
      },
      Y8: {
        label: 'Year 8',
        ageRange: '12-13',
        coreSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'ADD_SUB_1000', 'DBL_DEC', 'SQ_1_12'],
        extensionSkills: [],
      },
    },
  },

  AU: {
    label: 'Australia',
    systemType: 'year',
    years: {
      F: {
        label: 'Foundation',
        ageRange: '5-6',
        coreSkills: ['NB10', 'ADD_SUB_20', 'DBL_10'],
        extensionSkills: ['NB20'],
      },
      Y1: {
        label: 'Year 1',
        ageRange: '6-7',
        coreSkills: ['NB10', 'ADD_SUB_20', 'DBL_10'],
        extensionSkills: ['NB20'],
      },
      Y2: {
        label: 'Year 2',
        ageRange: '7-8',
        coreSkills: ['NB20', 'ADD_SUB_100', 'DBL_20', 'TT_2_5_10', 'DIV_2_5_10'],
        extensionSkills: ['NB100', 'TT_CORE', 'DBL_100'],
      },
      Y3: {
        label: 'Year 3',
        ageRange: '8-9',
        coreSkills: ['NB100', 'ADD_SUB_1000', 'DBL_100', 'TT_CORE', 'DIV_CORE'],
        extensionSkills: ['TT_1_10_ALL', 'DIV_1_10_ALL', 'DBL_3DIG'],
      },
      Y4: {
        label: 'Year 4',
        ageRange: '9-10',
        coreSkills: ['TT_1_10_ALL', 'DIV_1_10_ALL', 'ADD_SUB_1000', 'DBL_3DIG'],
        extensionSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'DBL_DEC', 'SQ_1_10'],
      },
      Y5: {
        label: 'Year 5',
        ageRange: '10-11',
        coreSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'DBL_DEC', 'SQ_1_10'],
        extensionSkills: ['SQ_1_12'],
      },
      Y6: {
        label: 'Year 6',
        ageRange: '11-12',
        coreSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'ADD_SUB_1000', 'DBL_DEC', 'SQ_1_12'],
        extensionSkills: [],
      },
    },
  },

  UK: {
    label: 'United Kingdom (England)',
    systemType: 'year',
    years: {
      Y1: {
        label: 'Year 1',
        ageRange: '5-6',
        coreSkills: ['NB10', 'ADD_SUB_20', 'DBL_10'],
        extensionSkills: ['NB20', 'DBL_20'],
      },
      Y2: {
        label: 'Year 2',
        ageRange: '6-7',
        coreSkills: ['NB20', 'ADD_SUB_100', 'DBL_20', 'TT_2_5_10', 'DIV_2_5_10'],
        extensionSkills: ['NB100', 'TT_CORE'],
      },
      Y3: {
        label: 'Year 3',
        ageRange: '7-8',
        coreSkills: ['ADD_SUB_1000', 'NB100', 'DBL_100', 'TT_CORE', 'DIV_CORE'],
        extensionSkills: ['TT_1_10_ALL', 'DIV_1_10_ALL', 'DBL_3DIG'],
      },
      Y4: {
        label: 'Year 4',
        ageRange: '8-9',
        coreSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'ADD_SUB_1000', 'DBL_3DIG'],
        extensionSkills: ['NB_DEC1', 'DBL_DEC', 'SQ_1_10'],
      },
      Y5: {
        label: 'Year 5',
        ageRange: '9-10',
        coreSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'DBL_DEC', 'SQ_1_10'],
        extensionSkills: ['SQ_1_12'],
      },
      Y6: {
        label: 'Year 6',
        ageRange: '10-11',
        coreSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL', 'NB_DEC1', 'ADD_SUB_1000', 'DBL_DEC', 'SQ_1_12'],
        extensionSkills: [],
      },
    },
  },

  US: {
    label: 'United States',
    systemType: 'grade',
    years: {
      K: {
        label: 'Kindergarten',
        ageRange: '5-6',
        coreSkills: ['NB10', 'ADD_SUB_20', 'DBL_10'],
        extensionSkills: ['NB20'],
      },
      G1: {
        label: 'Grade 1',
        ageRange: '6-7',
        coreSkills: ['NB10', 'NB20', 'ADD_SUB_20', 'DBL_10', 'DBL_20'],
        extensionSkills: ['TT_2_5_10'],
      },
      G2: {
        label: 'Grade 2',
        ageRange: '7-8',
        coreSkills: ['NB20', 'ADD_SUB_100', 'DBL_20', 'DBL_100'],
        extensionSkills: ['NB100', 'TT_2_5_10', 'TT_CORE'],
      },
      G3: {
        label: 'Grade 3',
        ageRange: '8-9',
        coreSkills: ['NB100', 'ADD_SUB_1000', 'DBL_100', 'TT_1_10_ALL', 'DIV_1_10_ALL'],
        extensionSkills: ['DBL_3DIG', 'TT_1_12_ALL', 'DIV_1_12_ALL'],
      },
      G4: {
        label: 'Grade 4',
        ageRange: '9-10',
        coreSkills: ['ADD_SUB_1000', 'TT_1_10_ALL', 'DIV_1_10_ALL', 'DBL_3DIG', 'NB_DEC1', 'DBL_DEC'],
        extensionSkills: ['SQ_1_10', 'TT_1_12_ALL', 'DIV_1_12_ALL'],
      },
      G5: {
        label: 'Grade 5',
        ageRange: '10-11',
        coreSkills: ['ADD_SUB_1000', 'TT_1_10_ALL', 'DIV_1_10_ALL', 'NB_DEC1', 'DBL_DEC', 'SQ_1_10'],
        extensionSkills: ['SQ_1_12', 'TT_1_12_ALL', 'DIV_1_12_ALL'],
      },
    },
  },

  CA: {
    label: 'Canada (Ontario)',
    systemType: 'grade',
    years: {
      K: {
        label: 'Kindergarten',
        ageRange: '5-6',
        coreSkills: ['NB10', 'ADD_SUB_20', 'DBL_10'],
        extensionSkills: ['NB20'],
      },
      G1: {
        label: 'Grade 1',
        ageRange: '6-7',
        coreSkills: ['NB10', 'ADD_SUB_20', 'DBL_10'],
        extensionSkills: ['NB20'],
      },
      G2: {
        label: 'Grade 2',
        ageRange: '7-8',
        coreSkills: ['NB20', 'ADD_SUB_100', 'DBL_20', 'DBL_100'],
        extensionSkills: ['NB100', 'TT_2_5_10'],
      },
      G3: {
        label: 'Grade 3',
        ageRange: '8-9',
        coreSkills: ['NB100', 'ADD_SUB_1000', 'DBL_100', 'TT_2_5_10'],
        extensionSkills: ['TT_CORE', 'TT_1_10_ALL', 'DIV_2_5_10'],
      },
      G4: {
        label: 'Grade 4',
        ageRange: '9-10',
        coreSkills: ['ADD_SUB_1000', 'TT_1_10_ALL', 'DIV_1_10_ALL', 'DBL_3DIG'],
        extensionSkills: ['NB_DEC1', 'DBL_DEC', 'SQ_1_10', 'TT_1_12_ALL', 'DIV_1_12_ALL'],
      },
      G5: {
        label: 'Grade 5',
        ageRange: '10-11',
        coreSkills: ['TT_1_10_ALL', 'DIV_1_10_ALL', 'NB_DEC1', 'DBL_DEC', 'SQ_1_10'],
        extensionSkills: ['SQ_1_12', 'TT_1_12_ALL', 'DIV_1_12_ALL'],
      },
      G6: {
        label: 'Grade 6',
        ageRange: '11-12',
        coreSkills: ['TT_1_10_ALL', 'DIV_1_10_ALL', 'NB_DEC1', 'ADD_SUB_1000', 'DBL_DEC', 'SQ_1_12'],
        extensionSkills: ['TT_1_12_ALL', 'DIV_1_12_ALL'],
      },
    },
  },
};

// ============================================================================
// Combined Curriculum Data Export
// ============================================================================

export const CURRICULUM_DATA: CurriculumData = {
  version: 1,
  skills: SKILLS,
  countries: COUNTRY_BENCHMARKS,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a skill by its ID
 */
export function getSkillById(skillId: SkillId): Skill | undefined {
  return SKILLS.find((s) => s.id === skillId);
}

/**
 * Get all skills in a specific domain
 */
export function getSkillsByDomain(domain: SkillDomain): Skill[] {
  return SKILLS.filter((s) => s.domain === domain);
}

/**
 * Get all skills in a specific subdomain
 */
export function getSkillsBySubdomain(subdomain: SkillSubdomain): Skill[] {
  return SKILLS.filter((s) => s.subdomain === subdomain);
}

/**
 * Get the benchmark for a specific country and year/grade
 */
export function getBenchmark(country: CountryCode, yearGrade: string): YearBenchmark | undefined {
  return COUNTRY_BENCHMARKS[country]?.years[yearGrade];
}

/**
 * Get all year/grade keys for a country
 */
export function getYearGradeKeys(country: CountryCode): string[] {
  return Object.keys(COUNTRY_BENCHMARKS[country]?.years || {});
}

/**
 * Check if a skill is a core skill for a given country and year
 */
export function isCoreSkill(country: CountryCode, yearGrade: string, skillId: SkillId): boolean {
  const benchmark = getBenchmark(country, yearGrade);
  return benchmark?.coreSkills.includes(skillId) ?? false;
}

/**
 * Check if a skill is an extension skill for a given country and year
 */
export function isExtensionSkill(country: CountryCode, yearGrade: string, skillId: SkillId): boolean {
  const benchmark = getBenchmark(country, yearGrade);
  return benchmark?.extensionSkills.includes(skillId) ?? false;
}

/**
 * Get all skills (core + extension) for a country and year
 */
export function getAllSkillsForBenchmark(country: CountryCode, yearGrade: string): SkillId[] {
  const benchmark = getBenchmark(country, yearGrade);
  if (!benchmark) return [];
  return [...benchmark.coreSkills, ...benchmark.extensionSkills];
}
