# Parkinson's Disease Titration Tool - Implementation Plan

## Overview

A specialized subtool within the pharmacy calculators ecosystem for managing complex Parkinson's disease medication titrations. This tool addresses the unique challenges of PD medication management:

- Multiple daily doses (up to 8 time slots)
- Commercial preparation constraints (halving rules)
- Sequential dose escalation across time slots
- Multi-medication regimens common in PD

---

## Architecture Design

### File Structure

```
src/
├── types/
│   └── parkinsonsMedications.ts          # PD medication database & types
├── components/
│   └── pharmacy-calculators/
│       └── parkinsons-titration/
│           ├── index.ts                   # Public exports
│           ├── ParkinsonsTitrationTool.tsx  # Main container
│           ├── hooks/
│           │   ├── usePDScheduleCalculator.ts
│           │   └── usePDOptimization.ts
│           ├── components/
│           │   ├── MedicationSelector.tsx   # Product picker with prep info
│           │   ├── TimeSlotConfig.tsx       # Custom time slot setup (1-8 slots)
│           │   ├── DoseEntryGrid.tsx        # Tablet count entry per slot
│           │   ├── TitrationWizard.tsx      # Step-by-step titration setup
│           │   ├── OptimizationEngine.tsx   # "Optimise for me" UI
│           │   └── views/
│           │       ├── DailyView.tsx        # Single day breakdown
│           │       ├── WeeklyView.tsx       # 7-day grid with checkboxes
│           │       ├── CalendarView.tsx     # Month overview
│           │       └── SummaryView.tsx      # Preparation totals
│           └── utils/
│               ├── pdScheduleCalculator.ts  # Core calculation logic
│               └── pdOptimizer.ts           # Optimization algorithms
├── pages/
│   └── pharmacy-tools/
│       └── ParkinsonsTitrationPage.tsx      # Page wrapper
└── utils/
    └── dose-calculation/
        └── pd-preparations.ts               # PD-specific prep utilities
```

---

## 1. Types & Data Layer

### 1.1 Parkinson's Medications Database (`src/types/parkinsonsMedications.ts`)

```typescript
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
      { id: 'sinemet-50-12.5', brandName: 'Sinemet', genericName: 'Levodopa/Carbidopa', strength: 50, strengthSecondary: 12.5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, notes: 'Scored tablet' },
      { id: 'sinemet-100-25', brandName: 'Sinemet', genericName: 'Levodopa/Carbidopa', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, notes: 'Scored tablet' },
      { id: 'sinemet-250-25', brandName: 'Sinemet', genericName: 'Levodopa/Carbidopa', strength: 250, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, notes: 'Scored tablet' },
      // Sinemet CR
      { id: 'sinemet-cr-200-50', brandName: 'Sinemet CR', genericName: 'Levodopa/Carbidopa CR', strength: 200, strengthSecondary: 50, unit: 'mg', formulation: 'controlled-release', canBeHalved: true, pbsListed: true, notes: 'Can be halved but not crushed' },
      { id: 'sinemet-cr-100-25', brandName: 'Sinemet CR', genericName: 'Levodopa/Carbidopa CR', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'controlled-release', canBeHalved: true, pbsListed: true, notes: 'Can be halved but not crushed' },
      // Kinson
      { id: 'kinson-50-12.5', brandName: 'Kinson', genericName: 'Levodopa/Carbidopa', strength: 50, strengthSecondary: 12.5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
      { id: 'kinson-100-25', brandName: 'Kinson', genericName: 'Levodopa/Carbidopa', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
      { id: 'kinson-250-25', brandName: 'Kinson', genericName: 'Levodopa/Carbidopa', strength: 250, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
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
      { id: 'madopar-50-12.5', brandName: 'Madopar', genericName: 'Levodopa/Benserazide', strength: 50, strengthSecondary: 12.5, unit: 'mg', formulation: 'dispersible', canBeHalved: false, pbsListed: true, notes: 'Dispersible - cannot be halved' },
      { id: 'madopar-100-25', brandName: 'Madopar', genericName: 'Levodopa/Benserazide', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'capsule', canBeHalved: false, pbsListed: true, notes: 'Capsule - cannot be halved' },
      { id: 'madopar-200-50', brandName: 'Madopar', genericName: 'Levodopa/Benserazide', strength: 200, strengthSecondary: 50, unit: 'mg', formulation: 'capsule', canBeHalved: false, pbsListed: true, notes: 'Capsule - cannot be halved' },
      // Madopar HBS (CR)
      { id: 'madopar-hbs-100-25', brandName: 'Madopar HBS', genericName: 'Levodopa/Benserazide CR', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true, notes: 'Controlled release capsule - swallow whole' },
    ]
  },
  {
    id: 'levodopa-carbidopa-entacapone',
    genericName: 'Levodopa/Carbidopa/Entacapone',
    category: 'levodopa-combination',
    titrationGuidance: 'Switch from Sinemet + Comtan. Do not halve tablets.',
    preparations: [
      // Stalevo
      { id: 'stalevo-50', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 50, strengthSecondary: 12.5, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, notes: 'Film-coated - do not halve' },
      { id: 'stalevo-75', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 75, strengthSecondary: 18.75, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
      { id: 'stalevo-100', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 100, strengthSecondary: 25, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
      { id: 'stalevo-125', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 125, strengthSecondary: 31.25, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
      { id: 'stalevo-150', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 150, strengthSecondary: 37.5, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
      { id: 'stalevo-200', brandName: 'Stalevo', genericName: 'Levodopa/Carbidopa/Entacapone', strength: 200, strengthSecondary: 50, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
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
      { id: 'sifrol-0.125', brandName: 'Sifrol', genericName: 'Pramipexole', strength: 0.125, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true, notes: 'Base equivalent - scored' },
      { id: 'sifrol-0.25', brandName: 'Sifrol', genericName: 'Pramipexole', strength: 0.25, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
      { id: 'sifrol-0.5', brandName: 'Sifrol', genericName: 'Pramipexole', strength: 0.5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
      { id: 'sifrol-1', brandName: 'Sifrol', genericName: 'Pramipexole', strength: 1, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
      // Sifrol ER
      { id: 'sifrol-er-0.375', brandName: 'Sifrol ER', genericName: 'Pramipexole ER', strength: 0.375, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true, notes: 'Extended release - swallow whole' },
      { id: 'sifrol-er-0.75', brandName: 'Sifrol ER', genericName: 'Pramipexole ER', strength: 0.75, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true },
      { id: 'sifrol-er-1.5', brandName: 'Sifrol ER', genericName: 'Pramipexole ER', strength: 1.5, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true },
      { id: 'sifrol-er-3', brandName: 'Sifrol ER', genericName: 'Pramipexole ER', strength: 3, unit: 'mg', formulation: 'controlled-release', canBeHalved: false, pbsListed: true },
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
      { id: 'repreve-0.25', brandName: 'Repreve', genericName: 'Ropinirole', strength: 0.25, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, notes: 'Film-coated' },
      { id: 'repreve-0.5', brandName: 'Repreve', genericName: 'Ropinirole', strength: 0.5, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
      { id: 'repreve-1', brandName: 'Repreve', genericName: 'Ropinirole', strength: 1, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
      { id: 'repreve-2', brandName: 'Repreve', genericName: 'Ropinirole', strength: 2, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
      { id: 'repreve-5', brandName: 'Repreve', genericName: 'Ropinirole', strength: 5, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
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
      { id: 'neupro-2', brandName: 'Neupro', genericName: 'Rotigotine', strength: 2, unit: 'mg', formulation: 'patch', canBeHalved: false, pbsListed: true, notes: 'Transdermal patch - 24 hour' },
      { id: 'neupro-4', brandName: 'Neupro', genericName: 'Rotigotine', strength: 4, unit: 'mg', formulation: 'patch', canBeHalved: false, pbsListed: true },
      { id: 'neupro-6', brandName: 'Neupro', genericName: 'Rotigotine', strength: 6, unit: 'mg', formulation: 'patch', canBeHalved: false, pbsListed: true },
      { id: 'neupro-8', brandName: 'Neupro', genericName: 'Rotigotine', strength: 8, unit: 'mg', formulation: 'patch', canBeHalved: false, pbsListed: true },
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
      { id: 'azilect-1', brandName: 'Azilect', genericName: 'Rasagiline', strength: 1, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
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
      { id: 'eldepryl-5', brandName: 'Eldepryl', genericName: 'Selegiline', strength: 5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
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
      { id: 'xadago-50', brandName: 'Xadago', genericName: 'Safinamide', strength: 50, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, notes: 'Film-coated' },
      { id: 'xadago-100', brandName: 'Xadago', genericName: 'Safinamide', strength: 100, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true },
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
      { id: 'comtan-200', brandName: 'Comtan', genericName: 'Entacapone', strength: 200, unit: 'mg', formulation: 'tablet', canBeHalved: false, pbsListed: true, notes: 'Film-coated - take with each levodopa dose' },
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
      { id: 'ongentys-50', brandName: 'Ongentys', genericName: 'Opicapone', strength: 50, unit: 'mg', formulation: 'capsule', canBeHalved: false, pbsListed: true, notes: 'Take at bedtime, 1hr before/after levodopa' },
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
      { id: 'benztrop-2', brandName: 'Benztrop', genericName: 'Benztropine', strength: 2, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
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
      { id: 'artane-2', brandName: 'Artane', genericName: 'Trihexyphenidyl', strength: 2, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
      { id: 'artane-5', brandName: 'Artane', genericName: 'Trihexyphenidyl', strength: 5, unit: 'mg', formulation: 'tablet', canBeHalved: true, pbsListed: true },
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
      { id: 'symmetrel-100', brandName: 'Symmetrel', genericName: 'Amantadine', strength: 100, unit: 'mg', formulation: 'capsule', canBeHalved: false, pbsListed: true },
    ]
  },
];

// Helper to get all preparations as flat list
export function getAllPDPreparations(): PDPreparation[] {
  return PARKINSONS_MEDICATIONS.flatMap(med => med.preparations);
}

// Helper to get medication by ID
export function getPDMedicationById(id: string): PDMedication | undefined {
  return PARKINSONS_MEDICATIONS.find(med => med.id === id);
}

// Helper to get preparation by ID
export function getPDPreparationById(id: string): PDPreparation | undefined {
  return getAllPDPreparations().find(prep => prep.id === id);
}

// Helper to filter preparations by halving capability
export function getHalvablePreparations(medicationId: string): PDPreparation[] {
  const med = getPDMedicationById(medicationId);
  return med?.preparations.filter(p => p.canBeHalved) ?? [];
}
```

### 1.2 Multi-Medication Regimen Types

A core feature of this tool is managing multiple medications simultaneously - essential for real-world PD management where:
- A new medication is introduced while existing ones remain steady
- One medication is increased while another is decreased (cross-titration/switch)
- Multiple medications titrate on the same or offset schedules

```typescript
// ==========================================
// MULTI-MEDICATION REGIMEN TYPES
// ==========================================

/**
 * Relationship between medications in a regimen
 */
export type MedicationRelationship =
  | 'independent'      // No interaction - each follows its own schedule
  | 'cross-titration'  // One increases as another decreases (switch)
  | 'sequential'       // One completes before next begins
  | 'synchronized';    // Changes happen on same days

/**
 * Individual medication entry within a multi-med regimen
 */
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

  // For discontinuing: taper config
  taperConfig?: PDTitrationConfig; // Same structure, direction = 'decrease'

  // Display settings
  color: string;  // For visual distinction in views
  displayOrder: number;
}

/**
 * Cross-titration link between two medications
 * When one increases, the other decreases proportionally
 */
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
  // If not specified, changes are independent amounts
  ratio?: {
    increaseAmount: number;
    decreaseAmount: number;
  };
}

/**
 * Complete multi-medication regimen
 */
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

  // Calculated combined schedule
  calculatedSchedule?: PDRegimenDayDose[];
}

/**
 * A single day's doses for ALL medications in regimen
 */
export interface PDRegimenDayDose {
  date: Date;

  // Doses per medication
  medicationDoses: {
    medicationId: string;
    medicationName: string;
    preparationName: string;
    color: string;
    slotDoses: PDSlotDose[];
    totalDose: number;
    totalTablets: number;
    changeFromYesterday?: 'increased' | 'decreased' | 'unchanged' | 'started' | 'stopped';
  }[];

  // Combined daily totals (useful for levodopa equivalent calculations)
  combinedTotals?: {
    totalLevodopa?: number;        // Sum of all levodopa sources
    totalDopamineAgonist?: number; // In levodopa equivalents
  };
}

// ==========================================
// COMMON REGIMEN TEMPLATES
// ==========================================

export type RegimenTemplate =
  | 'single-med-titration'           // Just one medication titrating
  | 'add-adjunct-hold-primary'       // Add COMT/MAO-B while levodopa stays steady
  | 'switch-agonist-to-levodopa'     // Cross-titration: decrease agonist, increase levodopa
  | 'switch-levodopa-formulation'    // IR to CR, or add Stalevo
  | 'reduce-for-side-effects'        // Decrease one, may increase another
  | 'custom';                        // User-defined

export interface RegimenTemplateConfig {
  id: RegimenTemplate;
  name: string;
  description: string;

  // Pre-configured medication roles
  roles: {
    role: 'primary' | 'adjunct' | 'introducing' | 'discontinuing';
    suggestedCategories: PDMedicationCategory[];
    scheduleMode: 'hold-steady' | 'titrating' | 'discontinuing';
  }[];

  // Whether cross-titration is typical
  hasCrossTitration: boolean;
}

export const REGIMEN_TEMPLATES: RegimenTemplateConfig[] = [
  {
    id: 'single-med-titration',
    name: 'Single Medication Titration',
    description: 'Titrate one medication up or down',
    roles: [
      { role: 'primary', suggestedCategories: ['levodopa-combination', 'dopamine-agonist'], scheduleMode: 'titrating' }
    ],
    hasCrossTitration: false,
  },
  {
    id: 'add-adjunct-hold-primary',
    name: 'Add Adjunct Therapy',
    description: 'Introduce a new medication while keeping existing therapy steady',
    roles: [
      { role: 'primary', suggestedCategories: ['levodopa-combination'], scheduleMode: 'hold-steady' },
      { role: 'adjunct', suggestedCategories: ['comt-inhibitor', 'mao-b-inhibitor'], scheduleMode: 'titrating' }
    ],
    hasCrossTitration: false,
  },
  {
    id: 'switch-agonist-to-levodopa',
    name: 'Dopamine Agonist to Levodopa Switch',
    description: 'Gradually replace dopamine agonist with levodopa',
    roles: [
      { role: 'discontinuing', suggestedCategories: ['dopamine-agonist'], scheduleMode: 'discontinuing' },
      { role: 'introducing', suggestedCategories: ['levodopa-combination'], scheduleMode: 'titrating' }
    ],
    hasCrossTitration: true,
  },
  {
    id: 'switch-levodopa-formulation',
    name: 'Switch Levodopa Formulation',
    description: 'Change from IR to CR, or to combination product (Stalevo)',
    roles: [
      { role: 'discontinuing', suggestedCategories: ['levodopa-combination'], scheduleMode: 'discontinuing' },
      { role: 'introducing', suggestedCategories: ['levodopa-combination'], scheduleMode: 'titrating' }
    ],
    hasCrossTitration: true,
  },
  {
    id: 'reduce-for-side-effects',
    name: 'Reduce for Side Effects',
    description: 'Decrease one medication, optionally compensate with another',
    roles: [
      { role: 'discontinuing', suggestedCategories: ['dopamine-agonist', 'levodopa-combination'], scheduleMode: 'discontinuing' },
      { role: 'primary', suggestedCategories: ['levodopa-combination'], scheduleMode: 'hold-steady' } // Optional
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
```

### 1.3 PD Titration Types (Single Medication)

```typescript
// Time slot configuration (up to 8 per day)
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

// Dose entry in tablet counts (not mg)
export interface PDSlotDose {
  slotId: string;
  tabletCount: number;     // 0, 0.5, 1, 1.5, 2, etc.
}

// A single day's dose configuration
export interface PDDayDose {
  date: Date;
  slotDoses: PDSlotDose[];
  totalDose: number;       // Calculated mg
  totalTablets: number;    // Sum of tablet counts
}

// Titration configuration
export interface PDTitrationConfig {
  // Starting configuration
  startingSlotDoses: PDSlotDose[];

  // Target (optional - for "optimise" mode)
  targetSlotDoses?: PDSlotDose[];

  // Titration rules
  titrationDirection: 'increase' | 'decrease';
  changeAmount: number;              // In tablets (0.5, 1, etc.)
  intervalDays: number;              // Days between changes

  // Sequential titration order
  titrationSequence: string[];       // Slot IDs in order of change
  incrementsPerSlot: number;         // How many changes before moving to next slot

  // Constraints
  maxTabletsPerDose: number;         // Default 3
  maxTotalDailyTablets?: number;
}

// Optimization preferences
export interface PDOptimizationPrefs {
  minimizeStrengthVariety: boolean;  // Prefer fewer different strengths
  maxTabletsPerDose: number;         // Hard limit (default 3)
  allowHalves: boolean;              // Global override
  preferEvenDistribution: boolean;   // Try to spread doses evenly
}

// Full PD schedule configuration
export interface PDSchedule {
  id: string;
  medication: PDMedication;
  selectedPreparation: PDPreparation;

  // Time slots
  timeSlots: PDTimeSlot[];

  // Schedule settings
  startDate: Date;
  endDate?: Date;

  // Titration config
  titrationConfig?: PDTitrationConfig;

  // Manual or optimized
  isOptimized: boolean;
  optimizationPrefs?: PDOptimizationPrefs;

  // Calculated doses
  calculatedDoses?: PDDayDose[];
}
```

---

## 2. Core Calculation Engine

### 2.1 PD Schedule Calculator (`utils/pdScheduleCalculator.ts`)

```typescript
/**
 * Calculate the full dose schedule for a PD titration
 */
export function calculatePDSchedule(schedule: PDSchedule): PDDayDose[] {
  const { titrationConfig, selectedPreparation, timeSlots, startDate, endDate } = schedule;

  if (!titrationConfig) {
    // No titration - static schedule
    return generateStaticSchedule(schedule);
  }

  const doses: PDDayDose[] = [];
  let currentSlotDoses = [...titrationConfig.startingSlotDoses];
  let currentDate = new Date(startDate);
  const finalDate = endDate || addDays(startDate, 90);

  let daysUntilChange = titrationConfig.intervalDays;
  let currentSlotIndex = 0;
  let incrementsAtCurrentSlot = 0;

  while (currentDate <= finalDate) {
    // Record today's dose
    doses.push(createDayDose(currentDate, currentSlotDoses, selectedPreparation));

    // Check if we should titrate today
    daysUntilChange--;
    if (daysUntilChange <= 0 && shouldContinueTitrating(currentSlotDoses, titrationConfig)) {
      // Apply titration to current slot in sequence
      const slotId = titrationConfig.titrationSequence[currentSlotIndex];
      currentSlotDoses = applyTitration(
        currentSlotDoses,
        slotId,
        titrationConfig.changeAmount,
        titrationConfig.titrationDirection,
        titrationConfig.maxTabletsPerDose
      );

      incrementsAtCurrentSlot++;

      // Move to next slot in sequence?
      if (incrementsAtCurrentSlot >= titrationConfig.incrementsPerSlot) {
        incrementsAtCurrentSlot = 0;
        currentSlotIndex = (currentSlotIndex + 1) % titrationConfig.titrationSequence.length;
      }

      daysUntilChange = titrationConfig.intervalDays;
    }

    currentDate = addDays(currentDate, 1);
  }

  return doses;
}

function createDayDose(
  date: Date,
  slotDoses: PDSlotDose[],
  prep: PDPreparation
): PDDayDose {
  const totalTablets = slotDoses.reduce((sum, sd) => sum + sd.tabletCount, 0);
  const totalDose = totalTablets * prep.strength;

  return {
    date: new Date(date),
    slotDoses: [...slotDoses],
    totalDose,
    totalTablets,
  };
}
```

### 2.2 Multi-Medication Regimen Calculator (`utils/pdRegimenCalculator.ts`)

```typescript
/**
 * Calculate complete schedule for a multi-medication regimen
 * Handles hold-steady, titrating, and cross-titration scenarios
 */
export function calculateRegimenSchedule(regimen: PDRegimen): PDRegimenDayDose[] {
  const { medications, crossTitrationLinks, startDate, endDate, timeSlots } = regimen;
  const finalDate = endDate || addDays(startDate, 90);

  // First, calculate individual schedules for each medication
  const individualSchedules = new Map<string, PDDayDose[]>();

  for (const med of medications) {
    if (med.scheduleMode === 'hold-steady') {
      // Static doses throughout
      individualSchedules.set(
        med.id,
        generateStaticSchedule(med, startDate, finalDate, timeSlots)
      );
    } else {
      // Titrating or discontinuing
      individualSchedules.set(
        med.id,
        calculatePDScheduleForMed(med, startDate, finalDate, timeSlots)
      );
    }
  }

  // Apply cross-titration synchronization if any
  for (const link of crossTitrationLinks) {
    applyCrossTitrationSync(individualSchedules, link);
  }

  // Merge into combined daily schedule
  const combinedSchedule: PDRegimenDayDose[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= finalDate) {
    const dayDose = createRegimenDayDose(
      currentDate,
      medications,
      individualSchedules,
      combinedSchedule.length > 0 ? combinedSchedule[combinedSchedule.length - 1] : null
    );
    combinedSchedule.push(dayDose);
    currentDate = addDays(currentDate, 1);
  }

  return combinedSchedule;
}

/**
 * Generate static (hold-steady) schedule for a medication
 */
function generateStaticSchedule(
  med: PDRegimenMedication,
  startDate: Date,
  endDate: Date,
  timeSlots: PDTimeSlot[]
): PDDayDose[] {
  const doses: PDDayDose[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    doses.push({
      date: new Date(currentDate),
      slotDoses: med.steadySlotDoses || timeSlots.map(slot => ({ slotId: slot.id, tabletCount: 0 })),
      totalDose: calculateTotalDose(med.steadySlotDoses || [], med.selectedPreparation),
      totalTablets: calculateTotalTablets(med.steadySlotDoses || []),
    });
    currentDate = addDays(currentDate, 1);
  }

  return doses;
}

/**
 * Apply cross-titration synchronization
 * Ensures that increases and decreases happen according to the link rules
 */
function applyCrossTitrationSync(
  schedules: Map<string, PDDayDose[]>,
  link: CrossTitrationLink
): void {
  const increasingSchedule = schedules.get(link.increasingMedId);
  const decreasingSchedule = schedules.get(link.decreasingMedId);

  if (!increasingSchedule || !decreasingSchedule) return;

  // Find all increase days
  const increaseDays = findChangeDays(increasingSchedule, 'increase');

  for (const increaseDay of increaseDays) {
    let decreaseDate: Date;

    switch (link.syncMode) {
      case 'same-day':
        decreaseDate = increaseDay.date;
        break;
      case 'offset-days':
        decreaseDate = addDays(increaseDay.date, link.offsetDays || 0);
        break;
      case 'alternating':
        // Find next available day that isn't an increase day
        decreaseDate = findNextNonChangeDay(increaseDay.date, increasingSchedule);
        break;
      default:
        decreaseDate = increaseDay.date;
    }

    // Apply decrease on that date (if within schedule range)
    const decreaseDayIndex = decreasingSchedule.findIndex(
      d => isSameDay(d.date, decreaseDate)
    );

    if (decreaseDayIndex >= 0 && link.ratio) {
      // Apply proportional decrease
      applyProportionalDecrease(
        decreasingSchedule,
        decreaseDayIndex,
        increaseDay.changeAmount,
        link.ratio
      );
    }
  }
}

/**
 * Create combined day dose for all medications
 */
function createRegimenDayDose(
  date: Date,
  medications: PDRegimenMedication[],
  schedules: Map<string, PDDayDose[]>,
  previousDay: PDRegimenDayDose | null
): PDRegimenDayDose {
  const medicationDoses = medications.map(med => {
    const schedule = schedules.get(med.id);
    const dayDose = schedule?.find(d => isSameDay(d.date, date));

    const prevMedDose = previousDay?.medicationDoses.find(m => m.medicationId === med.id);

    let changeFromYesterday: 'increased' | 'decreased' | 'unchanged' | 'started' | 'stopped' = 'unchanged';

    if (!prevMedDose && dayDose && dayDose.totalTablets > 0) {
      changeFromYesterday = 'started';
    } else if (prevMedDose && (!dayDose || dayDose.totalTablets === 0)) {
      changeFromYesterday = 'stopped';
    } else if (prevMedDose && dayDose) {
      if (dayDose.totalTablets > prevMedDose.totalTablets) {
        changeFromYesterday = 'increased';
      } else if (dayDose.totalTablets < prevMedDose.totalTablets) {
        changeFromYesterday = 'decreased';
      }
    }

    return {
      medicationId: med.id,
      medicationName: med.medication.genericName,
      preparationName: `${med.selectedPreparation.brandName} ${med.selectedPreparation.strength}${med.selectedPreparation.unit}`,
      color: med.color,
      slotDoses: dayDose?.slotDoses || [],
      totalDose: dayDose?.totalDose || 0,
      totalTablets: dayDose?.totalTablets || 0,
      changeFromYesterday,
    };
  });

  // Calculate combined totals (levodopa equivalents)
  const combinedTotals = calculateCombinedTotals(medicationDoses, medications);

  return {
    date: new Date(date),
    medicationDoses,
    combinedTotals,
  };
}

/**
 * Calculate levodopa equivalent doses
 * Based on standard conversion factors
 */
function calculateCombinedTotals(
  dayDoses: PDRegimenDayDose['medicationDoses'],
  medications: PDRegimenMedication[]
): PDRegimenDayDose['combinedTotals'] {
  // Levodopa equivalent conversion factors (approximate)
  const LEVODOPA_EQUIVALENTS: Record<string, number> = {
    'levodopa-carbidopa': 1,
    'levodopa-benserazide': 1,
    'levodopa-carbidopa-entacapone': 1.33, // COMT inhibition increases bioavailability
    'pramipexole': 100, // 1mg pramipexole ≈ 100mg levodopa
    'ropinirole': 20,   // 1mg ropinirole ≈ 20mg levodopa
    'rotigotine': 30,   // 1mg rotigotine ≈ 30mg levodopa
  };

  let totalLevodopa = 0;
  let totalDopamineAgonistEquiv = 0;

  for (const dose of dayDoses) {
    const med = medications.find(m => m.id === dose.medicationId);
    if (!med) continue;

    const category = med.medication.category;
    const factor = LEVODOPA_EQUIVALENTS[med.medication.id] || 1;

    if (category === 'levodopa-combination') {
      totalLevodopa += dose.totalDose;
    } else if (category === 'dopamine-agonist') {
      totalDopamineAgonistEquiv += dose.totalDose * factor;
    }
  }

  return {
    totalLevodopa,
    totalDopamineAgonist: totalDopamineAgonistEquiv,
  };
}
```

### 2.3 Optimization Engine (`utils/pdOptimizer.ts`)

```typescript
/**
 * "Optimise for me" - finds the most efficient titration path
 */
export function optimizeTitrationPath(
  startingDoses: PDSlotDose[],
  targetDoses: PDSlotDose[],
  prefs: PDOptimizationPrefs
): PDTitrationConfig {
  // Calculate total change needed
  const changePerSlot = calculateSlotChanges(startingDoses, targetDoses);

  // Determine optimal sequence (slots with most change first, or even distribution)
  const sequence = prefs.preferEvenDistribution
    ? calculateEvenSequence(changePerSlot)
    : calculatePrioritizedSequence(changePerSlot);

  // Determine optimal change amount (largest that keeps within constraints)
  const changeAmount = calculateOptimalChangeAmount(
    changePerSlot,
    prefs.maxTabletsPerDose,
    prefs.allowHalves
  );

  return {
    startingSlotDoses: startingDoses,
    targetSlotDoses: targetDoses,
    titrationDirection: determineTotalDirection(startingDoses, targetDoses),
    changeAmount,
    intervalDays: 7, // Default, can be overridden
    titrationSequence: sequence,
    incrementsPerSlot: 1,
    maxTabletsPerDose: prefs.maxTabletsPerDose,
  };
}

/**
 * Minimize preparation variety
 */
export function findOptimalPreparation(
  medication: PDMedication,
  requiredDoses: number[], // All unique tablet counts needed
  prefs: PDOptimizationPrefs
): PDPreparation | null {
  // Filter by halving preference
  const candidates = prefs.allowHalves
    ? medication.preparations
    : medication.preparations.filter(p => p.canBeHalved || isWholeTabletOnly(requiredDoses));

  // Score each preparation by how well it covers all doses
  const scored = candidates.map(prep => ({
    prep,
    score: scorePreparation(prep, requiredDoses, prefs),
  }));

  // Return best scoring
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.prep ?? null;
}
```

---

## 3. UI Components

### 3.1 Main Container Structure (Updated for Multi-Medication)

```
ParkinsonsTitrationTool
├── Header (Title, Description, Safety Note)
├── WizardStepper (6 steps for multi-med)
│   │
│   ├── Step 1: Regimen Type
│   │   ├── RegimenTemplateSelector (common scenarios)
│   │   │   - Single Medication Titration
│   │   │   - Add Adjunct Therapy (hold primary)
│   │   │   - Dopamine Agonist to Levodopa Switch
│   │   │   - Switch Levodopa Formulation
│   │   │   - Reduce for Side Effects
│   │   │   - Custom Regimen
│   │   └── RegimenDescription (explains selected template)
│   │
│   ├── Step 2: Time Slots (Shared across all medications)
│   │   ├── SlotCountSelector (1-8 slots)
│   │   └── SlotLabelEditor (customize each label)
│   │
│   ├── Step 3: Medications
│   │   ├── MedicationList (add/remove/reorder)
│   │   │   └── For each medication:
│   │   │       ├── MedicationSelector (grouped by category)
│   │   │       ├── PreparationPicker (with halving badges)
│   │   │       ├── ScheduleModeSelector
│   │   │       │   - Hold Steady
│   │   │       │   - Titrating (increase/decrease)
│   │   │       │   - Discontinuing (taper to zero)
│   │   │       └── ColorPicker (visual distinction)
│   │   └── [+ Add Another Medication]
│   │
│   ├── Step 4: Dose Configuration
│   │   ├── For each medication:
│   │   │   ├── IF hold-steady: DoseEntryGrid (static doses)
│   │   │   ├── IF titrating: TitrationConfigPanel
│   │   │   │   ├── StartingDosesGrid
│   │   │   │   ├── TargetDosesGrid (optional)
│   │   │   │   ├── ChangeAmount selector
│   │   │   │   ├── IntervalDays selector
│   │   │   │   └── SequenceOrderPicker
│   │   │   └── IF discontinuing: TaperConfigPanel
│   │   └── "No halves" global toggle
│   │
│   ├── Step 5: Cross-Titration (if applicable)
│   │   ├── CrossTitrationLinker
│   │   │   ├── Select increasing medication
│   │   │   ├── Select decreasing medication
│   │   │   ├── SyncMode selector
│   │   │   │   - Same day
│   │   │   │   - Alternating
│   │   │   │   - Offset by N days
│   │   │   └── Ratio config (optional)
│   │   └── CrossTitrationPreview (visual timeline)
│   │
│   └── Step 6: Review & Generate
│       ├── RegimenSummary (all medications)
│       ├── CrossTitrationSummary (if any)
│       ├── OptimizeButton ("Optimise for me")
│       └── ViewSelector (Daily/Weekly/Calendar)
│
├── Main View Area
│   ├── TabBar (Daily | Weekly | Calendar | Summary | Timeline)
│   └── ActiveView
│       ├── DailyView (all medications stacked)
│       ├── WeeklyView (color-coded multi-med grid)
│       ├── CalendarView (month overview with colors)
│       ├── SummaryView (totals per medication)
│       └── TimelineView (NEW: visual titration timeline)
│
├── Sidebar (optional, desktop)
│   ├── MedicationLegend (color key)
│   ├── QuickStats (today's totals, levodopa equivalent)
│   └── ChangeLog (recent dose changes)
│
└── Actions
    ├── Print Schedule (all meds or selected)
    ├── Export PDF
    ├── Save Regimen
    └── Load Regimen
```

### 3.2 Key UI Components

#### MedicationSelector

```tsx
// Grouped by category with search
<MedicationSelector
  medications={PARKINSONS_MEDICATIONS}
  selectedMedication={medication}
  onSelect={handleMedicationSelect}
  groupBy="category"
/>

// Shows:
// - Levodopa Combinations
//   - Levodopa/Carbidopa (Sinemet, Kinson)
//   - Levodopa/Benserazide (Madopar)
// - Dopamine Agonists
//   - Pramipexole (Sifrol)
//   ...
```

#### PreparationPicker (with halving badges)

```tsx
<PreparationPicker
  preparations={medication.preparations}
  selected={selectedPrep}
  onSelect={handlePrepSelect}
  showHalvingInfo={true}
/>

// Each option shows:
// [Sinemet 100/25mg] [✓ Can halve] [PBS]
// [Madopar 100/25 capsule] [✗ Cannot halve] [PBS]
```

#### TimeSlotConfig

```tsx
<TimeSlotConfig
  slotCount={slotCount}
  onSlotCountChange={setSlotCount}
  slots={timeSlots}
  onSlotsChange={setTimeSlots}
  maxSlots={8}
/>

// Shows:
// Number of doses per day: [3] [4] [5] [6] [7] [8]
//
// Time Labels:
// Slot 1: [6am________] [🕐]
// Slot 2: [10am_______] [🕐]
// Slot 3: [2pm________] [🕐]
// Slot 4: [6pm________] [🕐]
```

#### DoseEntryGrid

```tsx
<DoseEntryGrid
  timeSlots={timeSlots}
  doses={slotDoses}
  onDosesChange={setSlotDoses}
  preparation={selectedPrep}
  allowHalves={allowHalves}
  maxPerDose={3}
/>

// Visual grid:
// | Time Slot | Tablets | Dose      |
// |-----------|---------|-----------|
// | 6am       | [1.5]   | = 150mg   |
// | 10am      | [1  ]   | = 100mg   |
// | 2pm       | [1  ]   | = 100mg   |
// | 6pm       | [1.5]   | = 150mg   |
// |-----------|---------|-----------|
// | TOTAL     | 5       | = 500mg   |
```

### 3.3 View Components (Multi-Medication Support)

#### WeeklyView (Primary for PD - most useful)

For multi-medication regimens, the weekly view shows all medications in a stacked, color-coded format:

```tsx
<WeeklyView
  regimen={regimen}
  calculatedSchedule={calculatedSchedule}
  startDate={weekStart}
  timeSlots={timeSlots}
/>

// SINGLE MEDICATION Layout:
// Week of Jan 20, 2025               [< Prev] [Next >]
//
// |         | Mon 20 | Tue 21 | Wed 22 | Thu 23 | Fri 24 | Sat 25 | Sun 26 |
// |---------|--------|--------|--------|--------|--------|--------|--------|
// | 6am     |  1     |  1     |  1     |  1.5 ↑ |  1.5   |  1.5   |  1.5   |
// | 10am    |  1     |  1     |  1     |  1     |  1     |  1     |  1     |
// | 2pm     |  1     |  1     |  1     |  1     |  1     |  1     |  1     |
// | 6pm     |  1     |  1     |  1     |  1     |  1     |  1     |  1     |
// |---------|--------|--------|--------|--------|--------|--------|--------|
// | Daily   | 400mg  | 400mg  | 400mg  | 450mg  | 450mg  | 450mg  | 450mg  |
//
// Legend: ↑ = increased from previous day
//
// Tick to confirm taken: [✓] [✓] [✓] [ ] [ ] [ ] [ ]


// MULTI-MEDICATION Layout (Cross-Titration Example):
// Week of Jan 20, 2025 - Agonist to Levodopa Switch     [< Prev] [Next >]
//
// ┌─────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
// │         │ Mon 20 │ Tue 21 │ Wed 22 │ Thu 23 │ Fri 24 │ Sat 25 │ Sun 26 │
// ├─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
// │ 6am     │        │        │        │        │        │        │        │
// │ ■ Sifrol│  1     │  1     │  1     │  0.5 ↓ │  0.5   │  0.5   │  0.5   │
// │ ■ Sinem │  0.5   │  0.5   │  0.5   │  1   ↑ │  1     │  1     │  1     │
// ├─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
// │ 10am    │        │        │        │        │        │        │        │
// │ ■ Sifrol│  1     │  1     │  1     │  1     │  1     │  1     │  0.5 ↓ │
// │ ■ Sinem │  0.5   │  0.5   │  0.5   │  0.5   │  0.5   │  0.5   │  1   ↑ │
// ├─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
// │ 2pm     │        │        │        │        │        │        │        │
// │ ■ Sifrol│  1     │  1     │  1     │  1     │  1     │  1     │  1     │
// │ ■ Sinem │  0.5   │  0.5   │  0.5   │  0.5   │  0.5   │  0.5   │  0.5   │
// ├─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
// │ 6pm     │        │        │        │        │        │        │        │
// │ ■ Sifrol│  1     │  1     │  1     │  1     │  1     │  1     │  1     │
// │ ■ Sinem │  0.5   │  0.5   │  0.5   │  0.5   │  0.5   │  0.5   │  0.5   │
// ├─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
// │ DAILY   │        │        │        │        │        │        │        │
// │ ■ Sifrol│ 4 tabs │ 4 tabs │ 4 tabs │ 3.5 ↓  │ 3.5    │ 3.5    │ 3   ↓  │
// │ ■ Sinem │ 2 tabs │ 2 tabs │ 2 tabs │ 2.5 ↑  │ 2.5    │ 2.5    │ 3   ↑  │
// │ L-Equiv │ 200mg  │ 200mg  │ 200mg  │ 250mg  │ 250mg  │ 250mg  │ 300mg  │
// └─────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
//
// Legend: ■ Sifrol 0.25mg (purple)  ■ Sinemet 100/25mg (blue)
//         ↑ increased  ↓ decreased  L-Equiv = Levodopa equivalent
//
// Confirm day completed: [✓] [✓] [✓] [ ] [ ] [ ] [ ]
```

#### DailyView (Detailed single day - Multi-Medication)

```tsx
<DailyView
  dayDose={selectedRegimenDayDose}
  regimen={regimen}
  timeSlots={timeSlots}
/>

// MULTI-MEDICATION Daily View:
// ┌───────────────────────────────────────────────────────────────────┐
// │ Thursday, January 23, 2025                                        │
// │ Dopamine Agonist to Levodopa Switch - Day 4                       │
// ├───────────────────────────────────────────────────────────────────┤
// │                                                                   │
// │  6am Dose                                                         │
// │  ┌──────────────────────────────────────────────────────────────┐│
// │  │ ■ Sifrol 0.25mg:    0.5 tablet (0.125mg)    ↓ DECREASED  [ ] ││
// │  │ ■ Sinemet 100/25:   1 tablet (100mg)        ↑ INCREASED  [ ] ││
// │  └──────────────────────────────────────────────────────────────┘│
// │                                                                   │
// │  10am Dose                                                        │
// │  ┌──────────────────────────────────────────────────────────────┐│
// │  │ ■ Sifrol 0.25mg:    1 tablet (0.25mg)       ─ unchanged  [ ] ││
// │  │ ■ Sinemet 100/25:   0.5 tablet (50mg)       ─ unchanged  [ ] ││
// │  └──────────────────────────────────────────────────────────────┘│
// │                                                                   │
// │  2pm Dose                                                         │
// │  ┌──────────────────────────────────────────────────────────────┐│
// │  │ ■ Sifrol 0.25mg:    1 tablet (0.25mg)       ─ unchanged  [ ] ││
// │  │ ■ Sinemet 100/25:   0.5 tablet (50mg)       ─ unchanged  [ ] ││
// │  └──────────────────────────────────────────────────────────────┘│
// │                                                                   │
// │  6pm Dose                                                         │
// │  ┌──────────────────────────────────────────────────────────────┐│
// │  │ ■ Sifrol 0.25mg:    1 tablet (0.25mg)       ─ unchanged  [ ] ││
// │  │ ■ Sinemet 100/25:   0.5 tablet (50mg)       ─ unchanged  [ ] ││
// │  └──────────────────────────────────────────────────────────────┘│
// │                                                                   │
// ├───────────────────────────────────────────────────────────────────┤
// │ DAILY TOTALS                                                      │
// │ ■ Sifrol:    3.5 tablets (0.875mg)   ↓ -0.5 from yesterday       │
// │ ■ Sinemet:   2.5 tablets (250mg)     ↑ +0.5 from yesterday       │
// │ ─────────────────────────────────────────────────────────────    │
// │ Levodopa Equivalent: ~338mg (Sinemet 250mg + Sifrol equiv 88mg)  │
// └───────────────────────────────────────────────────────────────────┘
```

#### TimelineView (NEW - Visual Titration Progression)

A new view specifically designed for visualizing multi-medication cross-titrations:

```tsx
<TimelineView
  regimen={regimen}
  calculatedSchedule={calculatedSchedule}
/>

// Visual Timeline showing dose changes over time:
//
// Dopamine Agonist to Levodopa Switch
// Jan 20 - Feb 28, 2025
//
// Daily Total (tablets)
// │
// 6├                                          ┌───────────────
// │                              ┌────────────┘ Sinemet
// 5├                    ┌────────┘
// │          ┌──────────┘
// 4├─────────┴─────────────────────────────────────────────── Sifrol (starting)
// │  ─────────┐
// 3├          └─────────┐
// │                     └─────────┐
// 2├                              └─────────┐
// │                                         └─────────┐
// 1├                                                  └────── Sifrol (ending)
// │
// 0├─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬────
//   Wk1   Wk2   Wk3   Wk4   Wk5   Wk6   Wk7   Wk8   Wk9   Wk10
//
// Legend: ═══ Sifrol 0.25mg    ─── Sinemet 100/25mg
//
// Key Changes:
// • Week 1: Start Sinemet 0.5 tab QID (200mg/day)
// • Week 2: Increase Sinemet to 1 tab QID, decrease Sifrol to 0.5 tab QID
// • Week 4: Sinemet 1.5 tab QID, Sifrol 0.25 tab QID
// • Week 6: Discontinue Sifrol, Sinemet 2 tab QID maintenance
```

#### CalendarView (Month overview - Multi-Medication)

Adapts existing `DoseCalendarView` component with multi-medication color coding:

```
// Calendar cell for multi-medication day:
// ┌─────────────┐
// │     23      │
// │ ■ S: 3.5    │  (Sifrol)
// │ ■ L: 2.5    │  (Levodopa)
// │ ↓↑ change   │
// └─────────────┘
```

#### SummaryView (Multi-Medication Preparation totals)

```tsx
<SummaryView
  regimen={regimen}
  calculatedSchedule={calculatedSchedule}
  dateRange={{ start, end }}
/>

// Shows:
// ═══════════════════════════════════════════════════════════════════
// REGIMEN SUMMARY: Dopamine Agonist to Levodopa Switch
// Jan 20 - Mar 31, 2025 (71 days)
// ═══════════════════════════════════════════════════════════════════
//
// ■ SIFROL (Pramipexole) 0.25mg tablets
// ├─ Schedule: Titrating DOWN (discontinuing)
// ├─ Starting: 4 tablets/day (1mg)
// ├─ Ending: 0 tablets/day (discontinued Week 8)
// ├─ Total tablets needed: 168 tablets
// ├─ Half tablets needed: 56 half-doses
// └─ Boxes needed: 3 boxes (60/box)
//
// ■ SINEMET (Levodopa/Carbidopa) 100/25mg tablets
// ├─ Schedule: Titrating UP
// ├─ Starting: 2 tablets/day (200mg levodopa)
// ├─ Ending: 6 tablets/day (600mg levodopa)
// ├─ Total tablets needed: 312 tablets
// ├─ Half tablets needed: 42 half-doses
// └─ Boxes needed: 6 boxes (60/box)
//
// ═══════════════════════════════════════════════════════════════════
// CROSS-TITRATION SUMMARY
// ═══════════════════════════════════════════════════════════════════
// • Sifrol decreasing synchronized with Sinemet increasing
// • Changes occur every 7 days
// • Sync mode: Same day (both change together)
//
// Titration Timeline:
// ┌──────────┬─────────────────┬─────────────────┬─────────────────┐
// │ Week     │ Sifrol          │ Sinemet         │ L-Equivalent    │
// ├──────────┼─────────────────┼─────────────────┼─────────────────┤
// │ 1        │ 1mg (4 tabs)    │ 200mg (2 tabs)  │ 300mg           │
// │ 2        │ 0.75mg (3 tabs) │ 300mg (3 tabs)  │ 375mg           │
// │ 3        │ 0.5mg (2 tabs)  │ 400mg (4 tabs)  │ 450mg           │
// │ 4        │ 0.25mg (1 tab)  │ 500mg (5 tabs)  │ 525mg           │
// │ 5        │ 0mg (stopped)   │ 600mg (6 tabs)  │ 600mg           │
// └──────────┴─────────────────┴─────────────────┴─────────────────┘
//
// ═══════════════════════════════════════════════════════════════════
// DISPENSING NOTES
// ═══════════════════════════════════════════════════════════════════
// • Patient will need overlapping supply of both medications
// • Recommend dispensing Sifrol in smaller quantities (2-week supply)
//   as dose decreases to avoid wastage
// • Sinemet quantity can be increased as titration progresses
```

---

## 4. UX/UI Best Practices

### 4.1 Visual Hierarchy

1. **Clear dose times** - Large, prominent time labels
2. **Change indicators** - Visual arrows/colors for increases/decreases
3. **Daily totals** - Always visible
4. **Warning states** - Red borders for doses exceeding max

### 4.2 Color Coding

```typescript
const DOSE_CHANGE_COLORS = {
  increase: 'text-green-600 bg-green-50',
  decrease: 'text-orange-600 bg-orange-50',
  unchanged: 'text-gray-600',
  atMax: 'text-red-600 bg-red-50',
};
```

### 4.3 Responsive Design

- **Mobile**: Single column, swipe between days
- **Tablet**: 3-4 day view
- **Desktop**: Full week view with sidebar

### 4.4 Accessibility

- Keyboard navigation through dose grid
- Screen reader announcements for dose changes
- High contrast mode support
- Touch targets ≥44px

### 4.5 Patient-Friendly Print Output

#### Single Medication Print Layout
```
┌─────────────────────────────────────────────────────────────┐
│ MEDICATION SCHEDULE                                          │
│ Patient: John Smith                                          │
│ Prepared: 22 Jan 2025 by [Pharmacist Name]                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ SINEMET 100/25mg TABLETS                                    │
│                                                              │
│ Week of Monday 20 January:                                  │
│                                                              │
│          Mon    Tue    Wed    Thu    Fri    Sat    Sun      │
│  6am     1      1      1      1½     1½     1½     1½       │
│ 10am     1      1      1      1      1      1      1        │
│  2pm     1      1      1      1      1      1      1        │
│  6pm     1      1      1      1      1      1      1        │
│ ─────────────────────────────────────────────────────       │
│ TOTAL    4      4      4      4½     4½     4½     4½       │
│                                                              │
│ ☐ Check box when taken                                       │
│                                                              │
│ Note: ½ = half tablet. Sinemet tablets can be halved.       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Multi-Medication Print Layout (Cross-Titration)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ MEDICATION SCHEDULE - DOPAMINE AGONIST TO LEVODOPA SWITCH               │
│ Patient: John Smith                    DOB: 15/03/1955                  │
│ Prepared: 22 Jan 2025 by [Pharmacist Name]                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ MEDICATIONS IN THIS SCHEDULE:                                            │
│ • SIFROL (Pramipexole) 0.25mg tablets - DECREASING                      │
│ • SINEMET (Levodopa/Carbidopa) 100/25mg tablets - INCREASING            │
│                                                                          │
│ ═══════════════════════════════════════════════════════════════════════ │
│ WEEK 1: Monday 20 January - Sunday 26 January                           │
│ ═══════════════════════════════════════════════════════════════════════ │
│                                                                          │
│          │ Mon 20 │ Tue 21 │ Wed 22 │ Thu 23 │ Fri 24 │ Sat 25 │ Sun 26│
│ ─────────┼────────┼────────┼────────┼────────┼────────┼────────┼───────│
│ 6am      │        │        │        │        │        │        │       │
│  Sifrol  │   1    │   1    │   1    │   ½  ↓ │   ½    │   ½    │   ½   │
│  Sinemet │   ½    │   ½    │   ½    │   1  ↑ │   1    │   1    │   1   │
│ ─────────┼────────┼────────┼────────┼────────┼────────┼────────┼───────│
│ 10am     │        │        │        │        │        │        │       │
│  Sifrol  │   1    │   1    │   1    │   1    │   1    │   1    │   1   │
│  Sinemet │   ½    │   ½    │   ½    │   ½    │   ½    │   ½    │   ½   │
│ ─────────┼────────┼────────┼────────┼────────┼────────┼────────┼───────│
│ 2pm      │        │        │        │        │        │        │       │
│  Sifrol  │   1    │   1    │   1    │   1    │   1    │   1    │   1   │
│  Sinemet │   ½    │   ½    │   ½    │   ½    │   ½    │   ½    │   ½   │
│ ─────────┼────────┼────────┼────────┼────────┼────────┼────────┼───────│
│ 6pm      │        │        │        │        │        │        │       │
│  Sifrol  │   1    │   1    │   1    │   1    │   1    │   1    │   1   │
│  Sinemet │   ½    │   ½    │   ½    │   ½    │   ½    │   ½    │   ½   │
│ ─────────┼────────┼────────┼────────┼────────┼────────┼────────┼───────│
│ DAILY    │        │        │        │        │        │        │       │
│  Sifrol  │ 4 tabs │ 4 tabs │ 4 tabs │ 3½ ↓   │ 3½     │ 3½     │ 3½    │
│  Sinemet │ 2 tabs │ 2 tabs │ 2 tabs │ 2½ ↑   │ 2½     │ 2½     │ 2½    │
│ ═════════╪════════╪════════╪════════╪════════╪════════╪════════╪═══════│
│ Day done │   ☐    │   ☐    │   ☐    │   ☐    │   ☐    │   ☐    │   ☐   │
│                                                                          │
│ ═══════════════════════════════════════════════════════════════════════ │
│ WEEK 2: Monday 27 January - Sunday 2 February                           │
│ ═══════════════════════════════════════════════════════════════════════ │
│ [Similar layout continues...]                                            │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ NOTES:                                                                   │
│ • ½ = half tablet                                                        │
│ • ↓ = dose DECREASED from previous day                                   │
│ • ↑ = dose INCREASED from previous day                                   │
│ • Sifrol tablets can be halved (scored)                                  │
│ • Sinemet tablets can be halved (scored)                                 │
│ • Take Sinemet 30 minutes before meals for best absorption               │
│                                                                          │
│ CHANGES SUMMARY:                                                         │
│ • Thursday 23 Jan: Sifrol 6am dose decreases, Sinemet 6am dose increases │
│ • [Further changes listed...]                                            │
│                                                                          │
│ CONTACT: [Pharmacy details] if you have any questions                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Additional Recommendations

### 5.1 Features Not Initially Requested (Consider Adding)

1. **Medication Interactions Warning**
   - Flag potential timing conflicts (e.g., protein meals with levodopa)
   - Iron/calcium separation reminders
   - MAO-B + serotonergic drug warnings

2. **Wearing Off Tracking**
   - Optional diary for patient to record wearing off times
   - Helps optimize dose timing and identify need for COMT inhibitor

3. **Levodopa Equivalent Dose (LED) Calculator**
   - Automatically calculate total daily LED across all medications
   - Useful for assessing overall dopaminergic load
   - Reference: Tomlinson CL et al. Movement Disorders 2010

4. **Dose Change History / Audit Log**
   - Log of all titration changes with timestamps
   - Useful for clinic reviews and medication reconciliation
   - Export to clinical notes format

5. **Reminder Integration**
   - Generate calendar entries (.ics export)
   - QR code linking to online schedule
   - SMS/notification reminders (future integration)

6. **Symptom Tracking Integration**
   - Optional: track ON/OFF periods
   - Dyskinesia scoring
   - Correlate symptoms with dose timing

### 5.2 Safety Features

1. **Maximum dose warnings** - Alert when approaching max daily
2. **Titration speed warnings** - Flag rapid titrations
3. **Drug-specific guidance** - Show medication's titrationGuidance
4. **Halving validation** - Prevent invalid half-tablet selections

### 5.3 Data Persistence Options

1. **Local Storage** - Save schedules locally
2. **Export/Import JSON** - Share between devices
3. **PDF Export** - Permanent record

---

## 6. Implementation Phases

### Phase 1: Core Foundation (Types & Data)
1. Create `src/types/parkinsonsMedications.ts` with:
   - Australian medication database (all PBS-listed PD meds)
   - Pre-determined `canBeHalved` flags
   - Multi-medication regimen types
   - Cross-titration link types
   - Regimen templates
2. Add helper functions for medication/preparation queries

### Phase 2: Single Medication Calculator
3. Build `pdScheduleCalculator.ts` for single medication
4. Implement titration logic (increase/decrease/sequential)
5. Create unit tests for calculation accuracy

### Phase 3: Basic UI Components
6. Build `PDMedicationSelector` (category-grouped)
7. Build `PDPreparationPicker` (with halving badges)
8. Build `PDTimeSlotConfig` (1-8 slots with custom labels)
9. Build `PDDoseEntryGrid` (tablet count entry)

### Phase 4: Single Medication Flow
10. Create 5-step wizard for single medication titration
11. Build basic `PDWeeklyView` (single medication)
12. Build basic `PDDailyView`
13. Integrate with existing calendar infrastructure

### Phase 5: Multi-Medication Support
14. Build `pdRegimenCalculator.ts` for multi-medication
15. Implement cross-titration synchronization logic
16. Create `RegimenTemplateSelector` component
17. Build medication list manager (add/remove/reorder)
18. Build `CrossTitrationLinker` component

### Phase 6: Multi-Medication Views
19. Extend `PDWeeklyView` for multi-medication (color-coded)
20. Extend `PDDailyView` for stacked medications
21. Build `PDTimelineView` (visual titration progression)
22. Extend `PDSummaryView` for multi-medication totals
23. Add levodopa equivalent calculations

### Phase 7: Optimization Engine
24. Implement "Optimise for me" algorithm
25. Add smart preparation selection
26. Optimize cross-titration scheduling

### Phase 8: Polish & Output
27. Add print/PDF export (single and multi-med layouts)
28. Implement checkboxes for dose tracking
29. Add safety warnings (max dose, rapid titration, interactions)
30. Responsive design refinement (mobile/tablet/desktop)
31. Save/Load regimen functionality (localStorage + JSON export)

---

## 7. Technical Notes

### Reuse from Existing Codebase

| Component/Utility | Source | Adaptation Needed |
|-------------------|--------|-------------------|
| WizardStepper | `ui/WizardStepper.tsx` | None |
| Calendar | `ui/Calendar.tsx` | Minor |
| calculateTabletBreakdown | `dose-calculation/preparations.ts` | Adapt for PD |
| DoseCalendarView | `dose-calculator/DoseCalendarView.tsx` | Significant |
| DateInput | `ui/DateInput.tsx` | None |
| Form components | `ui/Form.tsx` | None |

### New Components Needed

1. `PDMedicationSelector` - Category-grouped medication picker
2. `PDPreparationPicker` - Preparation selector with badges
3. `PDTimeSlotConfig` - 1-8 slot configurator
4. `PDDoseEntryGrid` - Tablet count entry grid
5. `PDWeeklyView` - Primary schedule view
6. `PDDailyView` - Single day detail view
7. `PDSummaryView` - Totals and projections

### State Management

Use React Hook Form + Zod for form state, matching existing patterns:

```typescript
const pdTitrationSchema = z.object({
  medicationId: z.string().min(1),
  preparationId: z.string().min(1),
  timeSlots: z.array(timeSlotSchema).min(1).max(8),
  startingDoses: z.array(slotDoseSchema),
  titrationConfig: titrationConfigSchema.optional(),
  // ...
});
```

---

## Summary

This plan creates a specialized Parkinson's Disease Titration Tool that:

1. **Leverages existing architecture** - Reuses types, utilities, and UI patterns from the Variable Dose Planner
2. **Handles PD complexity** - Up to 8 daily doses with flexible timing
3. **Is Australian-specific** - Pre-populated with PBS-listed preparations and pre-determined halving rules
4. **Supports multi-medication regimens** - Core feature for real-world PD management:
   - Hold steady + introduce new medication
   - Cross-titration (one up, one down synchronized)
   - Multiple independent titrations
   - Common scenario templates
5. **Removes user burden** - Pre-determined halving rules, smart optimization, regimen templates
6. **Provides clear output** - Multiple views optimized for different use cases:
   - **WeeklyView** - Primary view, color-coded multi-med grid
   - **TimelineView** - Visual titration progression (new)
   - **DailyView** - Detailed per-dose breakdown
   - **SummaryView** - Preparation totals, dispensing notes
7. **Is patient-friendly** - Printable schedules with checkboxes, levodopa equivalent tracking
8. **Is extensible** - Can add interaction warnings, symptom tracking, LED calculator

The **WeeklyView** is recommended as the primary display, showing all medications color-coded with clear change indicators. The **TimelineView** is particularly valuable for cross-titration scenarios, giving clinicians and patients a visual understanding of how medications will change over time.

### Key Multi-Medication Scenarios Supported

| Scenario | Example | Medications |
|----------|---------|-------------|
| Add adjunct | Add entacapone to existing levodopa | Levodopa (hold) + Entacapone (intro) |
| Cross-titration | Agonist to levodopa switch | Pramipexole (↓) + Levodopa (↑) |
| Formulation switch | IR to CR levodopa | Sinemet (↓) + Sinemet CR (↑) |
| Reduce for ADRs | Reduce agonist, compensate with levodopa | Ropinirole (↓) + Levodopa (↑) |
| Complex regimen | Multiple adjustments | 3+ medications, various modes |
