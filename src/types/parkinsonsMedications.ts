// ==========================================
// PARKINSON'S DISEASE MEDICATION DATABASE
// Australian Commercial Preparations
// ==========================================

export type PDMedicationCategory =
  | 'levodopa-combination'
  | 'dopamine-agonist'
  | 'mao-b-inhibitor'
  | 'comt-inhibitor'
  | 'anticholinergic'
  | 'amantadine';

export type FormulationType =
  | 'immediate-release'
  | 'controlled-release'
  | 'dispersible'
  | 'capsule'
  | 'tablet'
  | 'patch';

export interface PDPreparation {
  id: string;
  brandName: string;
  genericName: string;
  strength: number;           // Primary active ingredient strength
  strengthSecondary?: number; // e.g., carbidopa in Sinemet
  unit: 'mg' | 'mcg';
  formulation: FormulationType;
  canBeHalved: boolean;       // Pre-determined based on formulation
  pbsListed: boolean;
  containerQuantity?: number; // Number of tablets/capsules per pack (for box estimates)
  notes?: string;             // e.g., "Score line present"
}

export interface PDMedication {
  id: string;
  genericName: string;
  category: PDMedicationCategory;
  preparations: PDPreparation[];
  titrationGuidance?: string;
  maxDailyDose?: number;
  typicalStartingDose?: number;
  typicalMaintenanceDose?: string;
}

// ==========================================
// CATEGORY DISPLAY LABELS
// ==========================================

export const PD_CATEGORY_LABELS: Record<PDMedicationCategory, string> = {
  'levodopa-combination': 'Levodopa Combinations',
  'dopamine-agonist': 'Dopamine Agonists',
  'mao-b-inhibitor': 'MAO-B Inhibitors',
  'comt-inhibitor': 'COMT Inhibitors',
  'anticholinergic': 'Anticholinergics',
  'amantadine': 'Amantadine',
};

// ==========================================
// AUSTRALIAN COMMERCIAL PREPARATIONS
// ==========================================

export const PARKINSONS_MEDICATIONS: PDMedication[] = [
  // LEVODOPA COMBINATIONS
  {
    id: 'levodopa-carbidopa',
    genericName: 'Levodopa/Carbidopa',
    category: 'levodopa-combination',
    titrationGuidance: 'Start low, titrate slowly. Increase by ½-1 tablet every 3-7 days as tolerated.',
    maxDailyDose: 2000, // levodopa component
    typicalStartingDose: 50, // levodopa
    typicalMaintenanceDose: '300-600mg levodopa/day in divided doses',
    preparations: [
      // Sinemet IR
      { id: 'sinemet-50-12.5', brandName: 'Sinemet', genericName: 'Levodopa/Carbidopa', strength: 50, strengthSecondary: 12.5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100, notes: 'Scored tablet' },
      { id: 'sinemet-100-25', brandName: 'Sinemet', genericName: 'Levodopa/Carbidopa', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100, notes: 'Scored tablet' },
      { id: 'sinemet-250-25', brandName: 'Sinemet', genericName: 'Levodopa/Carbidopa', strength: 250, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100, notes: 'Scored tablet' },
      // Sinemet CR
      { id: 'sinemet-cr-200-50', brandName: 'Sinemet CR', genericName: 'Levodopa/Carbidopa CR', strength: 200, strengthSecondary: 50, unit: 'mg', formulation: 'controlled-release', canBeHalved: true, pbsListed: true, containerQuantity: 60, notes: 'Can be halved but not crushed' },
      { id: 'sinemet-cr-100-25', brandName: 'Sinemet CR', genericName: 'Levodopa/Carbidopa CR', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'controlled-release', canBeHalved: true, pbsListed: true, containerQuantity: 60, notes: 'Can be halved but not crushed' },
      // Kinson
      { id: 'kinson-50-12.5', brandName: 'Kinson', genericName: 'Levodopa/Carbidopa', strength: 50, strengthSecondary: 12.5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
      { id: 'kinson-100-25', brandName: 'Kinson', genericName: 'Levodopa/Carbidopa', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
      { id: 'kinson-250-25', brandName: 'Kinson', genericName: 'Levodopa/Carbidopa', strength: 250, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
    ]
  },
  {
    id: 'levodopa-benserazide',
    genericName: 'Levodopa/Benserazide',
    category: 'levodopa-combination',
    titrationGuidance: 'Start with 50mg levodopa 1-2 times daily, increase gradually.',
    maxDailyDose: 1600,
    typicalStartingDose: 50,
    typicalMaintenanceDose: '400-800mg levodopa/day',
    preparations: [
      // Madopar
      { id: 'madopar-50-12.5', brandName: 'Madopar', genericName: 'Levodopa/Benserazide', strength: 50, strengthSecondary: 12.5, unit: 'mg', formulation: 'dispersible', canBeHalved: false, pbsListed: true, containerQuantity: 100, notes: 'Dispersible - cannot be halved' },
      { id: 'madopar-100-25', brandName: 'Madopar', genericName: 'Levodopa/Benserazide', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'capsule', canBeHalved: false, pbsListed: true, containerQuantity: 100, notes: 'Capsule - cannot be halved' },
      { id: 'madopar-200-50', brandName: 'Madopar', genericName: 'Levodopa/Benserazide', strength: 200, strengthSecondary: 50, unit: 'mg', formulation: 'capsule', canBeHalved: false, pbsListed: true, containerQuantity: 100, notes: 'Capsule - cannot be halved' },
      // Madopar HBS (CR)
      { id: 'madopar-hbs-100-25', brandName: 'Madopar HBS', genericName: 'Levodopa/Benserazide CR', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true, containerQuantity: 100, notes: 'Controlled release capsule - swallow whole' },
    ]
  },
  {
    id: 'levodopa-carbidopa-entacapone',
    genericName: 'Levodopa/Carbidopa/Entacapone',
    category: 'levodopa-combination',
    titrationGuidance: 'Switch from Sinemet + Comtan. Do not halve tablets.',
    preparations: [
      // Stalevo
      { id: 'stalevo-50', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 50, strengthSecondary: 12.5, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 100, notes: 'Film-coated - do not halve' },
      { id: 'stalevo-75', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 75, strengthSecondary: 18.75, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 100 },
      { id: 'stalevo-100', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 100 },
      { id: 'stalevo-125', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 125, strengthSecondary: 31.25, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 100 },
      { id: 'stalevo-150', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 150, strengthSecondary: 37.5, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 100 },
      { id: 'stalevo-200', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 200, strengthSecondary: 50, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 100 },
    ]
  },

  // DOPAMINE AGONISTS
  {
    id: 'pramipexole',
    genericName: 'Pramipexole',
    category: 'dopamine-agonist',
    titrationGuidance: 'Slow titration essential. Start 0.125mg TDS, increase every 5-7 days.',
    maxDailyDose: 3.15, // immediate release
    typicalStartingDose: 0.125,
    typicalMaintenanceDose: '0.375-1.5mg TDS',
    preparations: [
      // Sifrol IR
      { id: 'sifrol-0.125', brandName: 'Sifrol', genericName: 'Pramipexole', strength: 0.125, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100, notes: 'Base equivalent - scored' },
      { id: 'sifrol-0.25', brandName: 'Sifrol', genericName: 'Pramipexole', strength: 0.25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
      { id: 'sifrol-0.5', brandName: 'Sifrol', genericName: 'Pramipexole', strength: 0.5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
      { id: 'sifrol-1', brandName: 'Sifrol', genericName: 'Pramipexole', strength: 1, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
      // Sifrol ER
      { id: 'sifrol-er-0.375', brandName: 'Sifrol ER', genericName: 'Pramipexole ER', strength: 0.375, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true, containerQuantity: 30, notes: 'Extended release - swallow whole' },
      { id: 'sifrol-er-0.75', brandName: 'Sifrol ER', genericName: 'Pramipexole ER', strength: 0.75, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true, containerQuantity: 30 },
      { id: 'sifrol-er-1.5', brandName: 'Sifrol ER', genericName: 'Pramipexole ER', strength: 1.5, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true, containerQuantity: 30 },
      { id: 'sifrol-er-3', brandName: 'Sifrol ER', genericName: 'Pramipexole ER', strength: 3, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true, containerQuantity: 30 },
    ]
  },
  {
    id: 'ropinirole',
    genericName: 'Ropinirole',
    category: 'dopamine-agonist',
    titrationGuidance: 'Start 0.25mg TDS, increase by 0.25mg TDS weekly.',
    maxDailyDose: 24,
    typicalStartingDose: 0.25,
    typicalMaintenanceDose: '3-9mg/day in divided doses',
    preparations: [
      // Repreve IR
      { id: 'repreve-0.25', brandName: 'Repreve', genericName: 'Ropinirole', strength: 0.25, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 84, notes: 'Film-coated' },
      { id: 'repreve-0.5', brandName: 'Repreve', genericName: 'Ropinirole', strength: 0.5, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 84 },
      { id: 'repreve-1', brandName: 'Repreve', genericName: 'Ropinirole', strength: 1, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 84 },
      { id: 'repreve-2', brandName: 'Repreve', genericName: 'Ropinirole', strength: 2, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 84 },
      { id: 'repreve-5', brandName: 'Repreve', genericName: 'Ropinirole', strength: 5, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 84 },
    ]
  },
  {
    id: 'rotigotine',
    genericName: 'Rotigotine',
    category: 'dopamine-agonist',
    titrationGuidance: 'Start 2mg/24h patch, increase by 2mg weekly to max 8mg (early PD) or 16mg (advanced).',
    maxDailyDose: 16,
    typicalStartingDose: 2,
    preparations: [
      { id: 'neupro-2', brandName: 'Neupro', genericName: 'Rotigotine', strength: 2, unit: 'mg', formulation: 'patch', canBeHalved: false, pbsListed: true, containerQuantity: 28, notes: 'Transdermal patch - 24 hour' },
      { id: 'neupro-4', brandName: 'Neupro', genericName: 'Rotigotine', strength: 4, unit: 'mg', formulation: 'patch', canBeHalved: false, pbsListed: true, containerQuantity: 28 },
      { id: 'neupro-6', brandName: 'Neupro', genericName: 'Rotigotine', strength: 6, unit: 'mg', formulation: 'patch', canBeHalved: false, pbsListed: true, containerQuantity: 28 },
      { id: 'neupro-8', brandName: 'Neupro', genericName: 'Rotigotine', strength: 8, unit: 'mg', formulation: 'patch', canBeHalved: false, pbsListed: true, containerQuantity: 28 },
    ]
  },

  // MAO-B INHIBITORS
  {
    id: 'rasagiline',
    genericName: 'Rasagiline',
    category: 'mao-b-inhibitor',
    titrationGuidance: 'Fixed dose 1mg daily. No titration required.',
    maxDailyDose: 1,
    typicalStartingDose: 1,
    preparations: [
      { id: 'azilect-1', brandName: 'Azilect', genericName: 'Rasagiline', strength: 1, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 28 },
    ]
  },
  {
    id: 'selegiline',
    genericName: 'Selegiline',
    category: 'mao-b-inhibitor',
    titrationGuidance: 'Start 5mg mane, may add 5mg lunch if needed. Avoid evening doses.',
    maxDailyDose: 10,
    typicalStartingDose: 5,
    preparations: [
      { id: 'eldepryl-5', brandName: 'Eldepryl', genericName: 'Selegiline', strength: 5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 60 },
    ]
  },
  {
    id: 'safinamide',
    genericName: 'Safinamide',
    category: 'mao-b-inhibitor',
    titrationGuidance: 'Start 50mg daily, may increase to 100mg after 4 weeks.',
    maxDailyDose: 100,
    typicalStartingDose: 50,
    preparations: [
      { id: 'xadago-50', brandName: 'Xadago', genericName: 'Safinamide', strength: 50, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 30, notes: 'Film-coated' },
      { id: 'xadago-100', brandName: 'Xadago', genericName: 'Safinamide', strength: 100, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 30 },
    ]
  },

  // COMT INHIBITORS
  {
    id: 'entacapone',
    genericName: 'Entacapone',
    category: 'comt-inhibitor',
    titrationGuidance: 'Give with each levodopa dose. Fixed 200mg per dose.',
    maxDailyDose: 2000, // Up to 10 doses
    typicalStartingDose: 200,
    preparations: [
      { id: 'comtan-200', brandName: 'Comtan', genericName: 'Entacapone', strength: 200, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, containerQuantity: 100, notes: 'Film-coated - take with each levodopa dose' },
    ]
  },
  {
    id: 'opicapone',
    genericName: 'Opicapone',
    category: 'comt-inhibitor',
    titrationGuidance: 'Once daily at bedtime, separate from levodopa by 1 hour.',
    maxDailyDose: 50,
    typicalStartingDose: 50,
    preparations: [
      { id: 'ongentys-50', brandName: 'Ongentys', genericName: 'Opicapone', strength: 50, unit: 'mg', formulation: 'capsule', canBeHalved: false, pbsListed: true, containerQuantity: 30, notes: 'Take at bedtime, 1hr before/after levodopa' },
    ]
  },

  // ANTICHOLINERGICS
  {
    id: 'benztropine',
    genericName: 'Benztropine',
    category: 'anticholinergic',
    titrationGuidance: 'Start low, titrate slowly. Caution in elderly.',
    maxDailyDose: 6,
    typicalStartingDose: 0.5,
    preparations: [
      { id: 'benztrop-2', brandName: 'Benztrop', genericName: 'Benztropine', strength: 2, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
    ]
  },
  {
    id: 'trihexyphenidyl',
    genericName: 'Trihexyphenidyl',
    category: 'anticholinergic',
    titrationGuidance: 'Start 1mg daily, increase by 2mg every 3-5 days.',
    maxDailyDose: 15,
    typicalStartingDose: 1,
    preparations: [
      { id: 'artane-2', brandName: 'Artane', genericName: 'Trihexyphenidyl', strength: 2, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
      { id: 'artane-5', brandName: 'Artane', genericName: 'Trihexyphenidyl', strength: 5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, containerQuantity: 100 },
    ]
  },

  // AMANTADINE
  {
    id: 'amantadine',
    genericName: 'Amantadine',
    category: 'amantadine',
    titrationGuidance: 'Start 100mg daily, may increase to 100mg BD. Avoid evening doses.',
    maxDailyDose: 400,
    typicalStartingDose: 100,
    preparations: [
      { id: 'symmetrel-100', brandName: 'Symmetrel', genericName: 'Amantadine', strength: 100, unit: 'mg', formulation: 'capsule', canBeHalved: false, pbsListed: true, containerQuantity: 100 },
    ]
  },
];

// ==========================================
// TIME SLOT CONFIGURATION
// ==========================================

export interface PDTimeSlot {
  id: string;
  label: string;           // User-defined label, e.g., "6am", "Before breakfast"
  order: number;           // Display order
  defaultTime?: string;    // Optional time hint, e.g., "06:00"
}

export const DEFAULT_PD_TIME_SLOTS: PDTimeSlot[] = [
  { id: 'slot1', label: '6am', order: 1, defaultTime: '06:00' },
  { id: 'slot2', label: '9am', order: 2, defaultTime: '09:00' },
  { id: 'slot3', label: '12pm', order: 3, defaultTime: '12:00' },
  { id: 'slot4', label: '3pm', order: 4, defaultTime: '15:00' },
  { id: 'slot5', label: '6pm', order: 5, defaultTime: '18:00' },
  { id: 'slot6', label: '9pm', order: 6, defaultTime: '21:00' },
];

// ==========================================
// DOSE ENTRY TYPES
// ==========================================

export type SlotTitrationMode = 'hold-steady' | 'titrate';

export interface PDSlotDose {
  slotId: string;
  tabletCount: number;     // 0, 0.5, 1, 1.5, 2, etc.
  titrationMode: SlotTitrationMode;  // Whether this slot participates in titration
  titrationOrder?: number; // Order in which this slot gets titrated (1, 2, 3, etc.) - multiple slots can share the same order
  minTablets?: number;     // Floor - minimum tablets for this slot (for decreasing titrations)
  maxTablets?: number;     // Ceiling - maximum tablets for this slot (for increasing titrations)
}

export interface PDDayDose {
  date: Date;
  slotDoses: PDSlotDose[];
  totalDose: number;       // Calculated mg
  totalTablets: number;    // Sum of tablet counts
}

// ==========================================
// TITRATION CONFIGURATION
// ==========================================

export type TitrationDirection = 'increase' | 'decrease' | 'maintain';

export interface PDTitrationConfig {
  // Starting configuration
  startingSlotDoses: PDSlotDose[];

  // Target (optional - for "optimise" mode)
  targetSlotDoses?: PDSlotDose[];

  // Titration rules
  titrationDirection: TitrationDirection;
  changeAmount: number;              // In tablets (0.5, 1, etc.)
  intervalDays: number;              // Days between changes

  // Sequential titration order
  titrationSequence: string[];       // Slot IDs in order of change
  incrementsPerSlot: number;         // How many changes before moving to next slot

  // Constraints
  maxTabletsPerDose: number;         // Default 3
  maxTotalDailyTablets?: number;
  minimumTabletCount?: number;       // For decrease, typically 0
}

// ==========================================
// OPTIMIZATION PREFERENCES
// ==========================================

export interface PDOptimizationPrefs {
  minimizeStrengthVariety: boolean;  // Prefer fewer different strengths
  maxTabletsPerDose: number;         // Hard limit (default 3)
  allowHalves: boolean;              // Global override
  preferEvenDistribution: boolean;   // Try to spread doses evenly
}

// ==========================================
// SINGLE MEDICATION SCHEDULE
// ==========================================

export interface PDSchedule {
  id: string;
  medication: PDMedication;
  selectedPreparation: PDPreparation;

  // Time slots
  timeSlots: PDTimeSlot[];

  // Schedule settings
  startDate: Date;
  endDate?: Date;

  // Schedule mode
  scheduleMode: 'hold-steady' | 'titrating' | 'discontinuing';

  // For hold-steady: fixed doses
  steadySlotDoses?: PDSlotDose[];

  // For titrating/discontinuing: titration config
  titrationConfig?: PDTitrationConfig;

  // Manual or optimized
  isOptimized: boolean;
  optimizationPrefs?: PDOptimizationPrefs;

  // Calculated doses (populated by calculator)
  calculatedDoses?: PDDayDose[];
}

// ==========================================
// MULTI-MEDICATION REGIMEN TYPES
// ==========================================

export type MedicationRelationship =
  | 'independent'      // No interaction - each follows its own schedule
  | 'cross-titration'  // One increases as another decreases (switch)
  | 'sequential'       // One completes before next begins
  | 'synchronized';    // Changes happen on same days

export interface PDRegimenMedication {
  id: string;
  medication: PDMedication;
  selectedPreparation: PDPreparation;

  // Schedule mode for this medication
  scheduleMode: 'hold-steady' | 'titrating' | 'discontinuing';

  // For hold-steady: fixed doses
  steadySlotDoses?: PDSlotDose[];

  // For titrating: full titration config
  titrationConfig?: PDTitrationConfig;

  // For discontinuing: taper config (same structure, direction = 'decrease')
  taperConfig?: PDTitrationConfig;

  // Display settings
  color: string;  // For visual distinction in views
  displayOrder: number;
}

export interface CrossTitrationLink {
  id: string;

  // The medication being introduced/increased
  increasingMedId: string;

  // The medication being reduced/discontinued
  decreasingMedId: string;

  // Synchronization mode
  syncMode:
    | 'same-day'           // Both change on same days
    | 'alternating'        // Alternate: increase Mon, decrease Thu
    | 'offset-days';       // Decrease happens N days after increase

  offsetDays?: number;     // For 'offset-days' mode

  // Ratio (optional) - e.g., for every 1 tablet increase, decrease by 0.5
  ratio?: {
    increaseAmount: number;
    decreaseAmount: number;
  };
}

export interface PDRegimen {
  id: string;
  name: string;                      // e.g., "Dopamine Agonist to Levodopa Switch"
  description?: string;

  // Patient info (optional)
  patientName?: string;
  patientDOB?: Date;

  // Shared time slots across all medications
  timeSlots: PDTimeSlot[];

  // Date range for the regimen
  startDate: Date;
  endDate?: Date;

  // All medications in this regimen
  medications: PDRegimenMedication[];

  // Cross-titration relationships (if any)
  crossTitrationLinks: CrossTitrationLink[];

  // Global settings
  allowHalves: boolean;
  maxTabletsPerDose: number;

  // Calculated combined schedule (populated by calculator)
  calculatedSchedule?: PDRegimenDayDose[];
}

export type DoseChangeType = 'increased' | 'decreased' | 'unchanged' | 'started' | 'stopped';

export interface PDRegimenMedicationDayDose {
  medicationId: string;
  medicationName: string;
  preparationName: string;
  color: string;
  slotDoses: PDSlotDose[];
  totalDose: number;
  totalTablets: number;
  changeFromYesterday: DoseChangeType;
}

export interface PDRegimenDayDose {
  date: Date;

  // Doses per medication
  medicationDoses: PDRegimenMedicationDayDose[];

  // Combined daily totals (useful for levodopa equivalent calculations)
  combinedTotals?: {
    totalLevodopa?: number;        // Sum of all levodopa sources
    totalDopamineAgonist?: number; // In levodopa equivalents
    totalLED?: number;             // Total levodopa equivalent dose
  };
}

// ==========================================
// REGIMEN TEMPLATES
// ==========================================

export type RegimenTemplate =
  | 'single-med-titration'           // Just one medication titrating
  | 'add-adjunct-hold-primary'       // Add COMT/MAO-B while levodopa stays steady
  | 'switch-agonist-to-levodopa'     // Cross-titration: decrease agonist, increase levodopa
  | 'switch-levodopa-formulation'    // IR to CR, or add Stalevo
  | 'reduce-for-side-effects'        // Decrease one, may increase another
  | 'custom';                        // User-defined

export interface RegimenTemplateRole {
  role: 'primary' | 'adjunct' | 'introducing' | 'discontinuing';
  suggestedCategories: PDMedicationCategory[];
  scheduleMode: 'hold-steady' | 'titrating' | 'discontinuing';
  description?: string;
}

export interface RegimenTemplateConfig {
  id: RegimenTemplate;
  name: string;
  description: string;
  roles: RegimenTemplateRole[];
  hasCrossTitration: boolean;
}

export const REGIMEN_TEMPLATES: RegimenTemplateConfig[] = [
  {
    id: 'single-med-titration',
    name: 'Single Medication Titration',
    description: 'Titrate one medication up or down',
    roles: [
      {
        role: 'primary',
        suggestedCategories: ['levodopa-combination', 'dopamine-agonist'],
        scheduleMode: 'titrating',
        description: 'The medication being titrated'
      }
    ],
    hasCrossTitration: false,
  },
  {
    id: 'add-adjunct-hold-primary',
    name: 'Add Adjunct Therapy',
    description: 'Introduce a new medication while keeping existing therapy steady',
    roles: [
      {
        role: 'primary',
        suggestedCategories: ['levodopa-combination'],
        scheduleMode: 'hold-steady',
        description: 'Existing therapy to maintain'
      },
      {
        role: 'adjunct',
        suggestedCategories: ['comt-inhibitor', 'mao-b-inhibitor'],
        scheduleMode: 'titrating',
        description: 'New medication being added'
      }
    ],
    hasCrossTitration: false,
  },
  {
    id: 'switch-agonist-to-levodopa',
    name: 'Dopamine Agonist to Levodopa Switch',
    description: 'Gradually replace dopamine agonist with levodopa',
    roles: [
      {
        role: 'discontinuing',
        suggestedCategories: ['dopamine-agonist'],
        scheduleMode: 'discontinuing',
        description: 'Dopamine agonist being reduced'
      },
      {
        role: 'introducing',
        suggestedCategories: ['levodopa-combination'],
        scheduleMode: 'titrating',
        description: 'Levodopa being introduced'
      }
    ],
    hasCrossTitration: true,
  },
  {
    id: 'switch-levodopa-formulation',
    name: 'Switch Levodopa Formulation',
    description: 'Change from IR to CR, or to combination product (Stalevo)',
    roles: [
      {
        role: 'discontinuing',
        suggestedCategories: ['levodopa-combination'],
        scheduleMode: 'discontinuing',
        description: 'Current levodopa formulation'
      },
      {
        role: 'introducing',
        suggestedCategories: ['levodopa-combination'],
        scheduleMode: 'titrating',
        description: 'New levodopa formulation'
      }
    ],
    hasCrossTitration: true,
  },
  {
    id: 'reduce-for-side-effects',
    name: 'Reduce for Side Effects',
    description: 'Decrease one medication, optionally compensate with another',
    roles: [
      {
        role: 'discontinuing',
        suggestedCategories: ['dopamine-agonist', 'levodopa-combination'],
        scheduleMode: 'discontinuing',
        description: 'Medication being reduced'
      },
      {
        role: 'primary',
        suggestedCategories: ['levodopa-combination'],
        scheduleMode: 'hold-steady',
        description: 'Optional: compensating medication'
      }
    ],
    hasCrossTitration: false,
  },
  {
    id: 'custom',
    name: 'Custom Regimen',
    description: 'Build your own multi-medication schedule',
    roles: [],
    hasCrossTitration: false,
  },
];

// ==========================================
// LEVODOPA EQUIVALENT DOSE FACTORS
// Reference: Tomlinson CL et al. Movement Disorders 2010
// ==========================================

export const LEVODOPA_EQUIVALENT_FACTORS: Record<string, number> = {
  // Levodopa (with decarboxylase inhibitor) = 1
  'levodopa-carbidopa': 1,
  'levodopa-benserazide': 1,
  'levodopa-carbidopa-entacapone': 1.33, // COMT inhibition increases bioavailability

  // Dopamine agonists (mg to LED mg)
  'pramipexole': 100,    // 1mg pramipexole = 100mg LED
  'ropinirole': 20,      // 1mg ropinirole = 20mg LED
  'rotigotine': 30,      // 1mg rotigotine patch = 30mg LED

  // MAO-B inhibitors (fixed daily contribution)
  'rasagiline': 100,     // 1mg = 100mg LED
  'selegiline': 10,      // 10mg = 100mg LED (so factor is 10)
  'safinamide': 1,       // 100mg = 100mg LED (so factor is 1)

  // Amantadine
  'amantadine': 1,       // 100mg = 100mg LED
};

// ==========================================
// MEDICATION COLOR PALETTE
// ==========================================

export const PD_MEDICATION_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getAllPDPreparations(): PDPreparation[] {
  return PARKINSONS_MEDICATIONS.flatMap(med => med.preparations);
}

export function getPDMedicationById(id: string): PDMedication | undefined {
  return PARKINSONS_MEDICATIONS.find(med => med.id === id);
}

export function getPDPreparationById(id: string): PDPreparation | undefined {
  return getAllPDPreparations().find(prep => prep.id === id);
}

export function getHalvablePreparations(medicationId: string): PDPreparation[] {
  const med = getPDMedicationById(medicationId);
  return med?.preparations.filter(p => p.canBeHalved) ?? [];
}

export function getMedicationsByCategory(category: PDMedicationCategory): PDMedication[] {
  return PARKINSONS_MEDICATIONS.filter(med => med.category === category);
}

export function getMedicationsGroupedByCategory(): Record<PDMedicationCategory, PDMedication[]> {
  const grouped: Record<PDMedicationCategory, PDMedication[]> = {
    'levodopa-combination': [],
    'dopamine-agonist': [],
    'mao-b-inhibitor': [],
    'comt-inhibitor': [],
    'anticholinergic': [],
    'amantadine': [],
  };

  for (const med of PARKINSONS_MEDICATIONS) {
    grouped[med.category].push(med);
  }

  return grouped;
}

export function formatPreparationStrength(prep: PDPreparation): string {
  if (prep.strengthSecondary) {
    return `${prep.strength}/${prep.strengthSecondary}${prep.unit}`;
  }
  return `${prep.strength}${prep.unit}`;
}

export function formatPreparationDisplay(prep: PDPreparation): string {
  return `${prep.brandName} ${formatPreparationStrength(prep)}`;
}

export function calculateTotalDose(slotDoses: PDSlotDose[], prep: PDPreparation): number {
  const totalTablets = slotDoses.reduce((sum, sd) => sum + sd.tabletCount, 0);
  return totalTablets * prep.strength;
}

export function calculateTotalTablets(slotDoses: PDSlotDose[]): number {
  return slotDoses.reduce((sum, sd) => sum + sd.tabletCount, 0);
}

export function calculateLED(
  medicationId: string,
  totalDailyDose: number
): number {
  const factor = LEVODOPA_EQUIVALENT_FACTORS[medicationId] || 1;
  return totalDailyDose * factor;
}

export function getNextMedicationColor(usedColors: string[]): string {
  for (const color of PD_MEDICATION_COLORS) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  // If all colors used, return first one
  return PD_MEDICATION_COLORS[0];
}

export function createEmptySlotDoses(timeSlots: PDTimeSlot[], defaultTitrationMode: SlotTitrationMode = 'titrate'): PDSlotDose[] {
  return timeSlots.map((slot, index) => ({
    slotId: slot.id,
    tabletCount: 0,
    titrationMode: defaultTitrationMode,
    titrationOrder: defaultTitrationMode === 'titrate' ? index + 1 : undefined,
  }));
}

export function generateTimeSlots(count: number): PDTimeSlot[] {
  // Generate evenly distributed time slots based on count
  const slots: PDTimeSlot[] = [];
  const startHour = 6; // 6am
  const endHour = 22;  // 10pm
  const hoursAvailable = endHour - startHour;
  const interval = Math.floor(hoursAvailable / (count - 1)) || 3;

  for (let i = 0; i < count; i++) {
    const hour = Math.min(startHour + (i * interval), endHour);
    const label = hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;

    slots.push({
      id: `slot${i + 1}`,
      label,
      order: i + 1,
      defaultTime: timeStr,
    });
  }

  return slots;
}
