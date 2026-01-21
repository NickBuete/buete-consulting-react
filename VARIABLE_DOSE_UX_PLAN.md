# Variable Dose UX/UI Improvement Plan

## Executive Summary

The current variable dose modal and calendar view are functionally accurate but suffer from:
1. **Information overload** - All options shown regardless of relevance
2. **Dense, traditional form layout** - Not modern or intuitive
3. **Small calendar tiles** - Limited readability, especially with multiple medications
4. **No progressive disclosure** - Users see complexity before understanding basics

---

## Current Pain Points

### Medication Form Dialog Issues

1. **All fields visible at once**
   - Preparation tracking section shown even when not needed
   - Schedule-specific fields visible before user chooses schedule type
   - Multiple dose times options create visual noise

2. **Confusing flow**
   - User must scroll through irrelevant options
   - No clear visual hierarchy guiding them through the form
   - Dense grid layouts feel overwhelming

3. **Dated design patterns**
   - Traditional form layout with stacked fields
   - No visual grouping or separation of concerns
   - Gray background sections blend together

### Calendar View Issues

1. **Small tiles** (`min-h-[100px]`)
   - Limited space for medication details
   - Text truncation with `truncate` class loses information
   - Multiple medications per day become cramped

2. **Poor information density**
   - Tablet breakdown text at `text-[10px]` is hard to read
   - Dose time labels compete with dose values
   - Legend takes space but provides minimal value in context

3. **Limited navigation**
   - Only month-by-month navigation
   - No jump-to-date functionality
   - No zoom/expand view for detailed days

---

## Proposed Solutions

### Phase 1: Progressive Disclosure Modal Redesign

#### 1.1 Step-based Wizard Pattern
Replace single scrolling form with a multi-step wizard:

```
Step 1: Basic Info
├── Medication name
├── Unit selection
└── Quick schedule type selector (visual cards)

Step 2: Schedule Configuration
├── Dynamic based on schedule type
├── Only relevant fields shown
└── Live preview of first few doses

Step 3: Preparations (Optional)
├── Skip button prominent
├── Only shown if needed
└── Optimization preview

Step 4: Review & Confirm
├── Summary view
├── Calendar preview
└── Edit links back to each step
```

#### 1.2 Visual Schedule Type Selector
Replace dropdown with visual cards:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   ↗ Linear  │  │  ↻ Cyclic   │  │ 📅 Weekly   │  │ 📊 Multi    │
│             │  │             │  │             │  │    Phase    │
│  Gradual    │  │  X on, Y    │  │  Different  │  │  Custom     │
│  increase   │  │  off        │  │  per day    │  │  phases     │
│  /decrease  │  │             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

#### 1.3 Conditional Field Visibility

**Linear Titration:**
- Show "Direction" first
- If "Maintain" → hide change amount, min/max
- If "Increase/Decrease" → show relevant fields
- Multiple dose times → expand only when toggled

**Preparation Tracking:**
- Default to collapsed/hidden
- "Add tablet tracking" button reveals options
- Optimization auto-calculated in background

#### 1.4 Modern Form Patterns

- Larger touch targets (min 44px)
- Grouped related fields with clear labels
- Inline validation with friendly messages
- Smart defaults that reduce input needed
- Tooltips with `?` icons for complex fields

### Phase 2: Enhanced Calendar View

#### 2.1 Larger, More Readable Tiles

```css
/* Current */
min-h-[100px]

/* Proposed */
min-h-[140px] md:min-h-[160px]
```

#### 2.2 Expandable Day Detail

Click/tap a day to expand:
```
┌────────────────────────────────┐
│ Thursday, January 23          │
├────────────────────────────────┤
│ Prednisolone                   │
│ ├── Mane: 25mg (1 x 25mg tab) │
│ ├── Nocte: 12.5mg (½ x 25mg)  │
│ └── Total: 37.5mg              │
├────────────────────────────────┤
│ Methotrexate                   │
│ └── Once: 15mg                 │
└────────────────────────────────┘
```

#### 2.3 View Mode Options

Add toggle for different views:
- **Compact** - Current behavior (for quick overview)
- **Detailed** - Larger tiles, full breakdown
- **List** - Daily list view (better for printing)
- **Week** - Week-at-a-glance with larger columns

#### 2.4 Improved Navigation

- Month dropdown for quick jumping
- "Jump to start" / "Jump to end" buttons
- Keyboard navigation (arrow keys)
- "Today" indicator even when out of range

#### 2.5 Better Information Hierarchy

```
┌─────────────────────────────┐
│ 23                          │  <- Larger date
│ ┌─────────────────────────┐ │
│ │ 💊 Prednisolone         │ │  <- Medication with icon
│ │ M: 25mg  N: 12.5mg      │ │  <- Compact dose times
│ │ ─────────────────────── │ │
│ │ Total: 37.5mg           │ │  <- Clear total
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Phase 3: Interaction Improvements

#### 3.1 Quick Actions
- Duplicate medication with modifications
- Copy schedule to clipboard
- Share/export individual medication

#### 3.2 Inline Editing
- Click dose in calendar to quick-edit
- Drag to extend/shorten schedule
- Context menu for common actions

#### 3.3 Visual Feedback
- Success animations on save
- Progress indicator during calculation
- Validation feedback in real-time

---

## Implementation Priority

### High Priority (Phase 1a)
1. Wizard-style modal with steps
2. Visual schedule type selector cards
3. Conditional field visibility
4. Larger calendar tiles

### Medium Priority (Phase 1b)
5. Expandable day detail panel
6. View mode toggle (compact/detailed)
7. Improved navigation controls

### Lower Priority (Phase 2)
8. Inline calendar editing
9. Drag interactions
10. Advanced export options

---

## Technical Approach

### Modal Refactor
- Create `MedicationFormWizard.tsx` as new component
- Use internal state machine for step navigation
- Keep existing section components, wrap in wizard steps
- Add transition animations between steps

### Calendar Enhancements
- Add `calendarViewMode` state: 'compact' | 'detailed' | 'list'
- Create `CalendarDayDetail.tsx` modal/panel component
- Increase base tile sizing with responsive breakpoints
- Add `DoseCalendarControls.tsx` for view options

### Shared Components Needed
- `WizardStepper` - Step indicator component
- `ScheduleTypeCard` - Visual selector card
- `ExpandableSection` - Collapsible field group
- `DayDetailPanel` - Side panel or modal for day detail

---

## Design Tokens

```typescript
// Suggested spacing/sizing updates
const calendarTokens = {
  tileMinHeight: {
    compact: '100px',
    default: '140px',
    detailed: '180px',
  },
  fontSize: {
    date: 'text-lg',      // up from text-sm
    medName: 'text-sm',   // same
    doseValue: 'text-sm', // up from text-xs
    breakdown: 'text-xs', // up from text-[10px]
  },
  spacing: {
    tilePadding: 'p-3',   // up from p-2
    doseGap: 'gap-2',     // up from gap-1
  },
};
```

---

## Success Metrics

1. **Time to complete medication entry** - Target: 30% reduction
2. **User errors requiring correction** - Target: 50% reduction
3. **Calendar readability** - User testing for comprehension
4. **Mobile usability** - Touch target compliance (44px min)

---

## Next Steps

1. Review this plan and get feedback
2. Create wireframes/mockups for wizard flow
3. Implement Phase 1a (wizard + larger calendar)
4. User testing and iteration
5. Implement remaining phases based on feedback
